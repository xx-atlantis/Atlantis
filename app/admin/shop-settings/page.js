"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Trash2, Pencil, X, Check, Loader2, Tag, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ─── Generic bilingual item form ─────────────────────────── */
function ItemForm({ onSave, onCancel, initial }) {
  const [en, setEn] = useState(initial?.en || "");
  const [ar, setAr] = useState(initial?.ar || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!en.trim() || !ar.trim()) {
      toast.warn("Both English and Arabic names are required");
      return;
    }
    setSaving(true);
    await onSave({ en: en.trim(), ar: ar.trim() });
    setSaving(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-end bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
      <div className="flex-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">English Name</label>
        <Input value={en} onChange={(e) => setEn(e.target.value)} placeholder="e.g. Velvet" />
      </div>
      <div className="flex-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Arabic Name</label>
        <Input value={ar} onChange={(e) => setAr(e.target.value)} placeholder="مثال: مخمل" dir="rtl" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving} className="flex items-center gap-1">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          {initial ? "Update" : "Add"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X size={13} />
        </Button>
      </div>
    </div>
  );
}

/* ─── Generic list panel ──────────────────────────────────── */
function ListPanel({ title, items, loading, onAdd, onUpdate, onDelete, icon: Icon }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleAdd = async ({ en, ar }) => {
    await onAdd({ en, ar });
    setShowForm(false);
  };

  const handleUpdate = async (id, { en, ar }) => {
    await onUpdate(id, { en, ar });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-gray-500" />}
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">{items.length}</span>
        </div>
        <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); }} className="flex items-center gap-1">
          <Plus size={13} /> Add New
        </Button>
      </div>

      <div className="p-5 space-y-3">
        {showForm && (
          <ItemForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading…
          </div>
        ) : items.length === 0 && !showForm ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No items yet. Click "Add New" to get started.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <ItemForm
                  initial={{ en: item.en, ar: item.ar }}
                  onSave={(vals) => handleUpdate(item.id, vals)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border bg-gray-50 hover:bg-white transition">
                  <div className="flex gap-6 flex-1 min-w-0">
                    <div className="min-w-0">
                      <span className="text-xs text-gray-400 uppercase tracking-wide block">EN</span>
                      <span className="font-medium text-gray-900 truncate block">{item.en}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-gray-400 uppercase tracking-wide block">AR</span>
                      <span className="font-medium text-gray-900 truncate block" dir="rtl">{item.ar}</span>
                    </div>
                    {item.productCount !== undefined && (
                      <div className="hidden sm:block">
                        <span className="text-xs text-gray-400 uppercase tracking-wide block">Products</span>
                        <span className="text-sm text-gray-600">{item.productCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setEditingId(item.id); setShowForm(false); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function ShopSettingsPage() {
  const [tab, setTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingMats, setLoadingMats] = useState(true);

  /* ── Load both ── */
  useEffect(() => {
    loadCategories();
    loadMaterials();
  }, []);

  const loadCategories = async () => {
    setLoadingCats(true);
    try {
      const [en, ar] = await Promise.all([
        fetch("/api/categories?locale=en").then((r) => r.json()),
        fetch("/api/categories?locale=ar").then((r) => r.json()),
      ]);
      const enMap = Object.fromEntries((en.data || []).map((c) => [c.id, c.name]));
      const arMap = Object.fromEntries((ar.data || []).map((c) => [c.id, c.name]));
      const ids = [...new Set([...(en.data || []).map((c) => c.id)])];
      setCategories(
        ids.map((id) => ({
          id,
          en: enMap[id] || "",
          ar: arMap[id] || "",
          productCount: (en.data || []).find((c) => c.id === id)?.productCount,
        }))
      );
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoadingCats(false);
    }
  };

  const loadMaterials = async () => {
    setLoadingMats(true);
    try {
      const [en, ar] = await Promise.all([
        fetch("/api/materials?locale=en").then((r) => r.json()),
        fetch("/api/materials?locale=ar").then((r) => r.json()),
      ]);
      const enMap = Object.fromEntries((en.data || []).map((m) => [m.id, m.name]));
      const arMap = Object.fromEntries((ar.data || []).map((m) => [m.id, m.name]));
      const ids = [...new Set([...(en.data || []).map((m) => m.id)])];
      setMaterials(ids.map((id) => ({ id, en: enMap[id] || "", ar: arMap[id] || "" })));
    } catch {
      toast.error("Failed to load materials");
    } finally {
      setLoadingMats(false);
    }
  };

  /* ── Categories CRUD ── */
  const addCategory = async ({ en, ar }) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ en: { name: en }, ar: { name: ar } }),
    }).then((r) => r.json());
    if (res.success) { toast.success("Category added"); await loadCategories(); }
    else toast.error(res.error || "Failed to add category");
  };

  const updateCategory = async (id, { en, ar }) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ en: { name: en }, ar: { name: ar } }),
    }).then((r) => r.json());
    if (res.success) { toast.success("Category updated"); await loadCategories(); }
    else toast.error(res.error || "Failed to update category");
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) { toast.success("Category deleted"); await loadCategories(); }
    else toast.error(res.error || "Cannot delete — category may have products");
  };

  /* ── Materials CRUD ── */
  const addMaterial = async ({ en, ar }) => {
    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ en: { name: en }, ar: { name: ar } }),
    }).then((r) => r.json());
    if (res.success) { toast.success("Material added"); await loadMaterials(); }
    else toast.error(res.error || "Failed to add material");
  };

  const updateMaterial = async (id, { en, ar }) => {
    const res = await fetch(`/api/materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ en: { name: en }, ar: { name: ar } }),
    }).then((r) => r.json());
    if (res.success) { toast.success("Material updated"); await loadMaterials(); }
    else toast.error(res.error || "Failed to update material");
  };

  const deleteMaterial = async (id) => {
    const res = await fetch(`/api/materials/${id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) { toast.success("Material deleted"); await loadMaterials(); }
    else toast.error(res.error || "Failed to delete material");
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage product categories and materials used across the shop.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {[
          { key: "categories", label: "Categories", icon: Tag },
          { key: "materials", label: "Materials", icon: Layers },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-semibold transition ${
              tab === key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "categories" && (
        <ListPanel
          title="Product Categories"
          icon={Tag}
          items={categories}
          loading={loadingCats}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
      )}

      {tab === "materials" && (
        <ListPanel
          title="Product Materials"
          icon={Layers}
          items={materials}
          loading={loadingMats}
          onAdd={addMaterial}
          onUpdate={updateMaterial}
          onDelete={deleteMaterial}
        />
      )}
    </main>
  );
}
