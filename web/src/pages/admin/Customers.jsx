import { useCallback, useEffect, useState } from 'react';
import { Mail, Phone, Search, Users } from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatDate, formatPKR } from '../../lib/format.js';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = debounced ? `?search=${encodeURIComponent(debounced)}` : '';
      const data = await api.get(`/admin/customers${query}`);
      setCustomers(data.customers);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
            Customers
          </h1>
          <p className="text-xs text-gray-400">{customers.length} registered customers</p>
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
            placeholder="Search name, email, phone…"
            aria-label="Search customers"
          />
        </div>
      </div>

      {error ? (
        <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center">
            <Users size={24} className="mx-auto text-gray-600" />
            <p className="mt-2 text-sm text-gray-400">No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total spent</th>
                  <th className="px-4 py-3">Last order</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow/10 text-sm font-bold text-brand-yellow">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{customer.name}</p>
                          <p className="text-[11px] text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs">
                        <a
                          href={`mailto:${customer.email}`}
                          className="flex items-center gap-1.5 text-gray-400 hover:text-brand-yellow"
                        >
                          <Mail size={12} /> Email
                        </a>
                        {customer.phone ? (
                          <a
                            href={`tel:${customer.phone.replace(/[^+\d]/g, '')}`}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-brand-yellow"
                          >
                            <Phone size={12} /> {customer.phone}
                          </a>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{customer.orderCount}</td>
                    <td className="px-4 py-3 font-semibold text-gray-200">
                      {formatPKR(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {customer.lastOrderAt ? formatDate(customer.lastOrderAt) : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(customer.createdAt)}
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
