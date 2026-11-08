import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { Eye, RefreshCw, Search, ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatDateTime, formatPKR, STATUS_LABELS } from '../../lib/format.js';
import StatusBadge from '../../components/StatusBadge.jsx';

const FILTERS = ['', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const { lastEvent } = useOutletContext() || {};
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const query = new URLSearchParams();
        if (status) query.set('status', status);
        if (debounced) query.set('search', debounced);
        const data = await api.get(`/admin/orders?${query}`);
        setOrders(data.orders);
        setTotal(data.total);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [status, debounced],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    if (!lastEvent?.receivedAt) return;
    load(false);
  }, [lastEvent?.receivedAt, load]);

  const setStatus = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set('status', value);
    else next.delete('status');
    setParams(next, { replace: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
            Orders
          </h1>
          <p className="text-xs text-gray-400">
            {total} order{total === 1 ? '' : 's'} · new orders arrive live
          </p>
        </div>
        <button type="button" onClick={() => load(true)} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((value) => (
            <button
              key={value || 'all'}
              type="button"
              onClick={() => setStatus(value)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
                status === value
                  ? 'border-brand-yellow bg-brand-yellow text-black'
                  : 'border-white/15 text-gray-400 hover:border-brand-yellow hover:text-brand-yellow'
              }`}
            >
              {value ? STATUS_LABELS[value] : 'All orders'}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            className="input py-2.5 pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, name, phone…"
            aria-label="Search orders"
          />
        </div>
      </div>

      {error ? (
        <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingBag size={26} className="mx-auto text-gray-600" />
            <p className="mt-2 text-sm text-gray-400">No orders match this view yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Placed</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-semibold text-white hover:text-brand-yellow"
                      >
                        {order.orderNumber}
                      </Link>
                      {order.status === 'PENDING' ? (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-400">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> New
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-200">{order.customerName}</p>
                      <p className="text-[11px] text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{order.itemCount ?? 0}</td>
                    <td className="px-4 py-3 font-semibold text-gray-200">
                      {formatPKR(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-300">
                        {order.paymentMethod === 'COD' ? 'Cash' : 'Card'}
                      </p>
                      <StatusBadge status={order.paymentStatus} payment className="mt-1" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-brand-yellow hover:text-brand-yellow"
                      >
                        <Eye size={13} /> Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
