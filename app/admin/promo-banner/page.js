"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Megaphone } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DEFAULTS = {
  isActive: false,
  textEn: "",
  textAr: "",
  link: "",
  bgColor: "#2D3247",
  textColor: "#ffffff",
};

export default function PromoBannerAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...DEFAULTS });

  useEffect(() => {
    fetch("/api/admin/promo-banner")
      .then((r) => r.json())
      .then(({ data }) => { if (data) setForm({ ...DEFAULTS, ...data }); })
      .catch(() => toast.error("Failed to load banner"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promo-banner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");
      toast.success("Promo banner saved!");
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] p-8 space-y-6">
      <ToastContainer position="bottom-right" theme="light" />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promo Banner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the announcement bar shown at the top of every page.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#2D3247] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1e2231] disabled:opacity-60 transition"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          {form.isActive && (form.textEn || form.textAr) && (
            <div
              className="rounded-xl py-3 px-6 text-center text-sm font-medium"
              style={{ backgroundColor: form.bgColor, color: form.textColor }}
            >
              {form.textEn || form.textAr}
              {form.link && <span className="ml-2 underline opacity-70">→ link</span>}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Megaphone size={16} /> Banner Settings
            </h2>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("isActive", !form.isActive)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-[#2D3247]" : "bg-gray-200"}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {form.isActive ? "Banner is active (visible to visitors)" : "Banner is inactive (hidden)"}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">English Text</label>
                <input
                  value={form.textEn}
                  onChange={(e) => set("textEn", e.target.value)}
                  placeholder="Free shipping on orders over SAR 500!"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Arabic Text</label>
                <input
                  dir="rtl"
                  value={form.textAr}
                  onChange={(e) => set("textAr", e.target.value)}
                  placeholder="شحن مجاني للطلبات التي تتجاوز 500 ريال!"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Link URL (optional)</label>
              <input
                value={form.link}
                onChange={(e) => set("link", e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) => set("bgColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                  />
                  <input
                    value={form.bgColor}
                    onChange={(e) => set("bgColor", e.target.value)}
                    placeholder="#2D3247"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.textColor}
                    onChange={(e) => set("textColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                  />
                  <input
                    value={form.textColor}
                    onChange={(e) => set("textColor", e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
