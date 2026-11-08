import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Phone, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await register(form);
      toast.success(`Welcome to 4 Brothers, ${user.name.split(' ')[0]}!`);
      navigate(next || '/', { replace: true });
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
              Create your account
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Faster checkout, saved details and live order tracking.
            </p>
          </div>

          {error ? (
            <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="reg-name">
                Full name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="reg-name"
                  className="input pl-10"
                  value={form.name}
                  onChange={update('name')}
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Ali Khan"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="reg-email">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="reg-email"
                  type="email"
                  className="input pl-10"
                  value={form.email}
                  onChange={update('email')}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="reg-phone">
                Phone
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="reg-phone"
                  className="input pl-10"
                  value={form.phone}
                  onChange={update('phone')}
                  required
                  autoComplete="tel"
                  placeholder="+92 3xx xxxxxxx"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="reg-password"
                  type="password"
                  className="input pl-10"
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              <UserPlus size={16} /> {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-yellow hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
