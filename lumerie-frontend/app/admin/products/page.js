"use client";
import { formatNaira } from "@/lib/format";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const EMPTY_FORM = {
  name: "",
  description: "",
  main_category: "jewelry",
  sub_category: "",
  price: "",
  stock: "",
  image_url: "",
  material: "",
  colors_available: "",
  is_active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/products/admin/?page_size=100", { auth: true });
      setProducts(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    api.get("/products/categories/").then(setCategories).catch(() => {});
  }, [loadProducts]);

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      ...product,
      colors_available: (product.colors_available || []).join(", "),
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    const payload = {
      ...form,
      price: form.price,
      stock: Number(form.stock),
      colors_available: form.colors_available
        ? form.colors_available.split(",").map((c) => c.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editingId) {
        await api.patch(`/products/admin/${editingId}/`, payload, { auth: true });
      } else {
        await api.post("/products/admin/", payload, { auth: true });
      }
      setFormOpen(false);
      await loadProducts();
    } catch (err) {
      setFormErrors(err.errors || { general: [err.message] });
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id) => {
    try {
      await api.delete(`/products/admin/${id}/`, { auth: true });
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const subOptions = form.main_category ? categories[form.main_category] || {} : {};

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Products</h1>
        <button onClick={startCreate} className="px-6 py-2 bg-gold text-bg label-caps rounded hover:opacity-90">
          + New Product
        </button>
      </div>

      {error && <p className="text-error mb-4">{error}</p>}

      {formOpen && (
        <form onSubmit={submitForm} className="bg-surface-1 border border-outline-soft rounded-lg p-6 mb-8 space-y-4">
          <h2 className="font-display text-xl mb-2">{editingId ? "Edit Product" : "New Product"}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-caps text-ink-muted block mb-2">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface-2 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="label-caps text-ink-muted block mb-2">Image URL</label>
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full bg-surface-2 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="label-caps text-ink-muted block mb-2">Main Category</label>
              <select
                value={form.main_category}
                onChange={(e) => setForm({ ...form, main_category: e.target.value, sub_category: "" })}
                className="w-full bg-surface-2 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
              >
                {Object.keys(categories).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-caps text-ink-muted block mb-2">Sub Category</label>
              <select
                required
                value={form.sub_category}
                onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                className="w-full bg-surface-2 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
              >
                <option value="">Select…</option>
                {Object.entries(subOptions).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-caps text-ink-muted block mb-2">Price</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-surface-2 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="label-caps text-ink-muted block mb-2">Stock (availability)</label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full bg-surface-2 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="label-caps text-ink-muted block mb-2">Material (optional)</label>
              <input
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="w-full bg-surface-2 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="label-caps text-ink-muted block mb-2">Colors (comma separated)</label>
              <input
                value={form.colors_available}
                onChange={(e) => setForm({ ...form, colors_available: e.target.value })}
                className="w-full bg-surface-2 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
              />
            </div>
          </div>
          <div>
            <label className="label-caps text-ink-muted block mb-2">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-surface-2 border border-outline-soft rounded px-3 py-2 text-ink focus:border-gold outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active (visible in the public shop)
          </label>

          {formErrors && Object.entries(formErrors).map(([field, msgs]) => (
            <p key={field} className="text-error text-sm">
              {field}: {Array.isArray(msgs) ? msgs.join(", ") : String(msgs)}
            </p>
          ))}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2 bg-gold text-bg label-caps rounded hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving…" : editingId ? "Save Changes" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-6 py-2 border border-outline-soft label-caps rounded hover:border-gold hover:text-gold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <div className="bg-surface-1 border border-outline-soft rounded-lg divide-y divide-outline-soft">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-ink truncate">{p.name}</p>
                <p className="text-ink-muted text-xs">
                  {p.main_category} / {p.sub_category} · {formatNaira(p.price)} · stock: {p.stock}
                  {!p.is_active && <span className="text-error"> · inactive</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => startEdit(p)} className="label-caps text-ink-muted hover:text-gold">
                  Edit
                </button>
                {p.is_active && (
                  <button onClick={() => deactivate(p.id)} className="label-caps text-ink-muted hover:text-error">
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="p-4 text-ink-muted text-sm">No products yet.</p>}
        </div>
      )}
    </div>
  );
}
