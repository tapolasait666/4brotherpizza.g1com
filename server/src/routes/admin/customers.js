import { Router } from 'express';
import { query } from '../../db.js';
import { asyncHandler } from '../../lib/http.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

router.get(
  '/customers',
  asyncHandler(async (req, res) => {
    const search = String(req.query.search || '').trim();
    const params = [];
    let where = `WHERE u.role = 'CUSTOMER'`;
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (u.name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)`;
    }

    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at,
              count(o.id)::int AS order_count,
              coalesce(sum(CASE WHEN o.status <> 'CANCELLED' THEN o.total ELSE 0 END), 0) AS total_spent,
              max(o.created_at) AS last_order_at
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id
         ${where}
         GROUP BY u.id
         ORDER BY u.created_at DESC`,
      params,
    );

    res.json({
      customers: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        createdAt: row.created_at,
        orderCount: row.order_count,
        totalSpent: Number(row.total_spent),
        lastOrderAt: row.last_order_at,
      })),
    });
  }),
);

export default router;
