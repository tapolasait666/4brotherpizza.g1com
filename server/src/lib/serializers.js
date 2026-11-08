import { money } from '../lib/http.js';

export function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function toCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    productCount: row.product_count !== undefined ? Number(row.product_count) : undefined,
  };
}

export function toProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: money(row.price),
    comparePrice: row.compare_price === null ? null : money(row.compare_price),
    imageUrl: row.image_url,
    categoryId: row.category_id,
    categoryName: row.category_name || null,
    categorySlug: row.category_slug || null,
    isAvailable: row.is_available,
    isFeatured: row.is_featured,
    prepTimeMinutes: row.prep_time_minutes,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCoupon(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    type: row.type,
    value: money(row.value),
    minOrder: money(row.min_order),
    maxUses: row.max_uses,
    usedCount: row.used_count,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    isActive: row.is_active,
  };
}

export function toOrder(row, items = [], events = [], payments = []) {
  if (!row) return null;
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    deliveryAddress: row.delivery_address,
    deliveryNotes: row.delivery_notes,
    subtotal: money(row.subtotal),
    discount: money(row.discount),
    deliveryFee: money(row.delivery_fee),
    total: money(row.total),
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    couponCode: row.coupon_code || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      unitPrice: money(item.unit_price),
      quantity: item.quantity,
      lineTotal: money(item.line_total),
    })),
    events: events.map((event) => ({
      id: event.id,
      status: event.status,
      note: event.note,
      createdAt: event.created_at,
    })),
    payments: payments.map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      providerRef: payment.provider_ref,
      amount: money(payment.amount),
      status: payment.status,
      createdAt: payment.created_at,
    })),
  };
}

export function toSettings(row) {
  if (!row) return null;
  return {
    name: row.name,
    tagline: row.tagline,
    phone: row.phone,
    altPhone: row.alt_phone,
    email: row.email,
    address: row.address,
    deliveryFee: money(row.delivery_fee),
    minOrder: money(row.min_order),
    currency: row.currency,
    openTime: row.open_time,
    closeTime: row.close_time,
    isOpen: row.is_open,
    paymentProvider: row.payment_provider,
  };
}

export function toMessage(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}
