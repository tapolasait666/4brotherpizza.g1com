import { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import PageLoader from '../../components/Spinner.jsx';

export default function AdminSettings() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [cardConfigured, setCardConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/settings')
      .then((data) => {
        setForm(data.settings);
        setCardConfigured(data.cardConfigured);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = await api.put('/admin/settings', {
        ...form,
        deliveryFee: Number(form.deliveryFee),
        minOrder: Number(form.minOrder),
      });
      setForm(data.settings);
      toast.success('Restaurant settings saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading settings…" />;
  if (!form) {
    return <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
          Restaurant Settings
        </h1>
        <p className="text-xs text-gray-400">
          These values drive the storefront, delivery fee, opening hours and payment options.
        </p>
      </div>

      {error ? (
        <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      <form onSubmit={submit} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase text-white">
            <SettingsIcon size={17} className="text-brand-yellow" /> Identity & contact
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-name">
                Restaurant name
              </label>
              <input id="s-name" className="input" value={form.name} onChange={update('name')} required />
            </div>
            <div>
              <label className="label" htmlFor="s-tagline">
                Tagline
              </label>
              <input
                id="s-tagline"
                className="input"
                value={form.tagline}
                onChange={update('tagline')}
              />
            </div>
            <div>
              <label className="label" htmlFor="s-phone">
                Primary phone
              </label>
              <input id="s-phone" className="input" value={form.phone} onChange={update('phone')} required />
            </div>
            <div>
              <label className="label" htmlFor="s-altphone">
                Secondary phone
              </label>
              <input
                id="s-altphone"
                className="input"
                value={form.altPhone}
                onChange={update('altPhone')}
              />
            </div>
            <div>
              <label className="label" htmlFor="s-email">
                Email
              </label>
              <input
                id="s-email"
                type="email"
                className="input"
                value={form.email}
                onChange={update('email')}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="s-address">
                Address
              </label>
              <input
                id="s-address"
                className="input"
                value={form.address}
                onChange={update('address')}
                required
              />
            </div>
          </div>

          <h2 className="border-t border-white/10 pt-4 font-heading text-lg font-bold uppercase text-white">
            Ordering & delivery
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-fee">
                Delivery fee (Rs)
              </label>
              <input
                id="s-fee"
                type="number"
                min="0"
                className="input"
                value={form.deliveryFee}
                onChange={update('deliveryFee')}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="s-min">
                Minimum order (Rs)
              </label>
              <input
                id="s-min"
                type="number"
                min="0"
                className="input"
                value={form.minOrder}
                onChange={update('minOrder')}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="s-open">
                Opens at
              </label>
              <input id="s-open" className="input" value={form.openTime} onChange={update('openTime')} />
            </div>
            <div>
              <label className="label" htmlFor="s-close">
                Closes at
              </label>
              <input
                id="s-close"
                className="input"
                value={form.closeTime}
                onChange={update('closeTime')}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isOpen}
                onChange={update('isOpen')}
                className="h-4 w-4 accent-[#FFC800]"
              />
              Restaurant is accepting online orders
            </label>
          </div>

          <h2 className="border-t border-white/10 pt-4 font-heading text-lg font-bold uppercase text-white">
            Payments
          </h2>
          <div>
            <label className="label" htmlFor="s-provider">
              Default payment provider
            </label>
            <select
              id="s-provider"
              className="input"
              value={form.paymentProvider}
              onChange={update('paymentProvider')}
            >
              <option value="COD">Cash on delivery</option>
              <option value="CARD" disabled={!cardConfigured}>
                Card payment {cardConfigured ? '(Stripe configured)' : '— not configured'}
              </option>
            </select>
            <p className="mt-2 text-[11px] text-gray-500">
              {cardConfigured
                ? 'Stripe keys are present. Card payments appear at checkout and are never marked paid without provider confirmation.'
                : 'Card payments stay hidden until the full Stripe checkout integration is configured and switched on. Cash on delivery is active.'}
            </p>
          </div>

          <div className="flex justify-end border-t border-white/10 pt-4">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-heading text-lg font-bold uppercase text-white">Storefront preview</h2>
            <p className="mt-2 text-sm text-gray-300">{form.name}</p>
            <p className="text-xs text-brand-yellow">{form.tagline}</p>
            <dl className="mt-3 space-y-2 text-xs text-gray-400">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <dt>Helpline</dt>
                <dd className="text-gray-200">{form.phone}</dd>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <dt>Hours</dt>
                <dd className="text-gray-200">
                  {form.openTime} – {form.closeTime}
                </dd>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <dt>Delivery</dt>
                <dd className="text-gray-200">Rs {form.deliveryFee}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Minimum</dt>
                <dd className="text-gray-200">Rs {form.minOrder}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-brand-yellow/25 bg-brand-yellow/10 p-5 text-xs text-gray-300">
            <p className="font-heading text-base font-bold uppercase text-brand-yellow">
              Payment architecture
            </p>
            <p className="mt-1">
              Orders record a payment row with the chosen provider. Cash orders settle to paid when
              staff mark the order delivered. Card payments require a configured Stripe key and stay
              pending until the provider confirms — nothing is simulated.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
