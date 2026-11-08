import { useCallback, useEffect, useState } from 'react';
import { Check, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatDateTime } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminMessages() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.get('/admin/messages');
      setMessages(data.messages);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRead = async (message) => {
    try {
      const data = await api.patch(`/admin/messages/${message.id}`, { isRead: !message.isRead });
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? data.message : item)),
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (message) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.del(`/admin/messages/${message.id}`);
      setMessages((current) => current.filter((item) => item.id !== message.id));
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unread = messages.filter((message) => !message.isRead).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
          Messages
        </h1>
        <p className="text-xs text-gray-400">
          {unread} unread · customer enquiries from the contact form
        </p>
      </div>

      {error ? (
        <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card h-28 animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="card p-10 text-center">
          <Mail size={24} className="mx-auto text-gray-600" />
          <p className="mt-2 text-sm text-gray-400">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`card p-5 ${message.isRead ? '' : 'border-brand-yellow/30'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg font-bold text-white">{message.subject}</h2>
                    {!message.isRead ? (
                      <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[9px] font-extrabold uppercase text-black">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-400">
                    {message.name} ·{' '}
                    <a className="text-brand-yellow hover:underline" href={`mailto:${message.email}`}>
                      {message.email}
                    </a>
                    {message.phone ? ` · ${message.phone}` : ''}
                  </p>
                  <p className="text-[11px] text-gray-500">{formatDateTime(message.createdAt)}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleRead(message)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-gray-300 transition hover:border-brand-yellow hover:text-brand-yellow"
                  >
                    {message.isRead ? <Mail size={12} /> : <MailOpen size={12} />}
                    {message.isRead ? 'Mark unread' : 'Mark read'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(message)}
                    className="rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10"
                    aria-label="Delete message"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-300">
                {message.message}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(
                    `Re: ${message.subject}`,
                  )}`}
                  className="btn btn-outline btn-sm"
                >
                  <Reply size={13} /> Reply by email
                </a>
                {!message.isRead ? (
                  <button
                    type="button"
                    onClick={() => toggleRead(message)}
                    className="btn btn-ghost btn-sm"
                  >
                    <Check size={13} /> Mark as read
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
