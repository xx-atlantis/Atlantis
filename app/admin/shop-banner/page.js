"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Loader2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DEFAULT = { heroImage: "", heroTitle: "", heroSubtitle: "", brand: "Atlantis" };

export default function ShopBannerAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [en, setEn] = useState({ ...DEFAULT });
  const [ar, setAr] = useState({ ...DEFAULT });
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/admin/shop-banner")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.en) setEn({ ...DEFAULT, ...data.en });
        if (data?.ar) setAr({ ...DEFAULT, ...data.ar });
      })
      .catch(() => toast.error("Failed to load banner"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const arPayload = { ...ar, heroImage: en.heroImage, brand: en.brand };
      const res = await fetch("/api/admin/shop-banner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ en, ar: arPayload }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");
      toast.success("Shop banner saved!");
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/cloudinary/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.url) throw new Error("Upload failed");
      setEn((prev) => ({ ...prev, heroImage: json.url }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const field = (locale, key, label, placeholder, dir = "ltr") => {
    const state = locale === "en" ? en : ar;
    const setState = locale === "en" ? setEn : setAr;
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
        <input
          dir={dir}
          value={state[key]}
          onChange={(e) => setState((prev) => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
        />
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#fafafa] p-8 space-y-6">
      <ToastContainer position="bottom-right" theme="light" />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Banner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit the hero section displayed at the top of the shop page.
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
        <div className="space-y-6">
          {/* Shared image + brand */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <ImageIcon size={16} /> Banner Image &amp; Brand
            </h2>

            {/* Image upload area */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Banner Image</label>
              <div className="flex gap-2">
                <input
                  value={en.heroImage}
                  onChange={(e) => setEn((prev) => ({ ...prev, heroImage: e.target.value }))}
                  placeholder="/shop-banner.jpg or Cloudinary URL"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                />
              </div>
            </div>

            {field("en", "brand", "Brand Name", "Atlantis")}

            {en.heroImage && (
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 max-h-48">
                <img src={en.heroImage} alt="preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          {/* English content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">English Content</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("en", "heroTitle", "Title", "Our Exclusive Collection")}
              {field("en", "heroSubtitle", "Subtitle", "Discover premium products curated just for you.")}
            </div>
          </div>

          {/* Arabic content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Arabic Content</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("ar", "heroTitle", "Title (AR)", "مجموعتنا الحصرية", "rtl")}
              {field("ar", "heroSubtitle", "Subtitle (AR)", "اكتشف أفضل المنتجات المختارة بعناية لك.", "rtl")}
            </div>
            <p className="text-xs text-gray-400">Brand name and image are shared between both languages.</p>
          </div>
        </div>
      )}
    </main>
  );
}
