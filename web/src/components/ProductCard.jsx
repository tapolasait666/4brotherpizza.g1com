import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPKR } from '../lib/format.js';

function ImageWithFallback({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-yellow/20 via-brand-charcoal to-black ${className}`}
        aria-label={alt}
      >
        <span className="font-heading text-4xl font-extrabold text-brand-yellow/70">4B</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export default function ProductCard({ product, compact = false }) {
  const { items, add, setQuantity } = useCart();
  const toast = useToast();
  const inCart = items.find((item) => item.productId === product.id);

  const handleAdd = () => {
    add(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <article
      className={`group card card-hover flex flex-col overflow-hidden ${
        compact ? '' : 'h-full'
      }`}
    >
      <div className="relative h-48 overflow-hidden bg-black/40">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-yellow/40 bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-yellow backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-gray-200 backdrop-blur">
          <Clock size={11} className="text-brand-yellow" /> {product.prepTimeMinutes} min
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-bold leading-tight text-white transition group-hover:text-brand-yellow">
            {product.name}
          </h3>
          <div className="shrink-0 text-right">
            <p className="font-heading text-lg font-extrabold text-brand-yellow">
              {formatPKR(product.price)}
            </p>
            {product.comparePrice ? (
              <p className="text-[11px] text-gray-500 line-through">
                {formatPKR(product.comparePrice)}
              </p>
            ) : null}
          </div>
        </div>

        {!compact ? (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-400">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          {inCart ? (
            <div className="flex items-center justify-between rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setQuantity(product.id, inCart.quantity - 1)}
                className="rounded-lg p-1.5 text-brand-yellow transition hover:bg-brand-yellow/20"
                aria-label={`Remove one ${product.name}`}
              >
                <Minus size={15} />
              </button>
              <span className="text-sm font-bold text-brand-yellow">{inCart.quantity} in cart</span>
              <button
                type="button"
                onClick={() => setQuantity(product.id, inCart.quantity + 1)}
                className="rounded-lg p-1.5 text-brand-yellow transition hover:bg-brand-yellow/20"
                aria-label={`Add one more ${product.name}`}
              >
                <Plus size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:border-brand-yellow hover:bg-brand-yellow hover:text-black"
            >
              <ShoppingBag size={14} /> Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export { ImageWithFallback };
