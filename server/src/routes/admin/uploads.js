import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { asyncHandler, AppError } from '../../lib/http.js';
import { requireAdmin } from '../../middleware/auth.js';
import { config } from '../../config.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const allowed = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const ext = allowed.get(file.mimetype) || '.jpg';
    cb(null, `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      cb(new AppError(400, 'Only JPG, PNG, WEBP or GIF images are supported.'));
      return;
    }
    cb(null, true);
  },
});

const router = Router();
router.use(requireAdmin);

router.post(
  '/uploads',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError(400, 'Choose an image to upload.');
    res.status(201).json({ url: `/uploads/${path.basename(req.file.filename)}` });
  }),
);

export default router;
