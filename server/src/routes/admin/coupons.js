import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../db.js';
import { asyncHandler, AppError, parse } from '../../lib/http.js';
import { requireAdmin } from '../../middleware/auth.js';
import { toCoupon } from '../../lib/serializers.js';

const router = Router();
router.use(requireAdmin);

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'Coupon code is required.')
    .max(30)
    .regex(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, dashes or underscores only.'),
  description: z.string().trim().max(200).optional().default(''),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.coerce.number().positive('Discount value must be greater than zero.'),
  minOrder: z.coerce.number().min(0).default(0),
  maxUses: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
});

router.get(
  '/coupons',
  asyncHandler(async (_req, res) => {
    const { rows } = await query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ coupons: rows.map(toCoupon) });
  }),
);

router.post(
  '/coupons',
  asyncHandler(async (req, res) => {
    const data = parse(couponSchema, req.body);
    if (data.type === 'PERCENT' && data.value > 100) {
      throw new AppError(400, 'A percentage discount cannot exceed 100%.');
    }
    const { rows } = await query(
      `INSERT INTO coupons (code, description, type, value, min_order, max_uses, starts_at, expires_at, is_active)
       VALUES (upper($1),$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        data.code,
        data.description || '',
        data.type,
        data.value,
        data.minOrder,
        data.maxUses ?? null,
        data.startsAt || null,
        data.expiresAt || null,
        data.isActive,
      ],
    );
    res.status(201).json({ coupon: toCoupon(rows[0]) });
  }),
);

router.put(
  '/coupons/:id',
  asyncHandler(async (req, res) => {
    const data = parse(couponSchema, req.body);
    if (data.type === 'PERCENT' && data.value > 100) {
      throw new AppError(400, 'A percentage discount cannot exceed 100%.');
    }
    const { rows } = await query(
      `UPDATE coupons SET code = upper($1), description = $2, type = $3, value = $4,
              min_order = $5, max_uses = $6, starts_at = $7, expires_at = $8, is_active = $9
        WHERE id = $10 RETURNING *`,
      [
        data.code,
        data.description || '',
        data.type,
        data.value,
        data.minOrder,
        data.maxUses ?? null,
        data.startsAt || null,
        data.expiresAt || null,
        data.isActive,
        req.params.id,
      ],
    );
    if (!rows[0]) throw new AppError(404, 'Coupon not found.');
    res.json({ coupon: toCoupon(rows[0]) });
  }),
);

router.delete(
  '/coupons/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM coupons WHERE id = $1', [req.params.id]);
    if (!rowCount) throw new AppError(404, 'Coupon not found.');
    res.json({ ok: true });
  }),
);

export default router;
