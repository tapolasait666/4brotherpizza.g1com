import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgePercent, CreditCard, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../lib/api.js';
import { formatPKR } from '../lib/format.js';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    deliveryAddress: '',
    deliveryNotes: '',
    paymentMethod: 'COD',
  });
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api
      .get('/settings/public')
      .then((data) => {
        setSettings(data.settings);
        setMethods(data.paymentMethods);
        const preferred =
          data.paymentMethods.find(
            (method) => method.id === data.settings.paymentProvider,
          ) || data.paymentMethods[0];
        if (preferred) {
          setForm((current) => ({ ...current, paymentMethod: preferred.id }));
        }
      })
      .catch(() => {});
  }, []);

  const deliveryFee = settings?.deliveryFee ?? 0;
  const discount = coupon?.discount || 0;
  const total = Math.max(subtotal - discount + deliveryFee, 0);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const applyCoupon = async (event) => {
    event.preventDefault();
    setCouponBusy(true);
    setCouponError('');
    try {
      const result = await api.post('/coupons/validate', {
        code: couponInput,
        subtotal,
      });
      setCoupon(result);
      toast.success(`Coupon ${result.code} applied — ${formatPKR(result.discount)} off`);
    } catch (err) {
      setCoupon(null);
      setCouponError(err.message);
    } finally {
      setCouponBusy(false);
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!items.length) return;
    setPlacing(true);
    setError('');
    try {
      const { order } = await api.post('/orders', {
        ...form,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        couponCode: coupon?.code || '',
      });
      clear();
      toast.success(`Order ${order.orderNumber} placed — we're on it!`);
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="card p-10">
          <p className="font-heading text-2xl font-bold uppercase text-white">Your cart is empty</p>
          <p className="mt-2 text-sm text-gray-400">Add something from the menu before checking out.</p>
          <Link to="/menu" className="btn btn-primary mt-5">
            Browse the menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-dark py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="chip">
          <ShieldCheck size={12} /> Secure checkout
        </span>
        <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase text-white sm:text-4xl">
          Checkout
        </h1>

        <form onSubmit={placeOrder} className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="card p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase text-white">
                <Truck size={17} className="text-brand-yellow" /> Delivery details
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="co-name">
                    Full name
                  </label>
                  <input
                    id="co-name"
                    className="input"
                    value={form.customerName}
                    onChange={update('customerName')}
                    required
                    minLength={2}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="co-phone">
                    Phone
                  </label>
                  <input
                    id="co-phone"
                    className="input"
                    value={form.customerPhone}
                    onChange={update('customerPhone')}
                    required
                    placeholder="+92 3xx xxxxxxx"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="co-email">
                    Email
                  </label>
                  <input
                    id="co-email"
                    type="email"
                    className="input"
                    value={form.customerEmail}
                    onChange={update('customerEmail')}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="co-address">
                    Delivery address
                  </label>
                  <textarea
                    id="co-address"
                    className="input min-h-[90px]"
                    value={form.deliveryAddress}
                    onChange={update('deliveryAddress')}
                    required
                    minLength={10}
                    placeholder="House / street, area, landmark, Quetta"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="co-notes">
                    Delivery notes (optional)
                  </label>
                  <input
                    id="co-notes"
                    className="input"
                    value={form.deliveryNotes}
                    onChange={update('deliveryNotes')}
                    placeholder="Extra spicy, call on arrival…"
                  />
                </div>
              </div>
            </div>

            <div className="card p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase text-white">
                <CreditCard size={17} className="text-brand-yellow" /> Payment method
              </h2>
              <div className="mt-4 space-y-2">
                {methods.length ? (
                  methods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                        form.paymentMethod === method.id
                          ? 'border-brand-yellow bg-brand-yellow/10'
                          : 'border-white/15 hover:border-white/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={form.paymentMethod === method.id}
                        onChange={update('paymentMethod')}
                        className="mt-0.5 accent-[#FFC800]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-white">{method.label}</span>
                        <span className="block text-xs text-gray-400">{method.description}</span>
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Loading payment methods…</p>
                )}
              </div>
              <p className="mt-3 text-[11px] text-gray-500">
                Card payments only appear when the restaurant has configured a payment provider.
                Cash on delivery is always available.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="card sticky top-28 p-5">
              <h2 className="font-heading text-xl font-bold uppercase text-white">Your order</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-3 text-gray-300">
                    <span className="min-w-0">
                      <span className="font-semibold text-white">{item.quantity}×</span>{' '}
                      <span className="align-middle">{item.name}</span>
                    </span>
                    <span className="shrink-0">{formatPKR(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-white/10 pt-4">
                <label className="label" htmlFor="coupon">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    className="input"
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponBusy || !couponInput}
                    className="btn btn-outline btn-sm shrink-0"
                  >
                    <BadgePercent size={14} /> Apply
                  </button>
                </div>
                {couponError ? <p className="mt-2 text-[11px] text-red-400">{couponError}</p> : null}
                {coupon ? (
                  <p className="mt-2 flex items-center justify-between text-[11px] text-green-400">
                    <span>{coupon.code} applied</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCoupon(null);
                        setCouponInput('');
                      }}
                      className="underline"
                    >
                      Remove
                    </button>
                  </p>
                ) : null}
              </div>

              <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-gray-400">
                  <dt>Subtotal</dt>
                  <dd className="text-white">{formatPKR(subtotal)}</dd>
                </div>
                {coupon ? (
                  <div className="flex justify-between text-green-400">
                    <dt>Discount</dt>
                    <dd>-{formatPKR(discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between text-gray-400">
                  <dt>Delivery fee</dt>
                  <dd className="text-white">{formatPKR(deliveryFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
                  <dt>Total</dt>
                  <dd className="font-heading text-xl text-brand-yellow">{formatPKR(total)}</dd>
                </div>
              </dl>

              {error ? (
                <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              ) : null}

              <button type="submit" className="btn btn-primary mt-4 w-full" disabled={placing}>
                <MapPin size={16} /> {placing ? 'Placing order…' : 'Place order'}
              </button>
              <p className="mt-2 text-center text-[11px] text-gray-500">
                You'll be able to track this order live.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
