import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      if (next) navigate(next, { replace: true });
      else if (['ADMIN', 'STAFF'].includes(user.role)) navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-brand-charcoal p-7 shadow-2xl">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow font-heading text-2xl font-extrabold text-black">
              4B
            </span>
            <h1 className="mt-4 font-heading text-2xl font-extrabold uppercase text-white">
              Welcome back
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Sign in to order, track deliveries and save your details.
            </p>
          </div>

          {error ? (
            <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="login-email">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="input pl-10"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  className="input pl-10"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                  placeholder="Your password"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-400">
            New to 4 Brothers?{' '}
            <Link to="/register" className="font-semibold text-brand-yellow hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-3 border-t border-white/10 pt-3 text-center text-[11px] text-gray-500">
            Restaurant staff?{' '}
            <Link to="/admin/login" className="text-gray-300 hover:text-brand-yellow">
              Admin sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
