import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import PageLoader from '../../components/Spinner.jsx';

export default function AdminLogin() {
  const { user, loading, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader label="Loading…" />;
  if (user && ['ADMIN', 'STAFF'].includes(user.role)) return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const signedIn = await login(form.email, form.password);
      if (!['ADMIN', 'STAFF'].includes(signedIn.role)) {
        setError('This account does not have restaurant admin access.');
        return;
      }
      toast.success(`Signed in as ${signedIn.name}`);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow font-heading text-2xl font-extrabold text-black shadow-glow-yellow">
            4B
          </span>
          <h1 className="mt-4 font-heading text-3xl font-extrabold uppercase text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-yellow">
            4 Brothers Pizza · Quetta
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-7 shadow-2xl">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label" htmlFor="admin-email">
                Admin email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="admin-email"
                  type="email"
                  className="input pl-10"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                  autoComplete="email"
                  placeholder="admin@4brothers.pk"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="admin-password">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="admin-password"
                  type="password"
                  className="input pl-10"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign in to dashboard'}
            </button>
          </form>
          <p className="mt-4 text-center text-[11px] text-gray-500">
            Customer account?{' '}
            <Link to="/login" className="text-gray-300 hover:text-brand-yellow">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
