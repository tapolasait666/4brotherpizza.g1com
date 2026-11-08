import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, LogOut, Mail, Phone, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatDateTime, formatPKR } from '../lib/format.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PageLoader from '../components/Spinner.jsx';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/orders')
      .then((data) => {
        if (active) setOrders(data.orders);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="bg-brand-dark py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="chip">
              <User size={12} /> My account
            </span>
            <h1 className="mt-2 font-heading text-3xl font-extrabold uppercase text-white sm:text-4xl">
              {user.name}
            </h1>
          </div>
          <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="space-y-4 lg:col-span-4">
            <div className="card p-5">
              <h2 className="font-heading text-lg font-bold uppercase text-white">Profile</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <User size={14} className="text-brand-yellow" /> {user.name}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail size={14} className="text-brand-yellow" /> {user.email}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone size={14} className="text-brand-yellow" /> {user.phone || 'No phone saved'}
                </div>
              </dl>
              {['ADMIN', 'STAFF'].includes(user.role) ? (
                <Link to="/admin" className="btn btn-primary btn-sm mt-4 w-full">
                  Open admin dashboard
                </Link>
              ) : null}
            </div>

            <div className="rounded-2xl border border-brand-yellow/25 bg-brand-yellow/10 p-5">
              <p className="font-heading text-base font-bold uppercase text-brand-yellow">
                Hungry again?
              </p>
              <p className="mt-1 text-xs text-gray-300">
                Your favourites are a click away. Reorder from the full menu.
              </p>
              <Link to="/menu" className="btn btn-primary btn-sm mt-3 w-full">
                <ShoppingBag size={14} /> Browse menu
              </Link>
            </div>
          </aside>

          <section className="lg:col-span-8">
            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase text-white">
                <ClipboardList size={17} className="text-brand-yellow" /> Order history
              </h2>

              {loading ? (
                <PageLoader label="Loading your orders…" />
              ) : error ? (
                <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-400">You haven't placed an order yet.</p>
                  <Link to="/menu" className="btn btn-primary btn-sm mt-4">
                    Order something delicious
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {orders.map((order) => (
                    <li key={order.id}>
                      <Link
                        to={`/orders/${order.id}`}
                        className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-brand-yellow/40 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-heading text-base font-bold text-white">
                              {order.orderNumber}
                            </p>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatDateTime(order.createdAt)} · {order.itemCount ?? 0} items ·{' '}
                            {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Card'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <span className="font-heading text-lg font-bold text-brand-yellow">
                            {formatPKR(order.total)}
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Track →
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
