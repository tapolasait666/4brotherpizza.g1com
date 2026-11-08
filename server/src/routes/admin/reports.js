import { Router } from 'express';
import { query } from '../../db.js';
import { asyncHandler } from '../../lib/http.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

function range(query_) {
  const to = query_.to ? new Date(query_.to) : new Date();
  const from = query_.from ? new Date(query_.from) : new Date(Date.now() - 29 * 86400000);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

router.get(
  '/reports',
  asyncHandler(async (req, res) => {
    const { from, to } = range(req.query);

    const [totals, byStatus, byPayment, top, byDay] = await Promise.all([
      query(
        `SELECT
           count(*)::int AS orders,
           coalesce(sum(CASE WHEN status <> 'CANCELLED' THEN total ELSE 0 END), 0) AS sales,
           coalesce(sum(CASE WHEN status = 'DELIVERED' THEN total ELSE 0 END), 0) AS delivered_revenue,
           coalesce(avg(CASE WHEN status <> 'CANCELLED' THEN total END), 0) AS average_order,
           count(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled
         FROM orders
        WHERE created_at >= $1 AND created_at <= $2`,
        [from, to],
      ),
      query(
        `SELECT status, count(*)::int AS count, coalesce(sum(total), 0) AS value
           FROM orders
          WHERE created_at >= $1 AND created_at <= $2
          GROUP BY status
          ORDER BY count DESC`,
        [from, to],
      ),
      query(
        `SELECT payment_method, count(*)::int AS count, coalesce(sum(total), 0) AS value
           FROM orders
          WHERE created_at >= $1 AND created_at <= $2 AND status <> 'CANCELLED'
          GROUP BY payment_method`,
        [from, to],
      ),
      query(
        `SELECT oi.name, sum(oi.quantity)::int AS quantity, sum(oi.line_total) AS revenue
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
          WHERE o.created_at >= $1 AND o.created_at <= $2 AND o.status <> 'CANCELLED'
          GROUP BY oi.name
          ORDER BY revenue DESC
          LIMIT 10`,
        [from, to],
      ),
      query(
        `SELECT to_char(d.day, 'YYYY-MM-DD') AS date,
                coalesce(sum(o.total), 0) AS revenue,
                count(o.id)::int AS orders
           FROM generate_series($1::date, $2::date, '1 day') AS d(day)
           LEFT JOIN orders o
             ON o.created_at >= d.day
            AND o.created_at < d.day + interval '1 day'
            AND o.status <> 'CANCELLED'
          GROUP BY d.day
          ORDER BY d.day`,
        [from, to],
      ),
    ]);

    res.json({
      range: { from, to },
      totals: {
        orders: totals.rows[0].orders,
        sales: Number(totals.rows[0].sales),
        deliveredRevenue: Number(totals.rows[0].delivered_revenue),
        averageOrder: Number(totals.rows[0].average_order),
        cancelled: totals.rows[0].cancelled,
      },
      byStatus: byStatus.rows.map((row) => ({ ...row, value: Number(row.value) })),
      byPayment: byPayment.rows.map((row) => ({ ...row, value: Number(row.value) })),
      topProducts: top.rows.map((row) => ({ ...row, revenue: Number(row.revenue) })),
      byDay: byDay.rows.map((row) => ({ ...row, revenue: Number(row.revenue) })),
    });
  }),
);

export default router;
