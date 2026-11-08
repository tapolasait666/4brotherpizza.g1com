import { useCallback, useEffect, useState } from 'react';
import { BarChart3, RefreshCw, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatPKR, STATUS_LABELS } from '../../lib/format.js';
import StatCard from '../../components/StatCard.jsx';

function isoDate(date) {
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const today = new Date();
const monthAgo = new Date(Date.now() - 29 * 86400000);

export default function AdminReports() {
  const [range, setRange] = useState({ from: isoDate(monthAgo), to: isoDate(today) });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (current = range) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ from: current.from, to: current.to });
      const result = await api.get(`/admin/reports?${query}`);
      setData(result);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = data?.totals;
  const maxRevenue = Math.max(...(data?.byDay?.map((day) => day.revenue) || [1]), 1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
            Sales Reports
          </h1>
          <p className="text-xs text-gray-400">Live figures computed from real orders.</p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            load(range);
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <div>
            <label className="label" htmlFor="from">
              From
            </label>
            <input
              id="from"
              type="date"
              className="input py-2"
              value={range.from}
              onChange={(event) => setRange({ ...range, from: event.target.value })}
              max={range.to}
            />
          </div>
          <div>
            <label className="label" htmlFor="to">
              To
            </label>
            <input
              id="to"
              type="date"
              className="input py-2"
              value={range.to}
              onChange={(event) => setRange({ ...range, to: event.target.value })}
              min={range.from}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            <RefreshCw size={14} /> Apply
          </button>
        </form>
      </div>

      {error ? (
        <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders in range"
          value={totals?.orders ?? 0}
          icon={BarChart3}
          loading={loading && !data}
        />
        <StatCard
          label="Sales (non-cancelled)"
          value={formatPKR(totals?.sales ?? 0)}
          icon={TrendingUp}
          tone="green"
          loading={loading && !data}
        />
        <StatCard
          label="Delivered revenue"
          value={formatPKR(totals?.deliveredRevenue ?? 0)}
          tone="yellow"
          loading={loading && !data}
        />
        <StatCard
          label="Average order"
          value={formatPKR(totals?.averageOrder ?? 0)}
          hint={`${totals?.cancelled ?? 0} cancelled`}
          tone="orange"
          loading={loading && !data}
        />
      </div>

      <div className="card p-5">
        <h2 className="font-heading text-lg font-bold uppercase text-white">Daily revenue</h2>
        <p className="text-xs text-gray-500">
          {range.from} → {range.to}
        </p>
        {data?.byDay?.length ? (
          <div className="mt-5 flex h-48 items-end gap-1">
            {data.byDay.map((day) => {
              const height = day.revenue > 0 ? Math.max((day.revenue / maxRevenue) * 100, 3) : 2;
              return (
                <div key={day.date} className="group relative flex flex-1 flex-col items-center">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-brand-gold/50 to-brand-yellow transition group-hover:from-brand-yellow group-hover:to-white"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${formatPKR(day.revenue)} · ${day.orders} orders`}
                    />
                  </div>
                  <span className="mt-1 hidden text-[8px] text-gray-500 sm:block">
                    {day.date.slice(8)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No orders in this range.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="font-heading text-lg font-bold uppercase text-white">By status</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data?.byStatus?.length ? (
              data.byStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between gap-2">
                  <span className="text-gray-400">{STATUS_LABELS[row.status] || row.status}</span>
                  <span className="text-gray-200">
                    {row.count} · {formatPKR(row.value)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No data.</li>
            )}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="font-heading text-lg font-bold uppercase text-white">By payment</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data?.byPayment?.length ? (
              data.byPayment.map((row) => (
                <li key={row.payment_method} className="flex items-center justify-between gap-2">
                  <span className="text-gray-400">
                    {row.payment_method === 'COD' ? 'Cash on delivery' : 'Card'}
                  </span>
                  <span className="text-gray-200">
                    {row.count} · {formatPKR(row.value)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No data.</li>
            )}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="font-heading text-lg font-bold uppercase text-white">Top products</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {data?.topProducts?.length ? (
              data.topProducts.map((product, index) => (
                <li key={product.name} className="flex items-start justify-between gap-2">
                  <span className="min-w-0 text-gray-400">
                    <span className="mr-1 text-brand-yellow">{index + 1}.</span>
                    <span className="align-middle">{product.name}</span>
                  </span>
                  <span className="shrink-0 text-gray-200">{formatPKR(product.revenue)}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No data.</li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
