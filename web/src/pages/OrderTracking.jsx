import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Bike,
  Check,
  ChefHat,
  CircleDot,
  Clock,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { formatDateTime, formatPKR, STATUS_FLOW, STATUS_LABELS } from '../lib/format.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PageLoader from '../components/Spinner.jsx';

const STEP_ICONS = {
  PENDING: Clock,
  ACCEPTED: Check,
  PREPARING: ChefHat,
  READY: PackageCheck,
  OUT_FOR_DELIVERY: Bike,
  DELIVERED: CircleDot,
};

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [justUpdated, setJustUpdated] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get(`/orders/${id}`);
      setOrder(data.order);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const source = new EventSource('/api/stream', { withCredentials: true });
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.orderId === id) {
          setJustUpdated(true);
          load();
          setTimeout(() => setJustUpdated(false), 4000);
        }
      } catch {
        /* ignore keep-alive frames */
      }
    };
    return () => source.close();
  }, [id, load]);

  if (loading) return <PageLoader label="Loading your order…" />;

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="card p-10 text-center">
          <p className="font-heading text-2xl font-bold uppercase text-white">Order not available</p>
          <p className="mt-2 text-sm text-gray-400">{error || 'We could not find that order.'}</p>
          <Link to="/account" className="btn btn-primary mt-5">
            Back to my orders
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const cancelled = order.status === 'CANCELLED';
  const delivered = order.status === 'DELIVERED';

  return (
    <div className="bg-brand-dark py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to="/account" className="text-xs text-gray-400 hover:text-brand-yellow">
              ← My orders
            </Link>
            <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase text-white sm:text-4xl">
              {order.orderNumber}
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Placed {formatDateTime(order.createdAt)} · {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
              items
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={order.status} className="px-3 py-1.5 text-xs" />
            <StatusBadge status={order.paymentStatus} payment />
          </div>
        </div>

        {justUpdated ? (
          <p className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-300">
            Order status updated live.
          </p>
        ) : null}

        <div className="mt-6 card p-5 sm:p-6">
          <h2 className="font-heading text-lg font-bold uppercase text-white">Live status</h2>

          {cancelled ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <XCircle size={20} className="mt-0.5 shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-semibold text-red-300">This order was cancelled</p>
                <p className="text-xs text-red-200/80">
                  If you believe this was a mistake, call the restaurant with your order number.
                </p>
              </div>
            </div>
          ) : (
            <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {STATUS_FLOW.map((status, index) => {
                const Icon = STEP_ICONS[status] || CircleDot;
                const done = index <= currentIndex;
                const active = index === currentIndex;
                return (
                  <li
                    key={status}
                    className={`rounded-xl border p-3 text-center transition ${
                      active
                        ? 'border-brand-yellow bg-brand-yellow/10'
                        : done
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <span
                      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
                        active
                          ? 'bg-brand-yellow text-black'
                          : done
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <p
                      className={`mt-2 text-[11px] font-bold uppercase tracking-wide ${
                        active ? 'text-brand-yellow' : done ? 'text-green-300' : 'text-gray-500'
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}

          {delivered ? (
            <p className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-300">
              Delivered — thank you for ordering from 4 Brothers Pizza. We hope you enjoyed it!
            </p>
          ) : null}

          <div className="mt-6 border-t border-white/10 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Status history
            </h3>
            <ul className="mt-2 space-y-2">
              {order.events.map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-white">{STATUS_LABELS[event.status]}</span>
                    {event.note ? <span className="text-gray-500"> — {event.note}</span> : null}
                  </div>
                  <span className="shrink-0 text-gray-500">{formatDateTime(event.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase text-white">
                <ShoppingBag size={17} className="text-brand-yellow" /> Items
              </h2>
              <ul className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × {formatPKR(item.unitPrice)}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-gray-200">
                      {formatPKR(item.lineTotal)}
                    </span>
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
                Payment: {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Card'} ·{' '}
                {order.paymentStatus === 'PAID'
                  ? 'Settled'
                  : order.paymentStatus === 'PENDING'
                    ? order.paymentMethod === 'COD'
                      ? 'Collect on delivery'
                      : 'Awaiting provider confirmation'
                    : order.paymentStatus}
              </p>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase text-white">
                <MapPin size={17} className="text-brand-yellow" /> Delivering to
              </h2>
              <p className="mt-3 text-sm text-white">{order.customerName}</p>
              <p className="text-xs text-gray-400">{order.customerPhone}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">{order.deliveryAddress}</p>
              {order.deliveryNotes ? (
                <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-300">
                  Note: {order.deliveryNotes}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-brand-yellow/25 bg-brand-yellow/10 p-5">
              <p className="font-heading text-base font-bold uppercase text-brand-yellow">
                Need to change something?
              </p>
              <p className="mt-1 text-xs text-gray-300">
                Call the restaurant and quote your order number. Changes are possible until the
                kitchen accepts the order.
              </p>
              <a href="tel:+92812853377" className="btn btn-primary btn-sm mt-3 w-full">
                <Phone size={14} /> Call +92 81 2853377
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
