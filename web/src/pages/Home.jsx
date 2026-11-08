import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Bike,
  CalendarCheck,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  Phone,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import ProductCard, { ImageWithFallback } from '../components/ProductCard.jsx';
import { api } from '../lib/api.js';
import { formatPKR } from '../lib/format.js';
import { useSiteSettings, FALLBACK_SETTINGS } from '../lib/useSiteSettings.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const STOREFRONT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBmUmVEW57skhiRYK7uaWdGN8NobpajRIGPjfDuqT_7NvqRdE6-D_phgTIiDK_5CU8BQs0T4E-o8r2g35eykoGzqy4TOGF7P40sX6q0l90dtadnHgm5BS4qZQGclcsAEe-kW8xmMgUSaYqRDMIicDn-9YxkEaRS1zYj3uAjzw8Zi_Er7Vbo1siWG2z4nhPkiWFOWEKnl2HwdWzbYvhNa1Htw18dIP3mtsZskUE668E';

const BRANCHES = [
  {
    name: 'Spinny Road Branch',
    badge: 'Main / Flagship',
    address: 'Spinny Road, Quetta City',
    phone: '+92 81 2853377',
    features: ['Dine-In (Family Hall)', 'Takeaway', 'Delivery'],
    flagship: true,
  },
  {
    name: 'Sariab Road Branch',
    badge: 'Sariab Road Hub',
    address: '5XHV+4R8, Sariab Rd, near Lala Super Store, Quetta',
    phone: '0335 2451616',
    features: ['Dine-In (Family Hall)', 'Takeaway', 'Delivery'],
    flagship: true,
  },
  {
    name: 'Millennium Mall Branch',
    badge: 'Shopping Food Court',
    address: 'Food Court, Millennium Mall, Shahrah-e-Iqbal',
    phone: '+92 81 2828843',
    features: ['Food Court Dining', 'Quick Takeaway'],
  },
  {
    name: 'Nawakilli Bypass Branch',
    badge: 'Bypass Ring',
    address: 'Bypass Road, Near Nawa Killi, Quetta',
    phone: '+92 81 2086739',
    features: ['Drive-by Takeaway', 'Quick Delivery'],
  },
  {
    name: 'Shahbaz Town Branch',
    badge: 'Executive Dining',
    address: 'Shahbaz Town Commercial Area, Quetta',
    phone: '+92 81 2853377',
    features: ['Premium Dining', 'Dedicated Family Hall'],
  },
];

