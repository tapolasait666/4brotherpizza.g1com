import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Tags, Trash2, Upload } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../../components/Modal.jsx';
import { ImageWithFallback } from '../../components/ProductCard.jsx';

const EMPTY = { name: '', description: '', imageUrl: '', sortOrder: 0, isActive: true };

export default function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get('/admin/categories');
      setCategories(data.categories);
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

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, sortOrder: categories.length });
    setFormError('');
    setOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
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
    const payload = {
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl,
      sortOrder: Number(form.sortOrder || 0),
      isActive: Boolean(form.isActive),
    };
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', payload);
        toast.success('Category created');
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (category) => {
    try {
      await api.put(`/admin/categories/${category.id}`, {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl || '',
        sortOrder: category.sortOrder,
        isActive: !category.isActive,
      });
      setCategories((current) =>
        current.map((item) =>
          item.id === category.id ? { ...item, isActive: !item.isActive } : item,
        ),
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (category) => {
    if (
      !window.confirm(
        `Delete “${category.name}”? Products in it become uncategorised and are hidden from the menu.`,
      )
    ) {
      return;
    }
    try {
      await api.del(`/admin/categories/${category.id}`);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold uppercase text-white sm:text-3xl">
            Categories
          </h1>
          <p className="text-xs text-gray-400">Menu sections shown on the storefront.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
          <Plus size={15} /> Add category
        </button>
      </div>

      {error ? (
        <div className="card border-red-500/30 p-4 text-sm text-red-300">{error}</div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="card h-40 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-10 text-center">
          <Tags size={24} className="mx-auto text-gray-600" />
          <p className="mt-2 text-sm text-gray-400">No categories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="card overflow-hidden">
              <div className="relative h-28">
                <ImageWithFallback
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="font-heading text-lg font-bold text-white">{category.name}</p>
                    <p className="text-[11px] text-gray-300">
                      {category.productCount ?? 0} products · order {category.sortOrder}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleActive(category)}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                      category.isActive
                        ? 'border-green-400/40 bg-black/60 text-green-300'
                        : 'border-red-400/40 bg-black/60 text-red-300'
                    }`}
                  >
                    {category.isActive ? 'Active' : 'Hidden'}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="line-clamp-2 text-xs text-gray-400">{category.description}</p>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    className="rounded-lg border border-white/15 p-2 text-gray-300 transition hover:border-brand-yellow hover:text-brand-yellow"
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(category)}
                    className="rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10"
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit category' : 'Add category'}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              form="category-form"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={submit} className="space-y-4">
          {formError ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {formError}
            </p>
          ) : null}
          <div>
            <label className="label" htmlFor="c-name">
              Name
            </label>
            <input
              id="c-name"
              className="input"
              value={form.name}
              onChange={update('name')}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="label" htmlFor="c-description">
              Description
            </label>
            <textarea
              id="c-description"
              className="input min-h-[80px]"
              value={form.description}
              onChange={update('description')}
            />
          </div>
          <div>
            <label className="label" htmlFor="c-image">
              Image URL
            </label>
            <input
              id="c-image"
              className="input"
              value={form.imageUrl}
              onChange={update('imageUrl')}
            />
            <div className="mt-2 flex items-center gap-3">
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
                  className="h-12 w-16 rounded-lg border border-white/10 object-cover"
                />
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="c-sort">
                Sort order
              </label>
              <input
                id="c-sort"
                type="number"
                min="0"
                className="input"
                value={form.sortOrder}
                onChange={update('sortOrder')}
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={update('isActive')}
                className="h-4 w-4 accent-[#FFC800]"
              />
              Visible on menu
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
