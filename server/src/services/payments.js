import { config } from '../config.js';
import { AppError } from '../lib/http.js';

// Payment provider registry. Only providers whose configuration is present are
// offered to customers; an unconfigured provider is refused, never simulated.
//
// COD is settled by staff when the order is delivered (payment_status → PAID).
// CARD is wired to Stripe: orders can only be created through it once
// STRIPE_SECRET_KEY is configured, and a payment stays PENDING until Stripe
// confirms it (webhook / PaymentIntent status). No endpoint marks a card order
// as paid on the client's word.

const providers = {
  COD: {
    id: 'COD',
    label: 'Cash on Delivery',
    description: 'Pay the rider in cash when your order arrives.',
    enabled: () => true,
  },
  CARD: {
    id: 'CARD',
    label: 'Card payment',
    description:
      'Secure card payment via Stripe. Availability depends on the restaurant payment configuration.',
    enabled: () => Boolean(config.stripeSecretKey) && config.cardCheckoutEnabled,
  },
};

export function availableMethods() {
  return Object.values(providers)
    .filter((provider) => provider.enabled())
    .map(({ id, label, description }) => ({ id, label, description }));
}

export function assertMethodAvailable(method) {
  const provider = providers[method];
  if (!provider) throw new AppError(400, 'Unsupported payment method.');
  if (!provider.enabled()) {
    throw new AppError(
      503,
      'Card payments are not configured yet. Please choose cash on delivery or contact the restaurant.',
    );
  }
  return provider;
}

export function providerLabel(method) {
  return providers[method]?.label || method;
}
