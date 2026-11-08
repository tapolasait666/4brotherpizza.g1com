import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../db.js';
import { asyncHandler, AppError, parse } from '../../lib/http.js';
import { requireStaff } from '../../middleware/auth.js';
import { toOrder } from '../../lib/serializers.js';
import { loadOrder, updateOrderStatus, ORDER_STATUSES } from '../../services/orders.js';

const router = Router();
router.use(requireStaff);

router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const status = String(req.query.status || '').trim();
    const search = String(req.query.search || '').trim();
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const conditions = [];
    const params = [];
    if (status && ORDER_STATUSES.includes(status)) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(o.order_number ILIKE $${params.length} OR o.customer_name ILIKE $${params.length}
          OR o.customer_phone ILIKE $${params.length} OR o.customer_email ILIKE $${params.length})`,
      );
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows, count] = await Promise.all([
      query(
        `SELECT o.*, c.code AS coupon_code, coalesce(sum(oi.quantity),0)::int AS item_count
           FROM orders o
           LEFT JOIN coupons c ON c.id = o.coupon_id
           LEFT JOIN order_items oi ON oi.order_id = o.id
           ${where}
          GROUP BY o.id, c.code
          ORDER BY o.created_at DESC
          LIMIT ${limit} OFFSET ${offset}`,
        params,
      ),
      query(`SELECT count(*)::int AS total FROM orders o ${where}`, params),
    ]);

    res.json({
      orders: rows.rows.map((row) => ({
        ...toOrder(row),
        itemCount: row.item_count,
        items: [],
        events: [],
        payments: [],
      })),
      total: count.rows[0].total,
    });
  }),
);

router.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const full = await loadOrder(req.params.id);
    if (!full) throw new AppError(404, 'Order not found.');
    res.json({ order: toOrder(full.row, full.items, full.events, full.payments) });
  }),
);

router.patch(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      status: z.enum(ORDER_STATUSES),
      note: z.string().trim().max(300).optional().or(z.literal('')),
    });
    const data = parse(schema, req.body);
    await updateOrderStatus(req.params.id, data.status, data.note, req.user);
    const full = await loadOrder(req.params.id);
    res.json({ order: toOrder(full.row, full.items, full.events, full.payments) });
  }),
);

export default router;
