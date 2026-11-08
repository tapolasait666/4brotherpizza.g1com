import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { asyncHandler, AppError, parse } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';
import { toOrder } from '../lib/serializers.js';
import { createOrder, loadOrder, evaluateCoupon } from '../services/orders.js';
import { subscribe } from '../services/events.js';

const router = Router();

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid item.'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1.').max(50),
      }),
    )
    .min(1, 'Your cart is empty.'),
  customerName: z.string().trim().min(2, 'Enter the name for this order.').max(80),
  customerEmail: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  customerPhone: z
    .string()
    .trim()
    .min(7, 'Enter a contact phone number.')
    .max(25)
    .regex(/^[0-9+()\-\s]+$/, 'Enter a valid phone number.'),
  deliveryAddress: z.string().trim().min(10, 'Enter your full delivery address.').max(400),
  deliveryNotes: z.string().trim().max(400).optional().or(z.literal('')),
  couponCode: z.string().trim().max(40).optional().or(z.literal('')),
  paymentMethod: z.enum(['COD', 'CARD']).default('COD'),
});

async function serializeById(id) {
  const full = await loadOrder(id);
  if (!full) throw new AppError(404, 'Order not found.');
  return toOrder(full.row, full.items, full.events, full.payments);
}

router.post(
  '/orders',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = parse(orderSchema, req.body);
    const orderId = await createOrder(req.user, data);
    const order = await serializeById(orderId);
    res.status(201).json({ order });
  }),
);

router.get(
  '/orders',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT o.*, c.code AS coupon_code,
              coalesce(sum(oi.quantity), 0)::int AS item_count
         FROM orders o
         LEFT JOIN coupons c ON c.id = o.coupon_id
         LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = $1
        GROUP BY o.id, c.code
        ORDER BY o.created_at DESC`,
      [req.user.id],
    );
    res.json({
      orders: rows.map((row) => ({
        ...toOrder(row),
        itemCount: row.item_count,
        items: [],
        events: [],
        payments: [],
      })),
    });
  }),
);

router.get(
  '/orders/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const full = await loadOrder(req.params.id);
    if (!full) throw new AppError(404, 'Order not found.');
    const isOwner = full.row.user_id === req.user.id;
    const isStaff = req.user.role === 'ADMIN' || req.user.role === 'STAFF';
    if (!isOwner && !isStaff) throw new AppError(403, 'You cannot view this order.');
    res.json({ order: toOrder(full.row, full.items, full.events, full.payments) });
  }),
);

router.post(
  '/coupons/validate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      code: z.string().trim().min(1, 'Enter a coupon code.'),
      subtotal: z.number().nonnegative(),
    });
    const data = parse(schema, req.body);
    const result = await evaluateCoupon(data.code, data.subtotal);
    res.json({
      code: result.coupon.code,
      description: result.coupon.description,
      discount: result.discount,
    });
  }),
);

// Authenticated SSE stream. Staff get new-order and status events; customers
// only receive events for their own orders.
router.get('/stream', requireAuth, (req, res) => {
  subscribe(req, res, req.user);
});

export default router;
