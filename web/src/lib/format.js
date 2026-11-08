export function formatPKR(value, withCurrency = true) {
  const amount = Number(value || 0);
  const formatted = amount.toLocaleString('en-PK', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return withCurrency ? `Rs ${formatted}` : formatted;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function timeAgo(value) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(value);
}

export const STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const NEXT_ACTIONS = {
  PENDING: [
    { status: 'ACCEPTED', label: 'Accept order', tone: 'primary' },
    { status: 'CANCELLED', label: 'Reject order', tone: 'danger' },
  ],
  ACCEPTED: [
    { status: 'PREPARING', label: 'Start preparing', tone: 'primary' },
    { status: 'CANCELLED', label: 'Cancel order', tone: 'danger' },
  ],
  PREPARING: [
    { status: 'READY', label: 'Mark ready', tone: 'primary' },
    { status: 'CANCELLED', label: 'Cancel order', tone: 'danger' },
  ],
  READY: [
    { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery', tone: 'primary' },
    { status: 'DELIVERED', label: 'Delivered (pickup)', tone: 'outline' },
    { status: 'CANCELLED', label: 'Cancel order', tone: 'danger' },
  ],
  OUT_FOR_DELIVERY: [
    { status: 'DELIVERED', label: 'Mark delivered', tone: 'primary' },
    { status: 'CANCELLED', label: 'Cancel order', tone: 'danger' },
  ],
  DELIVERED: [],
  CANCELLED: [],
};

export const STATUS_FLOW = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];
