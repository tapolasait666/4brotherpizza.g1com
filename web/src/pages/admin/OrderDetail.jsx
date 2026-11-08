import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, RefreshCw, ShoppingBag, User } from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatDateTime, formatPKR, NEXT_ACTIONS, STATUS_LABELS } from '../../lib/format.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import PageLoader from '../../components/Spinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { lastEvent } = useOutletContext() || {};
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyStatus, setBusyStatus] = useState('');

  const load = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const data = await api.get(`/admin/orders/${id}`);
        setOrder(data.order);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    if (!lastEvent?.receivedAt || lastEvent.orderId !== id) return;
    load(false);
  }, [lastEvent?.receivedAt, lastEvent?.orderId, id, load]);

  const changeStatus = async (status) => {
    if (status === 'CANCELLED' && !window.confirm('Cancel this order? This cannot be undone.')) {
      return;
    }
    setBusyStatus(status);
    try {
      const data = await api.patch(`/admin/orders/${id}/status`, { status });
      setOrder(data.order);
      toast.success(`Order moved to ${STATUS_LABELS[status]}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyStatus('');
    }
  };

  if (loading) return <PageLoader label="Loading order…" />;
  if (error || !order) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-red-300">{error || 'Order not found.'}</p>
        <Link to="/admin/orders" className="btn btn-outline btn-sm mt-4">
          Back to orders
        </Link>
      </div>
    );
  }

  const actions = NEXT_ACTIONS[order.status] || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/admin/orders" className="text-xs text-gray-400 hover:text-brand-yellow">
            ← All orders
          </Link>
          <h1 className="mt-1 font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="text-xs text-gray-400">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} className="px-3 py-1.5 text-xs" />
          <StatusBadge status={order.paymentStatus} payment className="px-3 py-1.5 text-xs" />
          <button type="button" onClick={() => load(true)} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {actions.length ? (
        <div className="card flex flex-wrap gap-2 p-4">
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={Boolean(busyStatus)}
              onClick={() => changeStatus(action.status)}
              className={`btn btn-sm ${
                action.tone === 'primary'
                  ? 'btn-primary'
                  : action.tone === 'danger'
                    ? 'btn-danger'
                    : 'btn-outline'
              }`}
            >
              {busyStatus === action.status ? 'Updating…' : action.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-gray-400">
          {order.status === 'DELIVERED'
            ? 'This order is complete. No further status changes are possible.'
            : 'This order was cancelled. No further status changes are possible.'}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase text-white">
            <ShoppingBag size={17} className="text-brand-yellow" /> Items
          </h2>
          <ul className="mt-4 divide-y divide-white/5">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × {formatPKR(item.unitPrice)}
                  </p>
                </div>
                <span className="font-semibold text-gray-200">{formatPKR(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-gray-400">
              <dt>Subtotal</dt>
              <dd className="text-white">{formatPKR(order.subtotal)}</dd>
            </div>
            {order.discount > 0 ? (
              <div className="flex justify-between text-green-400">
                <dt>Discount {order.couponCode ? `(${order.couponCode})` : ''}</dt>
                <dd>-{formatPKR(order.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between text-gray-400">
              <dt>Delivery fee</dt>
              <dd className="text-white">{formatPKR(order.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
              <dt>Total</dt>
              <dd className="font-heading text-xl text-brand-yellow">{formatPKR(order.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-gray-500">
            Payment: {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Card'} · Provider
            reference: {order.payments[0]?.providerRef || '—'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase text-white">
              <User size={17} className="text-brand-yellow" /> Customer
            </h2>
            <p className="mt-3 text-sm font-semibold text-white">{order.customerName}</p>
            <p className="text-xs text-gray-400">{order.customerEmail}</p>
            <a
              href={`tel:${order.customerPhone.replace(/[^+\d]/g, '')}`}
              className="mt-2 flex items-center gap-2 text-xs text-brand-yellow hover:underline"
            >
              <Phone size={13} /> {order.customerPhone}
            </a>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="flex items-start gap-2 text-xs text-gray-300">
                <MapPin size={13} className="mt-0.5 shrink-0 text-brand-yellow" />
                {order.deliveryAddress}
              </p>
              {order.deliveryNotes ? (
                <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-400">
                  Note: {order.deliveryNotes}
                </p>
              ) : null}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-heading text-lg font-bold uppercase text-white">Status history</h2>
            <ul className="mt-3 space-y-2.5">
              {order.events.map((event) => (
                <li key={event.id} className="flex items-start gap-2.5 text-xs">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-yellow" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{STATUS_LABELS[event.status]}</p>
                    {event.note ? <p className="text-gray-500">{event.note}</p> : null}
                  </div>
                  <span className="shrink-0 text-[10px] text-gray-500">
                    {formatDateTime(event.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-yellow">
        <ArrowLeft size={13} /> Back to all orders
      </Link>
    </div>
  );
}
