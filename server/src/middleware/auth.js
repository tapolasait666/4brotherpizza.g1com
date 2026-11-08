import { query } from '../db.js';
import { AppError } from '../lib/http.js';
import { COOKIE_NAME, verifyToken } from '../lib/auth.js';

// Loads the account on every authenticated request so a deleted user or a
// changed role takes effect immediately instead of living on inside the JWT.
export async function requireAuth(req, _res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new AppError(401, 'Please sign in to continue.');
    const payload = verifyToken(token);
    if (!payload?.sub) throw new AppError(401, 'Your session has expired. Please sign in again.');

    const { rows } = await query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [payload.sub],
    );
    if (!rows[0]) throw new AppError(401, 'Account no longer exists.');

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError(401, 'Please sign in to continue.'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action.'));
    }
    return next();
  };
}

export const requireAdmin = [requireAuth, requireRole('ADMIN')];
export const requireStaff = [requireAuth, requireRole('ADMIN', 'STAFF')];
