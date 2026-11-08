import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { formatPKR } from '../lib/format.js';
import { useSiteSettings, FALLBACK_SETTINGS } from '../lib/useSiteSettings.js';
import { ImageWithFallback } from '../components/ProductCard.jsx';

export default function CartPage() {
  const { items, subtotal, count, setQuantity, remove, clear } = useCart();
  const data = useSiteSettings();
  const settings = data?.settings || FALLBACK_SETTINGS;
  const delivery = settings.deliveryFee;
  const total = subtotal + (subtotal > 0 ? delivery : 0);
  const belowMinimum = subtotal > 0 && subtotal < settings.minOrder;

  return (
    <div className="bg-brand-dark py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="chip">
              <ShoppingBag size={12} /> {count} item{count === 1 ? '' : 's'}
            </span>
            <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase text-white sm:text-4xl">
              Your Cart
            </h1>
          </div>
          <Link to="/menu" className="btn btn-outline btn-sm">
            <UtensilsCrossed size={14} /> Add more items
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow">
              <ShoppingBag size={24} />
            </span>
            <p className="mt-4 font-heading text-xl font-bold uppercase text-white">
              Your cart is empty
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Browse the menu and add your favourites — Crown Crust, Zingers and family deals.
            </p>
            <Link to="/menu" className="btn btn-primary mt-5">
              Explore the menu <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-8">
              {items.map((item) => (
                <div key={item.productId} className="card flex gap-4 p-3 sm:p-4">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-heading text-lg font-bold text-white">
                          {item.name}
                        </h2>
                        <p className="text-xs text-gray-400">{formatPKR(item.price)} each</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="shrink-0 rounded-lg p-1.5 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center rounded-lg border border-white/15 bg-white/5">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="p-2 text-gray-300 transition hover:text-brand-yellow"
                          aria-label={`Reduce ${item.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-8 text-center text-sm font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          className="p-2 text-gray-300 transition hover:text-brand-yellow"
                          aria-label={`Add another ${item.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-heading text-lg font-bold text-brand-yellow">
                        {formatPKR(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={clear}
                className="text-xs text-gray-500 underline transition hover:text-red-400"
              >
                Clear cart
              </button>
            </div>

            <div className="lg:col-span-4">
              <div className="card sticky top-28 p-5">
                <h2 className="font-heading text-xl font-bold uppercase text-white">
                  Order Summary
                </h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <dt>Subtotal</dt>
                    <dd className="text-white">{formatPKR(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <dt>Delivery fee</dt>
                    <dd className="text-white">{formatPKR(delivery)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
                    <dt>Total</dt>
                    <dd className="font-heading text-xl text-brand-yellow">{formatPKR(total)}</dd>
                  </div>
                </dl>

                {belowMinimum ? (
                  <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
                    Minimum order for delivery is {formatPKR(settings.minOrder)}. Add{' '}
                    {formatPKR(settings.minOrder - subtotal)} more to checkout.
                  </p>
                ) : null}

                <Link
                  to="/checkout"
                  className={`btn btn-primary mt-4 w-full ${
                    belowMinimum ? 'pointer-events-none opacity-50' : ''
                  }`}
                  aria-disabled={belowMinimum}
                >
                  Proceed to checkout <ArrowRight size={16} />
                </Link>
                <p className="mt-3 text-center text-[11px] text-gray-500">
                  Cash on delivery available · Coupons applied at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
