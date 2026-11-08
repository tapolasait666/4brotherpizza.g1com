import { Router } from 'express';
import { query } from '../../db.js';
import { asyncHandler } from '../../lib/http.js';
import { requireStaff } from '../../middleware/auth.js';
import { toOrder, toSettings } from '../../lib/serializers.js';
import { todayRange } from '../../lib/http.js';

const router = Router();
router.use(requireStaff);

router.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const { start, end } = todayRange();
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);

    const { rows } = await query(
      `SELECT
         (SELECT count(*) FROM orders)::int AS total_orders,
         (SELECT count(*) FROM orders WHERE status = 'PENDING')::int AS pending_orders,
         (SELECT count(*) FROM orders WHERE status = 'DELIVERED')::int AS completed_orders,
         (SELECT count(*) FROM orders WHERE status IN ('ACCEPTED','PREPARING','READY','OUT_FOR_DELIVERY'))::int AS active_orders,
         (SELECT count(*) FROM users WHERE role = 'CUSTOMER')::int AS customers,
         (SELECT count(*) FROM products)::int AS products,
         (SELECT count(*) FROM contact_messages WHERE is_read = false)::int AS unread_messages,
         (SELECT coalesce(sum(total), 0) FROM orders
           WHERE status <> 'CANCELLED' AND created_at >= $1 AND created_at < $2) AS today_sales,
         (SELECT count(*) FROM orders WHERE created_at >= $1 AND created_at < $2)::int AS today_orders,
         (SELECT coalesce(sum(total), 0) FROM orders WHERE status = 'DELIVERED') AS total_revenue,
         (SELECT coalesce(sum(total), 0) FROM orders WHERE status = 'DELIVERED' AND created_at >= $3) AS month_revenue`,
      [start, end, monthStart],
    );
    const stats = rows[0];

    const [recent, byDay, top, settings, statusCounts] = await Promise.all([
      query(
        `SELECT o.*, coalesce(sum(oi.quantity),0)::int AS item_count
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
          GROUP BY o.id
          ORDER BY o.created_at DESC
          LIMIT 8`,
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
        [new Date(Date.now() - 13 * 86400000), new Date()],
      ),
      query(
        `SELECT oi.name,
                sum(oi.quantity)::int AS quantity,
                sum(oi.line_total) AS revenue
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
          WHERE o.status <> 'CANCELLED'
          GROUP BY oi.name
          ORDER BY revenue DESC
          LIMIT 5`,
      ),
      query('SELECT * FROM restaurant_settings WHERE id = $1', ['default']),
      query('SELECT status, count(*)::int AS count FROM orders GROUP BY status'),
    ]);

    res.json({
      stats: {
        totalOrders: stats.total_orders,
        pendingOrders: stats.pending_orders,
        completedOrders: stats.completed_orders,
        activeOrders: stats.active_orders,
        customers: stats.customers,
        products: stats.products,
        unreadMessages: stats.unread_messages,
        todaySales: Number(stats.today_sales),
        todayOrders: stats.today_orders,
        totalRevenue: Number(stats.total_revenue),
        monthRevenue: Number(stats.month_revenue),
      },
      recentOrders: recent.rows.map((row) => ({
        ...toOrder(row),
        itemCount: row.item_count,
        items: [],
        events: [],
        payments: [],
      })),
      salesByDay: byDay.rows.map((row) => ({
        date: row.date,
        revenue: Number(row.revenue),
        orders: row.orders,
      })),
      topProducts: top.rows.map((row) => ({
        name: row.name,
        quantity: row.quantity,
        revenue: Number(row.revenue),
      })),
      statusCounts: Object.fromEntries(
        statusCounts.rows.map((row) => [row.status, row.count]),
      ),
      settings: toSettings(settings.rows[0]),
    });
  }),
);

export default router;
