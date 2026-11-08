import { AppError } from '../lib/http.js';

export function notFound(_req, _res, next) {
  next(new AppError(404, 'The requested resource was not found.'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }
  if (err?.code === '23505') {
    return res.status(409).json({ error: 'That record already exists.' });
  }
  if (err?.code === '23503') {
    return res.status(409).json({ error: 'This record is still referenced by other data.' });
  }
  if (err?.code === '22P02') {
    return res.status(400).json({ error: 'Invalid identifier.' });
  }
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Image must be 5 MB or smaller.' });
  }
  console.error('[api] unhandled error:', err);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
