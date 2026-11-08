import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../db.js';
import { asyncHandler, parse } from '../lib/http.js';
import { toSettings } from '../lib/serializers.js';
import { availableMethods } from '../services/payments.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many messages sent. Please try again later.' },
});

router.get(
  '/settings/public',
  asyncHandler(async (_req, res) => {
    const { rows } = await query('SELECT * FROM restaurant_settings WHERE id = $1', ['default']);
    res.json({
      settings: toSettings(rows[0]),
      paymentMethods: availableMethods(),
    });
  }),
);

router.post(
  '/contact',
  contactLimiter,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().trim().min(2, 'Enter your name.').max(80),
      email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
      phone: z.string().trim().max(25).optional().or(z.literal('')),
      subject: z.string().trim().max(120).optional().or(z.literal('')),
      message: z.string().trim().min(10, 'Tell us a little more (10 characters minimum).').max(2000),
    });
    const data = parse(schema, req.body);
    await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES ($1,$2,$3,$4,$5)`,
      [data.name, data.email, data.phone || null, data.subject || 'General enquiry', data.message],
    );
    res.status(201).json({ ok: true, message: 'Thanks — the team will get back to you shortly.' });
  }),
);

export default router;
