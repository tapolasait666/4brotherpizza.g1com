import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ArrowUpRight,
  BadgePercent,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Clock,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatDateTime, formatPKR, STATUS_LABELS } from '../../lib/format.js';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

function SalesChart({ data }) {
  const max = Math.max(...data.map((day) => day.revenue), 1);
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-bold uppercase text-white">Sales · last 14 days</h2>
          <p className="text-xs text-gray-500">Revenue from non-cancelled orders</p>
        </div>
        <span className="chip">
          <TrendingUp size={12} /> Live data
        </span>
      </div>
      <div className="mt-6 flex h-44 items-end gap-1.5 sm:gap-2">
        {data.map((day) => {
          const height = day.revenue > 0 ? Math.max((day.revenue / max) * 100, 4) : 2;
          return (
            <div key={day.date} className="group flex flex-1 flex-col items-center gap-1">
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-brand-gold/50 to-brand-yellow transition group-hover:from-brand-yellow group-hover:to-white"
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${formatPKR(day.revenue)} · ${day.orders} orders`}
                />
                <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black px-1.5 py-1 text-[10px] text-white group-hover:block">
                  {formatPKR(day.revenue)}
                </span>
              </div>
              <span className="hidden text-[9px] text-gray-500 sm:block">
                {day.date.slice(8)}/{day.date.slice(5, 7)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { lastEvent } = useOutletContext() || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const result = await api.get('/admin/summary');
      setData(result);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    if (!lastEvent?.receivedAt) return;
    load(false);
  }, [lastEvent?.receivedAt, load]);

  const stats = data?.stats;
  const cards = useMemo(
    () => [
      { label: 'Total orders', value: stats?.totalOrders ?? 0, icon: ClipboardList, tone: 'yellow' },
      {
        label: "Today's sales",
        value: formatPKR(stats?.todaySales ?? 0),
        hint: `${stats?.todayOrders ?? 0} orders today`,
        icon: DollarSign,
        tone: 'green',
      },
      {
        label: 'Total revenue',
        value: formatPKR(stats?.totalRevenue ?? 0),
        hint: 'Delivered orders',
        icon: TrendingUp,
        tone: 'yellow',
      },
      {
        label: 'Pending orders',
        value: stats?.pendingOrders ?? 0,
        hint: `${stats?.activeOrders ?? 0} in progress`,
        icon: Clock,
        tone: 'orange',
      },
      {
        label: 'Completed orders',
        value: stats?.completedOrders ?? 0,
        icon: CheckCircle2,
        tone: 'green',
      },
      { label: 'Customers', value: stats?.customers ?? 0, icon: Users, tone: 'sky' },
    ],
    [stats],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
            Dashboard overview
          </h1>
          <p className="text-xs text-gray-400">
            Live restaurant performance, new orders and kitchen status.
          </p>
        </div>
        <button type="button" onClick={() => load(true)} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error ? (
        <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      {data?.settings?.isOpen === false ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
          Online ordering is currently paused in restaurant settings. Customers can still browse the
          menu but new orders should be expected to fail at checkout if you intend to stay closed.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading && !data} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {data ? <SalesChart data={data.salesByDay} /> : <div className="card h-64 animate-pulse" />}
        </div>
        <div className="card p-5">
          <h2 className="font-heading text-lg font-bold uppercase text-white">Top products</h2>
          <p className="text-xs text-gray-500">By revenue across all orders</p>
          {data?.topProducts?.length ? (
            <ol className="mt-4 space-y-3">
              {data.topProducts.map((product, index) => (
                <li key={product.name} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-yellow/10 text-xs font-bold text-brand-yellow">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{product.name}</p>
                    <p className="text-[11px] text-gray-500">{product.quantity} sold</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-brand-yellow">
                    {formatPKR(product.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 text-sm text-gray-500">No sales yet — orders will appear here.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase text-white">
              <ClipboardList size={17} className="text-brand-yellow" /> Recent orders
            </h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-brand-yellow hover:underline">
              View all <ArrowUpRight size={12} className="inline" />
            </Link>
          </div>
          {data?.recentOrders?.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="pb-2 pr-2">Order</th>
                    <th className="pb-2 pr-2">Customer</th>
                    <th className="pb-2 pr-2">Total</th>
                    <th className="pb-2 pr-2">Status</th>
                    <th className="pb-2">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 last:border-0">
                      <td className="py-2.5 pr-2">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="font-semibold text-white hover:text-brand-yellow"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-2 text-gray-400">{order.customerName}</td>
                      <td className="py-2.5 pr-2 font-semibold text-gray-200">
                        {formatPKR(order.total)}
                      </td>
                      <td className="py-2.5 pr-2">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="whitespace-nowrap py-2.5 text-xs text-gray-500">
                        {formatDateTime(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-500">No orders yet.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-heading text-lg font-bold uppercase text-white">Quick actions</h2>
            <div className="mt-3 space-y-2">
              <Link to="/admin/orders?status=PENDING" className="admin-link bg-white/5">
                <ChefHat size={16} /> Review pending orders
              </Link>
              <Link to="/admin/products" className="admin-link bg-white/5">
                <UtensilsCrossed size={16} /> Manage products
              </Link>
              <Link to="/admin/coupons" className="admin-link bg-white/5">
                <BadgePercent size={16} /> Create a coupon
              </Link>
              <Link to="/admin/reports" className="admin-link bg-white/5">
                <TrendingUp size={16} /> Sales reports
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-brand-yellow/25 bg-brand-yellow/10 p-5">
            <p className="font-heading text-base font-bold uppercase text-brand-yellow">
              {data?.stats?.unreadMessages ?? 0} unread message
              {(data?.stats?.unreadMessages ?? 0) === 1 ? '' : 's'}
            </p>
            <p className="mt-1 text-xs text-gray-300">
              Customer enquiries from the contact form land in your inbox.
            </p>
            <Link to="/admin/messages" className="btn btn-primary btn-sm mt-3 w-full">
              Open inbox
            </Link>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-heading text-lg font-bold uppercase text-white">Order pipeline</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(
            (status) => (
              <Link
                key={status}
                to={`/admin/orders?status=${status}`}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center transition hover:border-brand-yellow/40"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  {STATUS_LABELS[status]}
                </p>
                <p className="mt-1 font-heading text-xl font-extrabold text-white">
                  {data?.statusCounts?.[status] ?? 0}
                </p>
              </Link>
            ),
          )}
        </div>
        <p className="mt-2 text-[11px] text-gray-500">
          Live counts from the database; open a stage to see its full list.
        </p>
      </div>
    </div>
  );
}
