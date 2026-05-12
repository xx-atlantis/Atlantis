"use client";

import { useEffect, useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus, Trash2, Pencil, X, Save, Loader2,
  ImageIcon, LayoutGrid, Search, Check, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import MediaPicker from "@/app/admin/_components/MediaPicker";


/* ── Product picker multi-select ───────────────────────── */
function ProductPicker({ allProducts, selectedIds, onChange }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.en?.toLowerCase().includes(q)
    );
  }, [allProducts, search]);

  const toggle = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b bg-gray-50 flex items-center gap-2">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="text-sm bg-transparent outline-none w-full"
        />
        {selectedIds.length > 0 && (
          <span className="text-xs bg-[#2D3247] text-white rounded-full px-2 py-0.5 shrink-0 font-semibold">
            {selectedIds.length} selected
          </span>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-64 divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No products found</p>
        ) : (
          filtered.map((p) => {
            const sel = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                  sel ? "bg-[#2D3247]/5" : "hover:bg-gray-50"
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                    sel ? "bg-[#2D3247] border-[#2D3247]" : "border-gray-300"
                  }`}
                >
                  {sel && <Check size={11} className="text-white" />}
                </div>

                {/* Product image */}
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {p.coverImage ? (
                    <Image src={p.coverImage} alt={p.name || ""} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={14} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {p.category?.en || "—"} {p.sku ? `· ${p.sku}` : ""}
                  </p>
                </div>

                {/* Price */}
                <span className="text-xs font-semibold text-gray-600 shrink-0">
                  {p.price} SAR
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

const emptyCollection = () => ({
  nameEn: "",
  nameAr: "",
  image: "",
  productIds: [],
  isActive: true,
  order: 0,
});

/* ── Collection form modal ─────────────────────────────── */
function CollectionForm({ initial, allProducts, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyCollection());
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.nameEn.trim() || !form.nameAr.trim()) {
      toast.warn("Both EN and AR names are required");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {initial?.id ? "Edit Collection" : "New Collection"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: image + settings */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Cover Image
                </label>
                <MediaPicker value={form.image} onChange={(url) => set("image", url)} aspect="square" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                    Name (EN) *
                  </label>
                  <Input
                    value={form.nameEn}
                    onChange={(e) => set("nameEn", e.target.value)}
                    placeholder="e.g. Best Sellers"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                    Name (AR) *
                  </label>
                  <Input
                    value={form.nameAr}
                    onChange={(e) => set("nameAr", e.target.value)}
                    placeholder="مثال: الأكثر مبيعاً"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) => set("order", Number(e.target.value))}
                    min={0}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-3 pb-1">
                  <button
                    type="button"
                    onClick={() => set("isActive", !form.isActive)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      form.isActive ? "bg-green-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        form.isActive ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {form.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right column: product picker */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                Products in this Collection
              </label>
              <ProductPicker
                allProducts={allProducts}
                selectedIds={form.productIds}
                onChange={(ids) => set("productIds", ids)}
              />
              <p className="text-xs text-gray-400 mt-2">
                {form.productIds.length} product{form.productIds.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {initial?.id ? "Update" : "Create"} Collection
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function CollectionsAdminPage() {
  const [collections, setCollections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [colRes, prodRes] = await Promise.all([
        fetch("/api/collections?all=true").then((r) => r.json()),
        fetch("/api/shop/product?locale=en").then((r) => r.json()),
      ]);
      setCollections(colRes.data || []);
      setAllProducts(prodRes.data || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    const isEdit = !!form.id;
    const url = isEdit ? `/api/collections/${form.id}` : "/api/collections";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((r) => r.json());

    if (res.success) {
      toast.success(isEdit ? "Collection updated!" : "Collection created!");
      setModalData(null);
      await load();
    } else {
      toast.error(res.error || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this collection?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) { toast.success("Deleted"); await load(); }
    else toast.error(res.error || "Delete failed");
    setDeletingId(null);
  };

  const toggleActive = async (col) => {
    await fetch(`/api/collections/${col.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...col, isActive: !col.isActive }),
    });
    await load();
  };

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Collections</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create featured sections like Best Sellers, New Arrivals, etc. They appear as square tiles above your products.
          </p>
        </div>
        <Button
          onClick={() => setModalData(emptyCollection())}
          className="flex items-center gap-2"
        >
          <Plus size={15} /> New Collection
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
          <LayoutGrid size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No collections yet</p>
          <p className="text-sm mt-1">Create your first collection to group products together.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              className={`group relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm transition ${
                !col.isActive ? "opacity-50" : ""
              }`}
            >
              {/* Square tile */}
              <div className="relative aspect-square">
                {col.image ? (
                  <Image src={col.image} alt={col.nameEn} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <LayoutGrid size={32} className="text-gray-300" />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Name */}
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <p className="text-white font-bold text-sm leading-tight">{col.nameEn}</p>
                  <p className="text-white/70 text-xs mt-0.5" dir="rtl">{col.nameAr}</p>
                </div>

                {/* Status badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      col.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {col.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
              </div>

              {/* Info bar */}
              <div className="p-3 bg-white">
                <p className="text-xs text-gray-500 mb-2">
                  {col.productIds.length} product{col.productIds.length !== 1 ? "s" : ""} · Order: {col.order}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setModalData({ ...col })}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={() => toggleActive(col)}
                    className="flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-200 rounded-lg py-1.5 px-2 hover:bg-gray-50 transition"
                    title={col.isActive ? "Hide" : "Show"}
                  >
                    {col.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={() => handleDelete(col.id)}
                    disabled={deletingId === col.id}
                    className="flex items-center justify-center text-xs text-red-500 border border-red-200 rounded-lg py-1.5 px-2 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deletingId === col.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalData !== null && (
        <CollectionForm
          initial={modalData.id ? modalData : null}
          allProducts={allProducts}
          onSave={handleSave}
          onClose={() => setModalData(null)}
        />
      )}
    </main>
  );
}
