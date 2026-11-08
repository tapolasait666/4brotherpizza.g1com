import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Clock,
  LogOut,
  Menu as MenuIcon,
  Phone,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useSiteSettings, FALLBACK_SETTINGS } from '../lib/useSiteSettings.js';

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu & Deals' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const settingsData = useSiteSettings();
  const settings = settingsData?.settings || FALLBACK_SETTINGS;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    navigate('/');
  };

  return (
    <>
      <div className="border-b border-brand-yellow/20 bg-black/95 px-4 py-2 text-xs sm:text-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-0.5 text-xs font-semibold text-brand-yellow">
              <Clock size={12} /> Open Daily: {settings.openTime} - {settings.closeTime}
            </span>
            <span className="hidden text-gray-400 md:inline">
              Serving authentic flavours across Quetta
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium sm:gap-4">
            <span className="hidden text-gray-300 sm:inline">Helpline:</span>
            <a
              className="flex items-center gap-1 text-brand-yellow hover:underline"
              href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
            >
              <Phone size={12} /> {settings.phone}
            </a>
            <span className="text-gray-600">|</span>
            <a
              className="flex items-center gap-1 text-brand-yellow hover:underline"
              href={`tel:${settings.altPhone.replace(/[^+\d]/g, '')}`}
            >
              <Phone size={12} /> {settings.altPhone}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111216]/95 shadow-xl backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="4 Brothers Pizza home">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-yellow to-brand-gold font-heading text-2xl font-extrabold tracking-tighter text-brand-dark shadow-glow-yellow transition-transform group-hover:scale-105">
                4B
              </span>
              <span className="flex flex-col">
                <span className="neon-text-glow whitespace-nowrap font-heading text-2xl font-extrabold leading-none tracking-wider text-brand-yellow transition-colors group-hover:text-white sm:text-3xl">
                  4 BROTHERS
                </span>
                <span className="mt-0.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.25em] text-white sm:text-xs">
                  {settings.tagline}
                </span>
              </span>
            </Link>

            <nav className="hidden items-center space-x-6 text-sm font-medium text-gray-300 lg:flex">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `transition-colors hover:text-brand-yellow ${
                      isActive ? 'text-brand-yellow' : ''
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/#branches" className="transition-colors hover:text-brand-yellow">
                Quetta Branches
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/cart"
                className="relative flex items-center gap-2 rounded-xl border border-brand-yellow/40 px-3 py-2.5 text-sm font-semibold text-brand-yellow transition hover:bg-brand-yellow/10"
                aria-label={`Cart with ${count} items`}
              >
                <ShoppingBag size={18} />
                <span className="hidden sm:inline">Cart</span>
                {count > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow px-1 text-[11px] font-extrabold text-black">
                    {count > 99 ? '99+' : count}
                  </span>
                ) : null}
              </Link>

              {user ? (
                <div className="relative" ref={accountRef}>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((open) => !open)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2.5 text-sm font-semibold text-white transition hover:border-brand-yellow hover:text-brand-yellow"
                    aria-expanded={accountOpen}
                  >
                    <User size={16} />
                    <span className="hidden max-w-[100px] truncate sm:inline">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="hidden sm:inline" />
                  </button>
                  {accountOpen ? (
                    <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-brand-charcoal shadow-2xl">
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                        <p className="truncate text-xs text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                      >
                        <User size={15} /> My account & orders
                      </Link>
                      {['ADMIN', 'STAFF'].includes(user.role) ? (
                        <Link
                          to="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-yellow transition hover:bg-white/5"
                        >
                          <ShoppingBag size={15} /> Admin dashboard
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                      >
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm hidden sm:inline-flex">
                  Sign In
                </Link>
              )}

              <button
                type="button"
                className="rounded-lg border border-white/20 p-2.5 text-white transition hover:border-brand-yellow hover:text-brand-yellow lg:hidden"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-brand-charcoal px-4 pb-6 pt-3 lg:hidden">
            <div className="space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 font-medium transition ${
                      isActive ? 'bg-brand-yellow/10 text-brand-yellow' : 'text-gray-200 hover:text-brand-yellow'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 font-medium text-gray-200 hover:text-brand-yellow"
              >
                Cart ({count})
              </Link>
              {!user ? (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 block rounded-lg bg-brand-yellow px-3 py-3 text-center font-bold uppercase tracking-wider text-black"
                >
                  Sign in / Create account
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
