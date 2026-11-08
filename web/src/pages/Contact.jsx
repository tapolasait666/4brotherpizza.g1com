import { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useSiteSettings, FALLBACK_SETTINGS } from '../lib/useSiteSettings.js';

export default function Contact() {
  const toast = useToast();
  const data = useSiteSettings();
  const settings = data?.settings || FALLBACK_SETTINGS;
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      await api.post('/contact', form);
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      toast.success('Message sent — we will get back to you soon.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-brand-dark">
      <section className="border-b border-white/10 bg-gradient-to-b from-brand-charcoal to-brand-dark py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="chip">
            <MessageSquare size={12} /> We're listening
          </span>
          <h1 className="mt-2 font-heading text-4xl font-extrabold uppercase text-white sm:text-5xl">
            Contact 4 Brothers
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Questions about an order, a large booking or a branch? Send a message and the restaurant
            team will reply, or call the helplines below.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7">
            <div className="card p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold uppercase text-white">Send a message</h2>
              <p className="mt-1 text-xs text-gray-400">
                This goes straight to the restaurant dashboard.
              </p>

              {sent ? (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Message received.</p>
                    <p className="text-xs text-green-200/80">
                      Our team will get back to you shortly. You can send another message below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="mt-2 text-xs font-semibold underline"
                    >
                      Send another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-5 space-y-4">
                  {error ? (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {error}
                    </p>
                  ) : null}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="contact-name">
                        Full name
                      </label>
                      <input
                        id="contact-name"
                        className="input"
                        value={form.name}
                        onChange={update('name')}
                        required
                        minLength={2}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="contact-email">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        className="input"
                        value={form.email}
                        onChange={update('email')}
                        required
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="contact-phone">
                        Phone (optional)
                      </label>
                      <input
                        id="contact-phone"
                        className="input"
                        value={form.phone}
                        onChange={update('phone')}
                        placeholder="+92 3xx xxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="contact-subject">
                        Subject (optional)
                      </label>
                      <input
                        id="contact-subject"
                        className="input"
                        value={form.subject}
                        onChange={update('subject')}
                        placeholder="Reservation, feedback, order help…"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="contact-message">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      className="input min-h-[140px]"
                      value={form.message}
                      onChange={update('message')}
                      required
                      minLength={10}
                      placeholder="How can we help?"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={sending}>
                    <Send size={16} /> {sending ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="card p-6">
              <h2 className="font-heading text-xl font-bold uppercase text-white">Helplines</h2>
              <div className="mt-4 space-y-3 text-sm">
                <a
                  href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                  className="flex items-center gap-3 text-gray-300 transition hover:text-brand-yellow"
                >
                  <Phone size={16} className="text-brand-yellow" /> {settings.phone}
                  <span className="text-xs text-gray-500">Spinny Road</span>
                </a>
                <a
                  href={`tel:${settings.altPhone.replace(/[^+\d]/g, '')}`}
                  className="flex items-center gap-3 text-gray-300 transition hover:text-brand-yellow"
                >
                  <Phone size={16} className="text-brand-yellow" /> {settings.altPhone}
                  <span className="text-xs text-gray-500">Cell / WhatsApp</span>
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 text-gray-300 transition hover:text-brand-yellow"
                >
                  <Mail size={16} className="text-brand-yellow" /> {settings.email}
                </a>
                <p className="flex items-start gap-3 text-gray-300">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand-yellow" />
                  {settings.address}
                </p>
                <p className="flex items-center gap-3 text-gray-300">
                  <Clock size={16} className="text-brand-yellow" /> {settings.openTime} -{' '}
                  {settings.closeTime} daily
                </p>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-heading text-xl font-bold uppercase text-white">
                Quetta Branches
              </h2>
              <ul className="mt-3 space-y-2 text-xs text-gray-400">
                {[
                  ['Spinny Road (Flagship)', '+92 81 2853377'],
                  ['Sariab Road', '0335 2451616'],
                  ['Millennium Mall', '+92 81 2828843'],
                  ['Nawakilli Bypass', '+92 81 2086739'],
                  ['Shahbaz Town', '+92 81 2853377'],
                ].map(([name, phone]) => (
                  <li key={name} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span>{name}</span>
                    <a className="text-brand-yellow hover:underline" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                      {phone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-brand-yellow/25 bg-brand-yellow/10 p-5 text-sm text-gray-200">
              <p className="font-heading text-lg font-bold uppercase text-brand-yellow">
                Ordering online?
              </p>
              <p className="mt-1 text-xs text-gray-300">
                Track your live order status from your account after checkout. For urgent delivery
                issues, call the helpline with your order number.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
