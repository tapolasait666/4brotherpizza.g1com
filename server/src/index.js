import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import siteRoutes from './routes/site.js';
import adminRoutes from './routes/admin/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    // The API only returns JSON; the SPA is served by Vite. Uploaded images are
    // requested cross-path from the same origin, so no restrictive directives
    // are needed here.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

fs.mkdirSync(config.uploadDir, { recursive: true });
app.use(
  '/uploads',
  express.static(config.uploadDir, {
    maxAge: '7d',
    fallthrough: true,
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: '4b-pizza-api', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', siteRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', notFound);
app.use(errorHandler);

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`[api] listening on 0.0.0.0:${config.port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
