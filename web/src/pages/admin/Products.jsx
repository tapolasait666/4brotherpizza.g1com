import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImagePlus, Pencil, Plus, Search, Star, Trash2, Upload } from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatPKR } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../../components/Modal.jsx';
import { ImageWithFallback } from '../../components/ProductCard.jsx';

const EMPTY = {
  name: '',
  categoryId: '',
  description: '',
  price: '',
  comparePrice: '',
  imageUrl: '',
  isAvailable: true,
  isFeatured: false,
  prepTimeMinutes: 20,
  tags: '',
};

function toPayload(form) {
  return {
    name: form.name,
    categoryId: form.categoryId,
    description: form.description,
    price: Number(form.price),
    comparePrice: form.comparePrice === '' ? null : Number(form.comparePrice),
    imageUrl: form.imageUrl,
    isAvailable: Boolean(form.isAvailable),
    isFeatured: Boolean(form.isFeatured),
    prepTimeMinutes: Number(form.prepTimeMinutes || 0),
    tags: String(form.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

function fromProduct(product) {
  return {
    name: product.name,
    categoryId: product.categoryId || '',
    description: product.description || '',
    price: String(product.price),
    comparePrice: product.comparePrice === null ? '' : String(product.comparePrice),
    imageUrl: product.imageUrl || '',
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    prepTimeMinutes: product.prepTimeMinutes,
    tags: (product.tags || []).join(', '),
  };
}

export default function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      const [productData, categoryData] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/categories'),
      ]);
      setProducts(productData.products);
      setCategories(categoryData.categories);
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.categoryName || '').toLowerCase().includes(term),
    );
  }, [products, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, categoryId: categories[0]?.id || '' });
    setFormError('');
    setOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm(fromProduct(product));
    setFormError('');
    setOpen(true);
  };

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await api.upload(file);
      setForm((current) => ({ ...current, imageUrl: data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = toPayload(form);
      if (editing) {
        await api.put(`/admin/products/${editing.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created');
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (product) => {
    try {
      await api.put(`/admin/products/${product.id}`, {
        ...fromProduct(product),
        comparePrice:
          product.comparePrice === null ? null : Number(product.comparePrice),
        price: Number(product.price),
        prepTimeMinutes: Number(product.prepTimeMinutes),
        tags: product.tags || [],
        isAvailable: !product.isAvailable,
      });
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, isAvailable: !item.isAvailable } : item,
        ),
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete “${product.name}”? Past orders keep their record.`)) return;
    try {
      await api.del(`/admin/products/${product.id}`);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
            Products
          </h1>
          <p className="text-xs text-gray-400">
            {products.length} items · prices, availability and images
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              className="input py-2.5 pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
            />
          </div>
          <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={15} /> Add product
          </button>
        </div>
      </div>

      {error ? (
        <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-11 w-11 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{product.name}</p>
                          <p className="max-w-[260px] truncate text-[11px] text-gray-500">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{product.categoryName || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-200">{formatPKR(product.price)}</p>
                      {product.comparePrice ? (
                        <p className="text-[11px] text-gray-500 line-through">
                          {formatPKR(product.comparePrice)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleAvailability(product)}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                          product.isAvailable
                            ? 'border-green-400/30 bg-green-400/10 text-green-300'
                            : 'border-red-400/30 bg-red-400/10 text-red-300'
                        }`}
                        title="Toggle availability"
                      >
                        {product.isAvailable ? 'Available' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {product.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-yellow">
                          <Star size={12} fill="currentColor" /> Featured
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg border border-white/15 p-2 text-gray-300 transition hover:border-brand-yellow hover:text-brand-yellow"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(product)}
                          className="rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit product' : 'Add product'}
        description="Prices are stored in PKR. Upload an image or paste a URL."
        wide
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={submit} className="space-y-4">
          {formError ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {formError}
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-name">
                Name
              </label>
              <input
                id="p-name"
                className="input"
                value={form.name}
                onChange={update('name')}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="label" htmlFor="p-category">
                Category
              </label>
              <select
                id="p-category"
                className="input"
                value={form.categoryId}
                onChange={update('categoryId')}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="p-prep">
                Prep time (minutes)
              </label>
              <input
                id="p-prep"
                type="number"
                min="0"
                max="300"
                className="input"
                value={form.prepTimeMinutes}
                onChange={update('prepTimeMinutes')}
              />
            </div>
            <div>
              <label className="label" htmlFor="p-price">
                Price (Rs)
              </label>
              <input
                id="p-price"
                type="number"
                min="0"
                step="1"
                className="input"
                value={form.price}
                onChange={update('price')}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="p-compare">
                Compare-at price (optional)
              </label>
              <input
                id="p-compare"
                type="number"
                min="0"
                step="1"
                className="input"
                value={form.comparePrice}
                onChange={update('comparePrice')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-description">
                Description
              </label>
              <textarea
                id="p-description"
                className="input min-h-[90px]"
                value={form.description}
                onChange={update('description')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-tags">
                Tags (comma separated)
              </label>
              <input
                id="p-tags"
                className="input"
                value={form.tags}
                onChange={update('tags')}
                placeholder="Chef's Signature, Spicy"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-image">
                Image URL
              </label>
              <input
                id="p-image"
                className="input"
                value={form.imageUrl}
                onChange={update('imageUrl')}
                placeholder="https://… or upload below"
              />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="btn btn-outline btn-sm cursor-pointer">
                  <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={upload}
                    disabled={uploading}
                  />
                </label>
                {form.imageUrl ? (
                  <ImageWithFallback
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-14 w-20 rounded-lg border border-white/10 object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-20 items-center justify-center rounded-lg border border-dashed border-white/15 text-gray-600">
                    <ImagePlus size={18} />
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={update('isAvailable')}
                  className="h-4 w-4 accent-[#FFC800]"
                />
                Available on the menu
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={update('isFeatured')}
                  className="h-4 w-4 accent-[#FFC800]"
                />
                Feature on homepage
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
