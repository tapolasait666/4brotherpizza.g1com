import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../../db.js';
import { asyncHandler, AppError, parse, slugify } from '../../lib/http.js';
import { requireAdmin } from '../../middleware/auth.js';
import { toCategory, toProduct } from '../../lib/serializers.js';

const router = Router();
router.use(requireAdmin);

async function uniqueSlug(base, table, db = { query }, excludeId = null) {
  const root = slugify(base) || 'item';
  let candidate = root;
  for (let i = 1; i < 50; i += 1) {
    const params = [candidate];
    let sql = `SELECT id FROM ${table} WHERE slug = $1`;
    if (excludeId) {
      params.push(excludeId);
      sql += ' AND id <> $2';
    }
    const { rows } = await db.query(sql, params);
    if (!rows[0]) return candidate;
    candidate = `${root}-${i + 1}`;
  }
  return `${root}-${Date.now()}`;
}

/* ------------------------------- products ------------------------------- */

const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required.').max(120),
  categoryId: z.string().uuid('Choose a category.'),
  description: z.string().trim().max(1200).optional().default(''),
  price: z.coerce.number().min(0, 'Price cannot be negative.').max(1_000_000),
  comparePrice: z
    .union([z.coerce.number().min(0).max(1_000_000), z.null()])
    .optional(),
  imageUrl: z.string().trim().max(600).optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  prepTimeMinutes: z.coerce.number().int().min(0).max(300).default(20),
  tags: z.array(z.string().trim().max(40)).max(10).default([]),
});

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const search = String(req.query.search || '').trim();
    const params = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE p.name ILIKE $1`;
    }
    const { rows } = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         ${where}
        ORDER BY c.sort_order NULLS LAST, p.name`,
      params,
    );
    res.json({ products: rows.map(toProduct) });
  }),
);

router.post(
  '/products',
  asyncHandler(async (req, res) => {
    const data = parse(productSchema, req.body);
    const category = await query('SELECT id FROM categories WHERE id = $1', [data.categoryId]);
    if (!category.rows[0]) throw new AppError(400, 'Choose a valid category.');

    const slug = await uniqueSlug(data.name, 'products');
    const { rows } = await query(
      `INSERT INTO products (
         name, slug, category_id, description, price, compare_price, image_url,
         is_available, is_featured, prep_time_minutes, tags
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *, (SELECT name FROM categories WHERE id = $3) AS category_name`,
      [
        data.name,
        slug,
        data.categoryId,
        data.description || '',
        data.price,
        data.comparePrice ?? null,
        data.imageUrl || null,
        data.isAvailable,
        data.isFeatured,
        data.prepTimeMinutes,
        data.tags,
      ],
    );
    res.status(201).json({ product: toProduct(rows[0]) });
  }),
);

router.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const data = parse(productSchema, req.body);
    const { rows } = await query(
      `UPDATE products SET
         name = $1, category_id = $2, description = $3, price = $4, compare_price = $5,
         image_url = $6, is_available = $7, is_featured = $8, prep_time_minutes = $9,
         tags = $10, updated_at = now()
       WHERE id = $11
       RETURNING *, (SELECT name FROM categories WHERE id = $2) AS category_name`,
      [
        data.name,
        data.categoryId,
        data.description || '',
        data.price,
        data.comparePrice ?? null,
        data.imageUrl || null,
        data.isAvailable,
        data.isFeatured,
        data.prepTimeMinutes,
        data.tags,
        req.params.id,
      ],
    );
    if (!rows[0]) throw new AppError(404, 'Product not found.');
    res.json({ product: toProduct(rows[0]) });
  }),
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (!rowCount) throw new AppError(404, 'Product not found.');
    res.json({ ok: true });
  }),
);

/* ------------------------------ categories ------------------------------ */

const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required.').max(80),
  description: z.string().trim().max(400).optional().default(''),
  imageUrl: z.string().trim().max(600).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT c.*, count(p.id)::int AS product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.sort_order, c.name`,
    );
    res.json({ categories: rows.map(toCategory) });
  }),
);

router.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const data = parse(categorySchema, req.body);
    const slug = await uniqueSlug(data.name, 'categories');
    const { rows } = await query(
      `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.name, slug, data.description || '', data.imageUrl || null, data.sortOrder, data.isActive],
    );
    res.status(201).json({ category: toCategory(rows[0]) });
  }),
);

router.put(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const data = parse(categorySchema, req.body);
    const { rows } = await query(
      `UPDATE categories SET name = $1, description = $2, image_url = $3,
              sort_order = $4, is_active = $5
        WHERE id = $6 RETURNING *`,
      [
        data.name,
        data.description || '',
        data.imageUrl || null,
        data.sortOrder,
        data.isActive,
        req.params.id,
      ],
    );
    if (!rows[0]) throw new AppError(404, 'Category not found.');
    res.json({ category: toCategory(rows[0]) });
  }),
);

router.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    await withTransaction(async (client) => {
      const { rowCount } = await client.query('DELETE FROM categories WHERE id = $1', [
        req.params.id,
      ]);
      if (!rowCount) throw new AppError(404, 'Category not found.');
    });
    res.json({ ok: true });
  }),
);

export default router;
