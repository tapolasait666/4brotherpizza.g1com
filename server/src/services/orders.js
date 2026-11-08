import { query, withTransaction } from '../db.js';
import { AppError, money } from '../lib/http.js';
import { publish } from './events.js';
import { assertMethodAvailable } from './payments.js';

export const ORDER_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export const STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const TRANSITIONS = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

export async function loadOrder(orderId, db = { query }) {
  const { rows } = await db.query(
    `SELECT o.*, c.code AS coupon_code
       FROM orders o
       LEFT JOIN coupons c ON c.id = o.coupon_id
      WHERE o.id = $1`,
    [orderId],
  );
  if (!rows[0]) return null;
  const [items, events, payments] = await Promise.all([
    db.query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY name', [orderId]),
    db.query(
      'SELECT * FROM order_status_events WHERE order_id = $1 ORDER BY created_at ASC',
      [orderId],
    ),
    db.query('SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at ASC', [orderId]),
  ]);
  return {
    row: rows[0],
    items: items.rows,
    events: events.rows,
    payments: payments.rows,
  };
}

export async function evaluateCoupon(code, subtotal, db = { query }) {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) return null;

  const { rows } = await db.query('SELECT * FROM coupons WHERE lower(code) = lower($1)', [
    normalized,
  ]);
  const coupon = rows[0];
  if (!coupon || !coupon.is_active) throw new AppError(400, 'That coupon code is not valid.');

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    throw new AppError(400, 'That coupon is not active yet.');
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    throw new AppError(400, 'That coupon has expired.');
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    throw new AppError(400, 'That coupon has reached its usage limit.');
  }
  if (subtotal < Number(coupon.min_order)) {
    throw new AppError(
      400,
      `This coupon needs a minimum order of Rs ${Number(coupon.min_order).toLocaleString('en-PK')}.`,
    );
  }

  const raw =
    coupon.type === 'PERCENT'
      ? (subtotal * Number(coupon.value)) / 100
      : Number(coupon.value);
  const discount = money(Math.min(raw, subtotal));

  return { coupon, discount };
}

async function nextOrderNumber(client) {
  const { rows } = await client.query(
    `SELECT '4B-' || to_char(now(), 'YYMMDD') || '-' || nextval('order_number_seq') AS number`,
  );
  return rows[0].number;
}

