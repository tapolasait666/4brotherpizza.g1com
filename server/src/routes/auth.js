import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../db.js';
import { asyncHandler, AppError, parse } from '../lib/http.js';
import { setAuthCookie, clearAuthCookie, signToken } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { toUser } from '../lib/serializers.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number.')
    .max(25)
    .regex(/^[0-9+()\-\s]+$/, 'Enter a valid phone number.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = parse(registerSchema, req.body);

    const existing = await query('SELECT id FROM users WHERE lower(email) = lower($1)', [
      data.email,
    ]);
    if (existing.rows[0]) {
      throw new AppError(409, 'An account with that email already exists. Please sign in.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const { rows } = await query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,'CUSTOMER')
       RETURNING id, name, email, phone, role, created_at`,
      [data.name, data.email, data.phone, passwordHash],
    );
    const user = rows[0];
    setAuthCookie(res, signToken(user));
    res.status(201).json({ user: toUser(user) });
  }),
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = parse(loginSchema, req.body);
    const { rows } = await query(
      'SELECT id, name, email, phone, role, password_hash, created_at FROM users WHERE lower(email) = lower($1)',
      [data.email],
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
      throw new AppError(401, 'Incorrect email or password.');
    }
    setAuthCookie(res, signToken(user));
    res.json({ user: toUser(user) });
  }),
);

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: toUser(req.user) });
  }),
);

export default router;
