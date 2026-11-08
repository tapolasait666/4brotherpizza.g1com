import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler, AppError } from '../lib/http.js';
import { toCategory, toProduct } from '../lib/serializers.js';

const router = Router();

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT c.*, count(p.id) FILTER (WHERE p.is_available) AS product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
        WHERE c.is_active = true
        GROUP BY c.id
        ORDER BY c.sort_order, c.name`,
    );
    res.json({ categories: rows.map(toCategory) });
  }),
);

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const { category, search, featured } = req.query;
    const conditions = ['p.is_available = true', 'c.is_active = true'];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`c.slug = $${params.length}`);
    }
    if (search) {
      params.push(`%${String(search).trim()}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }
    if (featured === 'true') {
      conditions.push('p.is_featured = true');
    }

    const { rows } = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         JOIN categories c ON c.id = p.category_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY p.is_featured DESC, p.name`,
      params,
    );
    res.json({ products: rows.map(toProduct) });
  }),
);

router.get(
  '/products/:slug',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         JOIN categories c ON c.id = p.category_id
        WHERE p.slug = $1`,
      [req.params.slug],
    );
    if (!rows[0]) throw new AppError(404, 'That item is not on the menu.');
    res.json({ product: toProduct(rows[0]) });
  }),
);

export default router;
