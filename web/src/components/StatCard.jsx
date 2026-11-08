export default function StatCard({ label, value, hint, icon: Icon, tone = 'yellow', loading = false }) {
  const tones = {
    yellow: 'border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow',
    green: 'border-green-400/30 bg-green-400/10 text-green-300',
    sky: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
    orange: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
    red: 'border-red-400/30 bg-red-400/10 text-red-300',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-2 truncate font-heading text-2xl font-extrabold text-white sm:text-3xl">
            {loading ? <span className="text-gray-600">—</span> : value}
          </p>
          {hint ? <p className="mt-1 text-[11px] text-gray-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              tones[tone] || tones.yellow
            }`}
          >
            <Icon size={18} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
