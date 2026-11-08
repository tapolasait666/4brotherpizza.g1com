import { Link } from 'react-router-dom';
import { Clock, Facebook, Instagram, MapPin, Phone } from 'lucide-react';
import { useSiteSettings, FALLBACK_SETTINGS } from '../lib/useSiteSettings.js';

export default function Footer() {
  const data = useSiteSettings();
  const settings = data?.settings || FALLBACK_SETTINGS;

  return (
    <footer className="border-t border-white/10 bg-black pb-12 pt-16 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow font-heading text-xl font-extrabold text-black">
                4B
              </span>
              <div>
                <span className="block font-heading text-xl font-bold leading-none text-white">
                  4 BROTHERS PIZZA
                </span>
                <span className="text-[10px] uppercase tracking-widest text-brand-yellow">
                  {settings.tagline}
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              The heart of authentic pizza craftsmanship in Quetta. Known for our signature Crown
              Crust, zesty Zingers, and warm Family Hall hospitality.
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <a
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:border-brand-yellow hover:text-brand-yellow"
                href="https://facebook.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Facebook size={15} />
              </a>
              <a
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:border-brand-yellow hover:text-brand-yellow"
                href="https://instagram.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Instagram size={15} />
              </a>
              <a
                aria-label="Call the restaurant"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:border-brand-yellow hover:text-brand-yellow"
                href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
              >
                <Phone size={15} />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading text-base font-bold uppercase tracking-wider text-white">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link className="transition hover:text-brand-yellow" to="/menu">
                  Menu &amp; Popular Deals
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-brand-yellow" to="/menu?category=crown-crust-pizzas">
                  Crown Crust Specials
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-brand-yellow" to="/about">
                  Family Hall Dining
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-brand-yellow" to="/#branches">
                  Quetta Branches Directory
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-brand-yellow" to="/menu?category=burgers-zingers">
                  Zinger Combos &amp; Platters
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading text-base font-bold uppercase tracking-wider text-white">
              Store Timings
            </h4>
            <div className="space-y-2 text-xs">
              <p className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Monday - Sunday:</span>
                <span className="font-medium text-white">
                  {settings.openTime} - {settings.closeTime}
                </span>
              </p>
              <p className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Friday Lunch &amp; Dine-in:</span>
                <span className="font-medium text-white">Open Post-Jummah</span>
              </p>
              <p className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Home Delivery:</span>
                <span className="font-medium text-brand-yellow">
                  {settings.isOpen ? 'Continuous Service' : 'Currently paused'}
                </span>
              </p>
              <p className="flex items-center gap-2 pt-1 text-[11px]">
                <Clock size={12} className="text-brand-yellow" />
                Delivery fee {settings.deliveryFee > 0 ? `Rs ${settings.deliveryFee}` : 'free'} ·
                minimum order Rs {settings.minOrder}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading text-base font-bold uppercase tracking-wider text-white">
              Official Helplines
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-brand-yellow" />
                <a
                  className="transition hover:text-white"
                  href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                >
                  {settings.phone} (Spinny Road)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-brand-yellow" />
                <a
                  className="transition hover:text-white"
                  href={`tel:${settings.altPhone.replace(/[^+\d]/g, '')}`}
                >
                  {settings.altPhone} (Cell / WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-brand-yellow" />
                <a className="transition hover:text-white" href="tel:+92812082528">
                  +92 81 2082528 (Nawa Killi)
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={12} className="mt-0.5 shrink-0 text-brand-yellow" />
                <span>{settings.address} · Shahbaz Town · Nawa Killi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} 4 BROTHERS PIZZA ("Best Pizza in Town"). All Rights Reserved.</p>
          <p className="flex items-center gap-2">
            <span>Designed with Quetta Hospitality</span>
            <span>•</span>
            <span className="font-medium text-brand-yellow">Family Hall &amp; Express Delivery</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
