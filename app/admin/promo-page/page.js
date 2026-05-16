"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Trash2, Pencil, X, Save, Loader2, Tag, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import MediaPicker from "@/app/admin/_components/MediaPicker";


const emptyPromo = () => ({
  titleEn: "", titleAr: "",
  descEn: "", descAr: "",
  badgeEn: "", badgeAr: "",
  ctaTextEn: "", ctaTextAr: "",
  image: "",
  link: "",
  couponCode: "",
  isActive: true,
  validUntil: "",
});

/* ── Promo form modal ──────────────────────────────────── */
function PromoForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyPromo());
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.titleEn.trim() || !form.titleAr.trim()) {
      toast.warn("Both EN and AR titles are required");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">{initial?.id ? "Edit Promotion" : "New Promotion"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Image */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Promotion Image</label>
            <MediaPicker value={form.image} onChange={(url) => set("image", url)} />
          </div>

          {/* Titles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Title (EN) *</label>
              <Input className="mt-1" value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} placeholder="e.g. Summer Sale" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Title (AR) *</label>
              <Input className="mt-1" value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} placeholder="مثال: تخفيضات الصيف" dir="rtl" />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description (EN)</label>
              <Textarea className="mt-1" rows={3} value={form.descEn} onChange={(e) => set("descEn", e.target.value)} placeholder="Short description..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description (AR)</label>
              <Textarea className="mt-1" rows={3} value={form.descAr} onChange={(e) => set("descAr", e.target.value)} placeholder="وصف قصير..." dir="rtl" />
            </div>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Badge Text (EN)</label>
              <Input className="mt-1" value={form.badgeEn} onChange={(e) => set("badgeEn", e.target.value)} placeholder="e.g. 30% OFF" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Badge Text (AR)</label>
              <Input className="mt-1" value={form.badgeAr} onChange={(e) => set("badgeAr", e.target.value)} placeholder="مثال: ٣٠٪ خصم" dir="rtl" />
            </div>
          </div>

          {/* CTA Button Text */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">CTA Button Text (EN)</label>
              <Input className="mt-1" value={form.ctaTextEn} onChange={(e) => set("ctaTextEn", e.target.value)} placeholder="e.g. Claim Offer" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">CTA Button Text (AR)</label>
              <Input className="mt-1" value={form.ctaTextAr} onChange={(e) => set("ctaTextAr", e.target.value)} placeholder="مثال: احصل على العرض" dir="rtl" />
            </div>
          </div>

          {/* Link & Coupon */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">CTA Link (optional)</label>
              <Input className="mt-1" value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="/shop or https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Coupon Code (optional)</label>
              <Input className="mt-1 font-mono uppercase" value={form.couponCode} onChange={(e) => set("couponCode", e.target.value.toUpperCase())} placeholder="SUMMER30" />
            </div>
          </div>

          {/* Valid until + Active */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Valid Until (optional)</label>
              <Input
                className="mt-1"
                type="date"
                value={form.validUntil ? form.validUntil.slice(0, 10) : ""}
                onChange={(e) => set("validUntil", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 pb-1">
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`w-11 h-6 rounded-full relative transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-5" : ""}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">{form.isActive ? "Active" : "Hidden"}</span>
            </div>
          </div>
        </div>

        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {initial?.id ? "Update" : "Create"} Promotion
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function PromoAdminPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null); // null = closed, {} = new, {...} = editing
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promotions?all=true").then((r) => r.json());
      setPromotions(res.data || []);
    } catch { toast.error("Failed to load promotions"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    const isEdit = !!form.id;
    const url = isEdit ? `/api/promotions/${form.id}` : "/api/promotions";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((r) => r.json());

    if (res.success) {
      toast.success(isEdit ? "Promotion updated!" : "Promotion created!");
      setModalData(null);
      await load();
    } else {
      toast.error(res.error || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this promotion?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) { toast.success("Deleted"); await load(); }
    else toast.error(res.error || "Delete failed");
    setDeletingId(null);
  };

  const toggleActive = async (promo) => {
    await fetch(`/api/promotions/${promo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...promo, isActive: !promo.isActive }),
    }).then((r) => r.json());
    await load();
  };

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional offers displayed on the Promotions page.</p>
        </div>
        <Button onClick={() => setModalData(emptyPromo())} className="flex items-center gap-2">
          <Plus size={15} /> Add Promotion
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
          <Tag size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No promotions yet.</p>
          <p className="text-sm mt-1">Click "Add Promotion" to create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {promotions.map((promo) => {
            const expired = promo.validUntil && new Date(promo.validUntil) < new Date();
            return (
              <div key={promo.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${!promo.isActive || expired ? "opacity-60" : ""}`}>
                {/* Image */}
                <div className="relative h-36 bg-[#F5F3EF]">
                  {promo.image ? (
                    <Image src={promo.image} alt={promo.titleEn} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tag size={28} className="text-gray-200" />
                    </div>
                  )}
                  {promo.badgeEn && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#2D3247] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">{promo.badgeEn}</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${promo.isActive && !expired ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {expired ? "Expired" : promo.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{promo.titleEn}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1" dir="rtl">{promo.titleAr}</p>
                  {promo.couponCode && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2D3247] border border-dashed border-[#2D3247]/40 rounded px-2 py-0.5">
                      <Tag size={10} /> {promo.couponCode}
                    </span>
                  )}
                  {promo.validUntil && (
                    <p className="text-[11px] text-gray-400">Until: {new Date(promo.validUntil).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <button
                    onClick={() => setModalData({ ...promo, validUntil: promo.validUntil ? promo.validUntil.slice(0, 10) : "" })}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => toggleActive(promo)}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg py-1.5 px-2.5 hover:bg-gray-50 transition"
                  >
                    {promo.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    disabled={deletingId === promo.id}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg py-1.5 px-2.5 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deletingId === promo.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalData !== null && (
        <PromoForm
          initial={modalData}
          onSave={handleSave}
          onClose={() => setModalData(null)}
        />
      )}
    </main>
  );
}
