import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, UtensilsCrossed, X } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../lib/api.js';
import { formatPKR } from '../lib/format.js';

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('category') || '';
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/categories')
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const query = new URLSearchParams();
    if (activeCategory) query.set('category', activeCategory);
    if (debounced) query.set('search', debounced);

    api
      .get(`/products${query.toString() ? `?${query}` : ''}`)
      .then((data) => {
        if (active) setProducts(data.products);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [activeCategory, debounced]);

  const activeName = useMemo(() => {
    if (!activeCategory) return 'Full Menu';
    return categories.find((category) => category.slug === activeCategory)?.name || 'Menu';
  }, [activeCategory, categories]);

  const setCategory = (slug) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setParams(next, { replace: true });
  };

  const cheapest = products.length
    ? Math.min(...products.map((product) => product.price))
    : null;

  return (
    <div className="bg-brand-dark">
      <section className="border-b border-white/10 bg-gradient-to-b from-brand-charcoal to-brand-dark py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="chip">
            <UtensilsCrossed size={12} /> Fresh from the kitchen
          </span>
          <h1 className="mt-2 font-heading text-4xl font-extrabold uppercase text-white sm:text-5xl">
            {activeName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Crown Crust pizzas, crispy Zingers, sharing platters and storefront deals. Everything is
            prepared fresh to order and delivered hot across Quetta.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search the menu…"
                className="input pl-10 pr-10"
                aria-label="Search the menu"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>
            <p className="text-xs text-gray-500">
              {loading
                ? 'Loading items…'
                : `${products.length} item${products.length === 1 ? '' : 's'}${
                    cheapest !== null ? ` · from ${formatPKR(cheapest)}` : ''
                  }`}
            </p>
          </div>
        </div>
      </section>

      <div className="sticky top-20 z-30 border-b border-white/10 bg-brand-dark/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
              !activeCategory
                ? 'border-brand-yellow bg-brand-yellow text-black'
                : 'border-white/15 text-gray-300 hover:border-brand-yellow hover:text-brand-yellow'
            }`}
          >
            <SlidersHorizontal size={13} /> All items
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategory(category.slug)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                activeCategory === category.slug
                  ? 'border-brand-yellow bg-brand-yellow text-black'
                  : 'border-white/15 text-gray-300 hover:border-brand-yellow hover:text-brand-yellow'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="card border-red-500/30 p-6 text-sm text-red-300">{error}</div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="card h-80 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : products.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <p className="font-heading text-xl font-bold uppercase text-white">Nothing matched</p>
              <p className="mt-1 text-sm text-gray-400">
                Try another search or browse a different category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategory('');
                }}
                className="btn btn-outline btn-sm mt-4"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