export async function createOrder(user, payload) {
  const method = payload.paymentMethod || 'COD';
  const provider = assertMethodAvailable(method);

  const created = await withTransaction(async (client) => {
    const productIds = payload.items.map((item) => item.productId);
    const { rows: products } = await client.query(
      `SELECT id, name, price, is_available FROM products WHERE id = ANY($1::uuid[])`,
      [productIds],
    );
    const byId = new Map(products.map((product) => [product.id, product]));

    const lines = payload.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) throw new AppError(400, 'One of the items is no longer on the menu.');
      if (!product.is_available) {
        throw new AppError(400, `${product.name} is currently unavailable.`);
      }
      const unitPrice = money(product.price);
      return {
        productId: product.id,
        name: product.name,
        unitPrice,
        quantity: item.quantity,
        lineTotal: money(unitPrice * item.quantity),
      };
    });

    const subtotal = money(lines.reduce((sum, line) => sum + line.lineTotal, 0));

    const settingsRes = await client.query(
      'SELECT delivery_fee, min_order, is_open FROM restaurant_settings WHERE id = $1',
      ['default'],
    );
    const settings = settingsRes.rows[0] || { delivery_fee: 0, min_order: 0, is_open: true };
    if (!settings.is_open) {
      throw new AppError(
        409,
        'The restaurant is not accepting online orders right now. Please try again later or call us.',
      );
    }
    if (subtotal < Number(settings.min_order)) {
      throw new AppError(
        400,
        `Minimum order for delivery is Rs ${Number(settings.min_order).toLocaleString('en-PK')}.`,
      );
    }
    const deliveryFee = money(settings.delivery_fee);

    const couponResult = await evaluateCoupon(payload.couponCode, subtotal, client);
    const discount = couponResult ? couponResult.discount : 0;
    const total = money(subtotal - discount + deliveryFee);

    const orderNumber = await nextOrderNumber(client);

    const inserted = await client.query(
      `INSERT INTO orders (
         order_number, user_id, customer_name, customer_email, customer_phone,
         delivery_address, delivery_notes, subtotal, discount, delivery_fee, total,
         status, payment_method, payment_status, coupon_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'PENDING',$12,'PENDING',$13)
       RETURNING *`,
      [
        orderNumber,
        user.id,
        payload.customerName,
        payload.customerEmail,
        payload.customerPhone,
        payload.deliveryAddress,
        payload.deliveryNotes || null,
        subtotal,
        discount,
        deliveryFee,
        total,
        method,
        couponResult ? couponResult.coupon.id : null,
      ],
    );

    const order = inserted.rows[0];

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, unit_price, quantity, line_total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, line.productId, line.name, line.unitPrice, line.quantity, line.lineTotal],
      );
    }

    await client.query(
      `INSERT INTO order_status_events (order_id, status, note, created_by)
       VALUES ($1, 'PENDING', 'Order placed', $2)`,
      [order.id, user.id],
    );

    await client.query(
      `INSERT INTO payments (order_id, provider, amount, status)
       VALUES ($1, $2, $3, 'PENDING')`,
      [order.id, provider.id, total],
    );

    if (couponResult) {
      await client.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = $1', [
        couponResult.coupon.id,
      ]);
    }

    return order;
  });

  const full = await loadOrder(created.id);
  const order = {
    id: full.row.id,
    orderNumber: full.row.order_number,
    userId: full.row.user_id,
    status: full.row.status,
    total: money(full.row.total),
    customerName: full.row.customer_name,
    itemCount: full.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: full.row.created_at,
  };

  publish({ scope: 'admin', type: 'order.created', order });
  publish({
    scope: 'user',
    userId: full.row.user_id,
    type: 'order.created',
    orderId: full.row.id,
    orderNumber: full.row.order_number,
    status: full.row.status,
  });

  return created.id;
}

export async function updateOrderStatus(orderId, status, note, actor) {
  if (!ORDER_STATUSES.includes(status)) throw new AppError(400, 'Unknown order status.');

  const updated = await withTransaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [
      orderId,
    ]);
    const order = rows[0];
    if (!order) throw new AppError(404, 'Order not found.');
    if (order.status === status) throw new AppError(400, 'That is already the current status.');
    if (!canTransition(order.status, status)) {
      throw new AppError(
        400,
        `An order that is ${STATUS_LABELS[order.status]} cannot be moved to ${STATUS_LABELS[status]}.`,
      );
    }

    const paidOnDelivery = status === 'DELIVERED' && order.payment_method === 'COD';

    const updatedRes = await client.query(
      `UPDATE orders
          SET status = $1, updated_at = now(),
              payment_status = CASE WHEN $2 THEN 'PAID' ELSE payment_status END
        WHERE id = $3
        RETURNING *`,
      [status, paidOnDelivery, orderId],
    );

    if (paidOnDelivery) {
      await client.query(
        `UPDATE payments SET status = 'PAID', updated_at = now()
          WHERE order_id = $1 AND provider = 'COD'`,
        [orderId],
      );
    }
    if (status === 'CANCELLED') {
      await client.query(
        `UPDATE payments SET status = 'FAILED', updated_at = now()
          WHERE order_id = $1 AND status = 'PENDING'`,
        [orderId],
      );
    }

    await client.query(
      `INSERT INTO order_status_events (order_id, status, note, created_by)
       VALUES ($1,$2,$3,$4)`,
      [orderId, status, note || null, actor.id],
    );

    return updatedRes.rows[0];
  });

  publish({
    scope: 'admin',
    type: 'order.updated',
    orderId: updated.id,
    orderNumber: updated.order_number,
    status: updated.status,
  });
  publish({
    scope: 'user',
    userId: updated.user_id,
    type: 'order.updated',
    orderId: updated.id,
    orderNumber: updated.order_number,
    status: updated.status,
  });

  return updated;
}
