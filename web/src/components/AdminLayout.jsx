import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu as MenuIcon,
  Percent,
  Pizza,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PageLoader from './Spinner.jsx';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: UtensilsCrossed },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/coupons', label: 'Coupons', icon: Percent },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const lastEventRef = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user || !['ADMIN', 'STAFF'].includes(user.role)) return undefined;
    const source = new EventSource('/api/stream', { withCredentials: true });

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'order.created') {
          setUnreadOrders((count) => count + 1);
          toast.info(`New order ${payload.order.orderNumber} · Rs ${payload.order.total}`);
        }
        lastEventRef.current = { ...payload, receivedAt: Date.now() };
        setLastEvent(lastEventRef.current);
      } catch {
        /* ignore malformed keep-alive frames */
      }
    };

    source.onerror = () => {
      // EventSource retries on its own; nothing to do here.
    };

    return () => source.close();
  }, [user, toast]);

  const activeTitle = useMemo(() => {
    if (location.pathname === '/admin') return 'Dashboard overview';
    const match = nav.find(
      (item) => item.to !== '/admin' && location.pathname.startsWith(item.to),
    );
    return match ? match.label : 'Admin';
  }, [location.pathname]);

  if (loading) return <PageLoader label="Loading admin…" />;
  if (!user || !['ADMIN', 'STAFF'].includes(user.role)) {
    return <PageLoader label="Redirecting to admin sign in…" />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0e0f12] transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow font-heading text-lg font-extrabold text-black">
              4B
            </span>
            <span>
              <span className="block font-heading text-sm font-extrabold uppercase tracking-wider text-white">
                4 Brothers
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-yellow">
                Admin panel
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-gray-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-link ${isActive ? 'admin-link-active' : ''}`}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              {item.to === '/admin/orders' && unreadOrders > 0 ? (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                  {unreadOrders}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            to="/"
            className="admin-link"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={17} />
            <span>View storefront</span>
          </Link>
          <button type="button" onClick={handleLogout} className="admin-link w-full">
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="truncate text-xs font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-gray-500">{user.email}</p>
          </div>
        </div>
      </aside>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0e0f12]/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-white/15 p-2 text-gray-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={18} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Pizza size={16} className="text-brand-yellow" />
              <span className="font-semibold text-white">{activeTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/orders"
              onClick={() => setUnreadOrders(0)}
              className="relative rounded-lg border border-white/15 p-2.5 text-gray-300 transition hover:border-brand-yellow hover:text-brand-yellow"
              aria-label="New orders"
            >
              <Bell size={17} />
              {unreadOrders > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                  {unreadOrders}
                </span>
              ) : null}
            </Link>
            <span className="hidden rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-[11px] font-semibold text-green-300 sm:inline">
              Live orders connected
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet context={{ lastEvent }} />
        </main>
      </div>
    </div>
  );
}
