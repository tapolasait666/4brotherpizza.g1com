import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://pizza:pizza_dev_pw@localhost:5432/pizza',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-4b-pizza-secret',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@4brothers.pk').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@4B2025',
  uploadDir: process.env.UPLOAD_DIR || path.join(here, '..', 'uploads'),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  // Card checkout is only offered once the full provider flow (Stripe Elements +
  // webhook confirmation) is wired and explicitly switched on. Without this the
  // storefront only sells cash-on-delivery orders — no simulated payments.
  cardCheckoutEnabled: process.env.PAYMENTS_CARD_CHECKOUT === 'true',
  isProduction: process.env.NODE_ENV === 'production',
};