const DELIVERY_HUBS = ['DHA Quetta', 'Chaman Scheme', 'WAPDA Colony', 'Labour Colony'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const settingsData = useSiteSettings();
  const settings = settingsData?.settings || FALLBACK_SETTINGS;
  const { add } = useCart();
  const toast = useToast();

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/products?featured=true'), api.get('/categories')])
      .then(([productData, categoryData]) => {
        if (!active) return;
        setFeatured(productData.products.slice(0, 6));
        setCategories(categoryData.categories);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const deal = featured.find((product) => product.slug === 'deal-2-three-zingers') || featured[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden border-b border-white/10 bg-brand-dark">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,200,0,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-yellow/15 blur-3xl" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-yellow">
                <span className="h-2 w-2 animate-ping rounded-full bg-brand-yellow" />
                Quetta's Premier Pizza Destination
              </span>
              <h1 className="font-heading text-4xl font-extrabold uppercase leading-none tracking-tight text-white sm:text-6xl xl:text-7xl">
                4 BROTHERS PIZZA
                <span className="neon-text-glow mt-2 block text-brand-yellow">
                  BEST PIZZA IN TOWN
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
                Signature Crown Crusts, Sizzling Zingers, Family Platters &amp; Authentic Wood-Fired
                Taste across Quetta. Experience premium dining with our signature warm ambience and
                dedicated Family Hall.
              </p>

              <div className="flex flex-wrap gap-3 py-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-200 sm:text-sm">
                  <UtensilsCrossed size={16} className="text-brand-yellow" />
                  <span>
                    Dedicated <strong>Family Hall</strong> Dining
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-200 sm:text-sm">
                  <Bike size={16} className="text-brand-yellow" />
                  <span>
                    Fast Citywide <strong>Home Delivery</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-200 sm:text-sm">
                  <ShoppingBag size={16} className="text-brand-yellow" />
                  <span>
                    Express <strong>Takeaway</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center">
                <Link to="/menu" className="btn btn-primary px-8 py-4 text-base">
                  <Flame size={18} /> Explore Menu &amp; Deals
                </Link>
                <Link to="/#branches" className="btn btn-outline px-7 py-4 text-base">
                  <Store size={18} /> Find Nearest Branch
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-xs text-gray-400">
                <span>
                  <strong className="text-white">5+ Hubs</strong> in Quetta City
                </span>
                <span className="text-gray-700">•</span>
                <span>
                  <strong className="text-white">Fresh Dough</strong> Hand-Stretched Daily
                </span>
                <span className="text-gray-700">•</span>
                <span>
                  <strong className="text-white">Halal &amp; Pure</strong> Premium Ingredients
                </span>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-3xl border border-brand-yellow/40 bg-gradient-to-b from-brand-yellow/30 via-white/10 to-transparent p-3 shadow-glow-yellow">
                <div className="group relative overflow-hidden rounded-2xl bg-brand-charcoal">
                  <ImageWithFallback
                    src={STOREFRONT}
                    alt="4 Brothers Pizza storefront with yellow channel lettering and Family Hall entrance"
                    className="h-[300px] w-full object-cover object-center transition duration-700 group-hover:scale-105 sm:h-[460px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-brand-yellow/50 bg-black/80 px-3.5 py-1.5 backdrop-blur-md">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-yellow" />
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-brand-yellow">
                      Quetta Flagship Exterior
                    </span>
                  </div>
                  {deal ? (
                    <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-brand-yellow/60 bg-black/90 p-3.5 backdrop-blur-md">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="rounded bg-brand-yellow/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-yellow">
                            Storefront Live Special
                          </span>
                          <p className="mt-1 line-clamp-2 font-heading text-base font-bold text-white">
                            {deal.name}
                          </p>
                          <p className="text-[11px] text-gray-300">
                            "Every Slice Counts" • Dine-In &amp; Takeaway
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {deal.comparePrice ? (
                            <span className="block text-xs text-gray-400 line-through">
                              {formatPKR(deal.comparePrice)}
                            </span>
                          ) : null}
                          <span className="font-heading text-lg font-extrabold text-brand-yellow">
                            {formatPKR(deal.price)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          add(deal, 1);
                          toast.success(`${deal.name} added to cart`);
                        }}
                        className="mt-2.5 w-full rounded-lg bg-brand-yellow py-2 font-heading text-xs font-bold uppercase tracking-wide text-black transition hover:bg-white"
                      >
                        Add this deal
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured deal banner */}
      {deal ? (
        <section className="relative border-y border-brand-yellow/20 bg-gradient-to-r from-brand-charcoal via-[#191b20] to-brand-charcoal py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-brand-yellow/30 bg-brand-dark/80 p-6 shadow-xl md:flex-row md:p-8">
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand-yellow bg-brand-yellow/10 text-3xl text-brand-yellow">
                  <Flame size={30} />
                </span>
                <div className="text-center sm:text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
                    Featured Walk-in Deal From Storefront
                  </span>
                  <h2 className="font-heading text-2xl font-extrabold uppercase text-white md:text-3xl">
                    {deal.name}
                  </h2>
                  <p className="text-sm text-gray-300">{deal.description}</p>
                </div>
              </div>
              <div className="flex w-full items-center justify-between gap-6 sm:w-auto md:justify-end">
                <div className="text-right">
                  <span className="block text-xs uppercase text-gray-400">All-Inclusive Price</span>
                  <span className="neon-text-glow font-heading text-3xl font-extrabold text-brand-yellow md:text-4xl">
                    {formatPKR(deal.price)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    add(deal, 1);
                    toast.success(`${deal.name} added to cart`);
                  }}
                  className="btn btn-primary whitespace-nowrap"
                >
                  Order this deal
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Featured products */}
      <section className="bg-brand-dark py-16 sm:py-20" id="signature-deals">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="chip">
                <Sparkles size={12} /> The 4 Brothers Masterpiece
              </span>
              <h2 className="section-title mt-2">Signature Picks &amp; Deals</h2>
              <p className="muted mt-2 max-w-2xl">
                Loaded with cheese-stuffed crowns, hand-kneaded dough, and secret Balochistan-infused
                spice profiles.
              </p>
            </div>
            <Link to="/menu" className="btn btn-outline btn-sm">
              Full menu <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card h-80 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : featured.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-sm text-gray-400">
              The menu is being refreshed. Please check back shortly.
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length ? (
        <section className="border-y border-white/5 bg-brand-charcoal py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <span className="chip">More than just pizza</span>
              <h2 className="section-title mt-2">Browse the Kitchen</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/menu?category=${category.slug}`}
                  className="group card card-hover flex items-center gap-4 overflow-hidden p-4"
                >
                  <ImageWithFallback
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-lg font-bold text-white group-hover:text-brand-yellow">
                      {category.name}
                    </h3>
                    <p className="line-clamp-2 text-xs text-gray-400">{category.description}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-brand-yellow">
                      {category.productCount ?? 0} items
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-gray-500 transition group-hover:translate-x-1 group-hover:text-brand-yellow"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Family dining */}
      <section className="relative overflow-hidden border-t border-white/10 bg-brand-dark py-20" id="family-dining">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Star size={12} /> Private &amp; Respectful Ambience
              </span>
              <h2 className="section-title leading-tight">
                Dedicated Family Hall Dining In Quetta
              </h2>
              <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
                As highlighted on our signature wooden-framed entrance ("FAMILY HALL"), 4 Brothers
                Pizza takes utmost pride in providing a warm, secure, and comfortable atmosphere
                tailored specially for families, gatherings, and celebrations.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  {
                    title: 'Strictly Reserved Family Section',
                    text: 'Separate partition and entrance ensuring peace, privacy, and traditional hospitality.',
                  },
                  {
                    title: 'Birthdays & Party Reservations',
                    text: 'Royal Crown Feasts, shared platters, and custom party setups available upon reservation.',
                  },
                  {
                    title: 'Climate Controlled & Comfortable',
                    text: 'Modern lighting, soothing ambience, and quick attentive table service.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow">
                      <Award size={15} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-gray-400">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                  className="btn btn-primary"
                >
                  <CalendarCheck size={16} /> Reserve Family Table
                </a>
                <span className="text-xs text-gray-400">
                  Walk-ins always welcome daily from {settings.openTime}
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl border-2 border-brand-yellow/30 bg-brand-charcoal p-6 shadow-2xl sm:p-8">
                <div className="border-b border-white/10 pb-6 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow">
                    Warm Architectural Experience
                  </span>
                  <h3 className="mt-1 font-heading text-2xl font-extrabold text-white sm:text-3xl">
                    THE 4 BROTHERS STANDARD
                  </h3>
                </div>
                <div className="my-6 grid grid-cols-2 gap-4">
                  {[
                    ['100%', 'Fresh Mozzarella'],
                    ['30 Min', 'Average Delivery Time'],
                    ['5+', 'Quetta Locations'],
                    ['Late', 'Open Till 12:00 Midnight'],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/5 bg-black/50 p-4 text-center"
                    >
                      <span className="block font-heading text-3xl font-extrabold text-brand-yellow">
                        {value}
                      </span>
                      <span className="text-xs text-gray-300">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-brand-yellow/20 bg-brand-yellow/10 p-4">
                  <span className="font-heading text-2xl text-brand-yellow">"</span>
                  <p className="text-xs italic text-gray-200">
                    Best pizza crust in Quetta! The Crown Crust with family in their dedicated hall
                    is our weekend tradition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="border-t border-white/10 bg-brand-charcoal py-20" id="branches">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <span className="chip">
              <MapPin size={12} /> Find Us in Quetta
            </span>
            <h2 className="section-title">Our Quetta Branches Directory</h2>
            <p className="muted">
              Visit our modern restaurants or call the direct branch hotline for fastest doorstep
              delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BRANCHES.map((branch) => (
              <div
                key={branch.name}
                className={`card flex flex-col justify-between p-6 ${
                  branch.flagship ? 'border-2 border-brand-yellow/40 shadow-glow-card' : ''
                }`}
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span
                      className={`rounded px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${
                        branch.flagship ? 'bg-brand-yellow text-black' : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {branch.badge}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                      <span className="h-2 w-2 rounded-full bg-green-400" /> Open Now
                    </span>
                  </div>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-white">{branch.name}</h3>
                  <p className="mb-4 mt-1 flex items-start gap-1.5 text-xs text-gray-400">
                    <MapPin size={12} className="mt-0.5 shrink-0 text-brand-yellow" />
                    {branch.address}
                  </p>
                  <div className="space-y-1.5 border-t border-white/10 pt-3 text-xs text-gray-300">
                    <p className="flex items-center gap-2">
                      <Clock size={12} className="w-4 text-gray-500" /> {settings.openTime} -{' '}
                      {settings.closeTime}
                    </p>
                    <p className="flex items-start gap-2">
                      <UtensilsCrossed size={12} className="mt-0.5 w-4 text-gray-500" />
                      {branch.features.join(', ')}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${branch.phone.replace(/[^+\d]/g, '')}`}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-heading text-xs font-bold uppercase transition ${
                    branch.flagship
                      ? 'bg-brand-yellow text-black hover:bg-white'
                      : 'bg-white/10 text-white hover:bg-brand-yellow hover:text-black'
                  }`}
                >
                  <Phone size={13} /> Call: {branch.phone}
                </a>
              </div>
            ))}

            <div className="card flex flex-col justify-between border-brand-yellow/30 bg-gradient-to-br from-brand-charcoal to-brand-dark p-6">
              <div>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="rounded bg-brand-yellow px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-black">
                    Growth Network
                  </span>
                  <span className="text-xs font-semibold text-brand-yellow">Active Delivery</span>
                </div>
                <h3 className="mt-2 font-heading text-2xl font-bold text-white">
                  Expanding Delivery Hubs
                </h3>
                <p className="mb-4 mt-2 text-xs leading-relaxed text-gray-300">
                  We now provide express dispatch to surrounding sectors:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  {DELIVERY_HUBS.map((hub) => (
                    <div key={hub} className="rounded border border-white/5 bg-white/5 p-2">
                      <span className="mr-1 text-brand-yellow">✓</span>
                      {hub}
                    </div>
                  ))}
                </div>
              </div>
              <a
                href={`tel:${settings.altPhone.replace(/[^+\d]/g, '')}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-yellow py-3 font-heading text-xs font-bold uppercase text-brand-yellow transition hover:bg-brand-yellow hover:text-black"
              >
                <Phone size={13} /> Mobile: {settings.altPhone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Order CTA */}
      <section className="relative bg-gradient-to-r from-brand-yellow via-[#ffd026] to-brand-yellow py-16 text-black">
        <div className="mx-auto max-w-7xl space-y-6 px-4 text-center sm:px-6 lg:px-8">
          <span className="rounded-full bg-black px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-brand-yellow">
            Hot &amp; Fresh Right To Your Doorstep
          </span>
          <h2 className="font-heading text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">
            CRAVING THE BEST PIZZA IN TOWN?
          </h2>
          <p className="mx-auto max-w-2xl text-base font-medium text-black/80 sm:text-lg">
            Order online in minutes, or call our central helplines and visit your closest 4 Brothers
            Family Hall today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/menu"
              className="flex items-center gap-2 rounded-xl bg-black px-8 py-4 font-heading text-base font-extrabold uppercase text-brand-yellow shadow-2xl transition hover:bg-gray-900"
            >
              <ShoppingBag size={18} /> Order Online Now
            </Link>
            <a
              href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
              className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-heading text-base font-extrabold uppercase text-black shadow-2xl transition hover:bg-gray-100"
            >
              <Phone size={18} /> {settings.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
