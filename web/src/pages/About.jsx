import { Link } from 'react-router-dom';
import {
  Award,
  CalendarCheck,
  ChefHat,
  HeartHandshake,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useSiteSettings, FALLBACK_SETTINGS } from '../lib/useSiteSettings.js';

const VALUES = [
  {
    icon: ChefHat,
    title: 'Hand-Stretched Daily',
    text: 'Every base is kneaded and stretched in-house each morning — never frozen, never rushed.',
  },
  {
    icon: Leaf,
    title: 'Halal & Pure Ingredients',
    text: 'Premium halal chicken, fresh mozzarella and vegetables sourced from trusted local suppliers.',
  },
  {
    icon: ShieldCheck,
    title: 'Family-First Hospitality',
    text: 'A dedicated Family Hall with a separate entrance, privacy and attentive table service.',
  },
  {
    icon: HeartHandshake,
    title: 'Rooted in Quetta',
    text: 'Five branches and growing, serving the city that made 4 Brothers a weekend tradition.',
  },
];

const STORY = [
  {
    year: 'The beginning',
    text: '4 Brothers Pizza opened on Spinny Road with a single stone oven, a family recipe for slow-fermented dough and a simple promise: the best pizza in town.',
  },
  {
    year: 'The Crown Crust',
    text: 'Our signature Crown Crust — golden cheese-filled pockets baked around every slice — became the reason families started driving across Quetta.',
  },
  {
    year: 'Family Hall',
    text: 'We built a dedicated, strictly reserved Family Hall so parents, children and celebrations could dine in comfort and privacy.',
  },
  {
    year: 'Today',
    text: 'Five Quetta locations, express delivery hubs and now online ordering — the same dough, the same hospitality, delivered to your door.',
  },
];

export default function About() {
  const data = useSiteSettings();
  const settings = data?.settings || FALLBACK_SETTINGS;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-brand-charcoal to-brand-dark py-16">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-yellow/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="chip">
                <Sparkles size={12} /> Our story
              </span>
              <h1 className="mt-3 font-heading text-4xl font-extrabold uppercase leading-none text-white sm:text-6xl">
                Four Brothers.
                <span className="neon-text-glow block text-brand-yellow">One Standard.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">
                The heart of authentic pizza craftsmanship in Quetta. Known for our signature Crown
                Crust, zesty Zingers, and warm Family Hall hospitality — we have grown from one
                storefront into the city's favourite pizza destination.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link to="/menu" className="btn btn-primary">
                  Explore the menu
                </Link>
                <Link to="/contact" className="btn btn-outline">
                  Talk to the team
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['5+', 'Quetta locations'],
                ['100%', 'Fresh mozzarella'],
                ['30 min', 'Average delivery'],
                ['12 AM', 'Open late daily'],
              ].map(([value, label]) => (
                <div key={label} className="card p-5 text-center">
                  <p className="font-heading text-3xl font-extrabold text-brand-yellow">{value}</p>
                  <p className="mt-1 text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip">
              <Award size={12} /> Our promise
            </span>
            <h2 className="section-title mt-2">What Makes 4 Brothers Different</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div key={value.title} className="card card-hover p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow">
                  <value.icon size={20} />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-white">{value.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-brand-charcoal py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <span className="chip">Timeline</span>
              <h2 className="section-title mt-2">From Spinny Road to Your Doorstep</h2>
              <p className="muted mt-3">
                Four chapters that shaped the way Quetta eats pizza.
              </p>
            </div>
            <div className="space-y-4 lg:col-span-8">
              {STORY.map((item, index) => (
                <div key={item.year} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-yellow/40 bg-brand-yellow/10 font-heading text-sm font-bold text-brand-yellow">
                      {index + 1}
                    </span>
                    {index < STORY.length - 1 ? (
                      <span className="mt-1 w-px flex-1 bg-white/10" />
                    ) : null}
                  </div>
                  <div className="card flex-1 p-5">
                    <h3 className="font-heading text-lg font-bold uppercase text-white">
                      {item.year}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-400">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card grid grid-cols-1 overflow-hidden lg:grid-cols-2">
            <div className="p-8 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Users size={12} /> Family Hall
              </span>
              <h2 className="section-title mt-3">Dining Made for Families</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                Our Family Hall is a strictly reserved section with its own entrance and partition.
                It is designed for birthdays, gatherings and quiet family dinners — with quick
                table service and a menu built for sharing.
              </p>
              <ul className="mt-5 space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-brand-yellow" /> Separate family entrance
                  and partition
                </li>
                <li className="flex items-center gap-2">
                  <CalendarCheck size={15} className="text-brand-yellow" /> Party and birthday
                  reservations
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={15} className="text-brand-yellow" /> Available at Spinny Road,
                  Sariab Road &amp; Shahbaz Town
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                  className="btn btn-primary"
                >
                  <Phone size={16} /> Reserve a table
                </a>
                <Link to="/menu" className="btn btn-outline">
                  Browse the menu
                </Link>
              </div>
            </div>
            <div className="relative min-h-[260px] bg-[radial-gradient(circle_at_60%_40%,rgba(255,200,0,0.22),transparent_60%),linear-gradient(140deg,#17181c,#0b0c0e)] p-8 sm:p-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid w-full max-w-sm grid-cols-2 gap-3">
                  {['Crown Crust', 'Zingers', 'Platters', 'Family Deals'].map((label) => (
                    <div
                      key={label}
                      className="rounded-xl border border-brand-yellow/25 bg-black/40 px-3 py-6 text-center font-heading text-sm font-bold uppercase tracking-wide text-brand-yellow backdrop-blur"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
