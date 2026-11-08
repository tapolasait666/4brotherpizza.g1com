import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../db.js';
import { asyncHandler, AppError, parse } from '../../lib/http.js';
import { requireAdmin } from '../../middleware/auth.js';
import { toSettings, toMessage } from '../../lib/serializers.js';
import { config } from '../../config.js';

const router = Router();
router.use(requireAdmin);

const settingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(120).default(''),
  phone: z.string().trim().min(3).max(30),
  altPhone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email(),
  address: z.string().trim().min(5).max(200),
  deliveryFee: z.coerce.number().min(0).max(10000),
  minOrder: z.coerce.number().min(0).max(100000),
  openTime: z.string().trim().max(20),
  closeTime: z.string().trim().max(20),
  isOpen: z.boolean(),
  paymentProvider: z.enum(['COD', 'CARD']),
});

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const { rows } = await query('SELECT * FROM restaurant_settings WHERE id = $1', ['default']);
    res.json({
      settings: toSettings(rows[0]),
      cardConfigured: Boolean(config.stripeSecretKey) && config.cardCheckoutEnabled,
    });
  }),
);

router.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const data = parse(settingsSchema, req.body);
    if (
      data.paymentProvider === 'CARD' &&
      !(config.stripeSecretKey && config.cardCheckoutEnabled)
    ) {
      throw new AppError(
        400,
        'Card payments need a complete Stripe configuration (keys and the card checkout switch) before they can be enabled.',
      );
    }
    const { rows } = await query(
      `UPDATE restaurant_settings SET
         name = $1, tagline = $2, phone = $3, alt_phone = $4, email = $5, address = $6,
         delivery_fee = $7, min_order = $8, open_time = $9, close_time = $10,
         is_open = $11, payment_provider = $12, updated_at = now()
       WHERE id = 'default' RETURNING *`,
      [
        data.name,
        data.tagline || '',
        data.phone,
        data.altPhone || '',
        data.email,
        data.address,
        data.deliveryFee,
        data.minOrder,
        data.openTime,
        data.closeTime,
        data.isOpen,
        data.paymentProvider,
      ],
    );
    res.json({ settings: toSettings(rows[0]) });
  }),
);

router.get(
  '/messages',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200',
    );
    res.json({ messages: rows.map(toMessage) });
  }),
);

router.patch(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const schema = z.object({ isRead: z.boolean() });
    const data = parse(schema, req.body);
    const { rows } = await query(
      'UPDATE contact_messages SET is_read = $1 WHERE id = $2 RETURNING *',
      [data.isRead, req.params.id],
    );
    if (!rows[0]) throw new AppError(404, 'Message not found.');
    res.json({ message: toMessage(rows[0]) });
  }),
);

router.delete(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const { rowCount } = await query('DELETE FROM contact_messages WHERE id = $1', [
      req.params.id,
    ]);
    if (!rowCount) throw new AppError(404, 'Message not found.');
    res.json({ ok: true });
  }),
);

export default router;
