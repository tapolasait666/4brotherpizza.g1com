import { useCallback, useEffect, useState } from 'react';
import { BadgePercent, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatDate, formatPKR } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../../components/Modal.jsx';

const EMPTY = {
  code: '',
  description: '',
  type: 'PERCENT',
  value: '',
  minOrder: 0,
  maxUses: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
};

function toLocalInput(value) {
  if (!value) return '';
  const date = new Date(value);
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export default function AdminCoupons() {
  const toast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.get('/admin/coupons');
      setCoupons(data.coupons);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: String(coupon.value),
      minOrder: coupon.minOrder,
      maxUses: coupon.maxUses ?? '',
      startsAt: toLocalInput(coupon.startsAt),
      expiresAt: toLocalInput(coupon.expiresAt),
      isActive: coupon.isActive,
    });
    setFormError('');
    setOpen(true);
  };

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = {
      code: form.code,
      description: form.description,
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder || 0),
      maxUses: form.maxUses === '' ? null : Number(form.maxUses),
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      isActive: Boolean(form.isActive),
    };
    try {
      if (editing) {
        await api.put(`/admin/coupons/${editing.id}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/admin/coupons', payload);
        toast.success('Coupon created');
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await api.del(`/admin/coupons/${coupon.id}`);
      setCoupons((current) => current.filter((item) => item.id !== coupon.id));
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
            Coupons &amp; Discounts
          </h1>
          <p className="text-xs text-gray-400">
            Applied at checkout with server-side validation and usage limits.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
          <Plus size={15} /> New coupon
        </button>
      </div>

      {error ? (
        <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-10 text-center">
            <BadgePercent size={24} className="mx-auto text-gray-600" />
            <p className="mt-2 text-sm text-gray-400">No coupons yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Minimum</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm font-bold text-brand-yellow">{coupon.code}</p>
                      <p className="max-w-[220px] truncate text-[11px] text-gray-500">
                        {coupon.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-200">
                      {coupon.type === 'PERCENT'
                        ? `${coupon.value}% off`
                        : `${formatPKR(coupon.value)} off`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatPKR(coupon.minOrder)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {coupon.usedCount} / {coupon.maxUses ?? '∞'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                          coupon.isActive
                            ? 'border-green-400/30 bg-green-400/10 text-green-300'
                            : 'border-red-400/30 bg-red-400/10 text-red-300'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(coupon)}
                          className="rounded-lg border border-white/15 p-2 text-gray-300 transition hover:border-brand-yellow hover:text-brand-yellow"
                          aria-label={`Edit ${coupon.code}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(coupon)}
                          className="rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10"
                          aria-label={`Delete ${coupon.code}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit coupon' : 'New coupon'}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              form="coupon-form"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create coupon'}
            </button>
          </>
        }
      >
        <form id="coupon-form" onSubmit={submit} className="space-y-4">
          {formError ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {formError}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="coupon-code">
                Code
              </label>
              <input
                id="coupon-code"
                className="input font-mono uppercase"
                value={form.code}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value.toUpperCase() })
                }
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="label" htmlFor="coupon-type">
                Type
              </label>
              <select
                id="coupon-type"
                className="input"
                value={form.type}
                onChange={update('type')}
              >
                <option value="PERCENT">Percentage off</option>
                <option value="FIXED">Fixed amount off</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="coupon-value">
                Value {form.type === 'PERCENT' ? '(%)' : '(Rs)'}
              </label>
              <input
                id="coupon-value"
                type="number"
                min="0.01"
                step="0.01"
                className="input"
                value={form.value}
                onChange={update('value')}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="coupon-min">
                Minimum order (Rs)
              </label>
              <input
                id="coupon-min"
                type="number"
                min="0"
                className="input"
                value={form.minOrder}
                onChange={update('minOrder')}
              />
            </div>
            <div>
              <label className="label" htmlFor="coupon-uses">
                Max uses (blank = unlimited)
              </label>
              <input
                id="coupon-uses"
                type="number"
                min="1"
                className="input"
                value={form.maxUses}
                onChange={update('maxUses')}
              />
            </div>
            <div>
              <label className="label" htmlFor="coupon-active">
                Status
              </label>
              <label className="flex h-[46px] items-center gap-2 text-sm text-gray-300">
                <input
                  id="coupon-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={update('isActive')}
                  className="h-4 w-4 accent-[#FFC800]"
                />
                Active
              </label>
            </div>
            <div>
              <label className="label" htmlFor="coupon-start">
                Starts (optional)
              </label>
              <input
                id="coupon-start"
                type="datetime-local"
                className="input"
                value={form.startsAt}
                onChange={update('startsAt')}
              />
            </div>
            <div>
              <label className="label" htmlFor="coupon-expiry">
                Expires (optional)
              </label>
              <input
                id="coupon-expiry"
                type="datetime-local"
                className="input"
                value={form.expiresAt}
                onChange={update('expiresAt')}
              />
            </div>
            <div className="col-span-2">
              <label className="label" htmlFor="coupon-description">
                Description
              </label>
              <input
                id="coupon-description"
                className="input"
                value={form.description}
                onChange={update('description')}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
