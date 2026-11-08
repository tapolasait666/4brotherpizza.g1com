import { STATUS_LABELS } from '../lib/format.js';

const TONES = {
  PENDING: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  ACCEPTED: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  PREPARING: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
  READY: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  OUT_FOR_DELIVERY: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
  DELIVERED: 'border-green-400/30 bg-green-400/10 text-green-300',
  CANCELLED: 'border-red-400/30 bg-red-400/10 text-red-300',
};

const PAYMENT_TONES = {
  PENDING: 'border-gray-400/30 bg-white/5 text-gray-300',
  PAID: 'border-green-400/30 bg-green-400/10 text-green-300',
  FAILED: 'border-red-400/30 bg-red-400/10 text-red-300',
  REFUNDED: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
};

export default function StatusBadge({ status, payment = false, className = '' }) {
  const tone = payment ? PAYMENT_TONES[status] : TONES[status];
  const label = payment
    ? status.charAt(0) + status.slice(1).toLowerCase()
    : STATUS_LABELS[status] || status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        tone || 'border-white/20 bg-white/5 text-gray-300'
      } ${className}`}
    >
      {label}
    </span>
  );
}
