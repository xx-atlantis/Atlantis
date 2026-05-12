"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Save, Loader2, UploadCloud, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

/* ── Cloudinary image uploader ─────────────────────────── */
function ImgUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  const id = `img-cu-${label}`;

  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", f);
    const res = await fetch("/api/cloudinary/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (data?.url) onChange(data.url);
    else toast.error("Image upload failed");
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</p>}
      <div className="relative w-full h-44 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
        {value ? (
          <Image src={value} alt={label} fill className="object-cover rounded-xl" />
        ) : (
          <div className="text-center text-gray-400">
            <ImageIcon size={28} className="mx-auto mb-1" />
            <span className="text-xs">No image</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
            <Loader2 size={24} className="text-white animate-spin" />
          </div>
        )}
      </div>
      <label htmlFor={id} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition">
        <UploadCloud size={13} /> {value ? "Change Image" : "Upload Image"}
      </label>
      <input id={id} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  );
}

const defaultContent = () => ({
  heroImage: "",
  brand: "Atlantis",
  mainTitle: "",
  form: { name: "", email: "", subject: "", message: "", button: "" },
});

/* ── Main page ─────────────────────────────────────────── */
export default function AdminContactUs() {
  const [lang, setLang] = useState("en");
  const [en, setEn] = useState(defaultContent);
  const [ar, setAr] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const current = lang === "en" ? en : ar;
  const setCurrent = lang === "en" ? setEn : setAr;

  useEffect(() => {
    fetch("/api/admin/content?page=contact-us")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.contactus?.en) setEn({ ...defaultContent(), ...data.contactus.en });
        if (data?.contactus?.ar) setAr({ ...defaultContent(), ...data.contactus.ar });
      })
      .catch(() => toast.error("Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  const patch = (field, value) => setCurrent((prev) => ({ ...prev, [field]: value }));
  const patchForm = (field, value) =>
    setCurrent((prev) => ({ ...prev, form: { ...prev.form, [field]: value } }));

  const save = async () => {
    setSaving(true);
    const promise = fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "contact-us", key: "contactus", locale: lang, content: current }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
      return json;
    });

    toast.promise(promise, {
      pending: `Saving ${lang.toUpperCase()}…`,
      success: `${lang.toUpperCase()} saved!`,
      error: { render: ({ data }) => data?.message || "Save failed" },
    });

    try { await promise; } catch (_) {}
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Us Page</h1>
          <p className="text-sm text-gray-500 mt-1">Edit the contact page hero image and form labels.</p>
        </div>
        <Button onClick={save} disabled={saving} className="flex items-center gap-2">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save {lang.toUpperCase()}
        </Button>
      </div>

      {/* Language switcher */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {["en", "ar"].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-5 py-1.5 rounded-md text-sm font-semibold transition ${
              lang === l ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {l === "en" ? "English" : "العربية"}
          </button>
        ))}
      </div>

      {/* Hero Image */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Hero Image</h2>
        <ImgUpload label="Background Image" value={current.heroImage} onChange={(url) => patch("heroImage", url)} />
      </div>

      {/* Page Text */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Page Text</h2>
        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Brand Name</label>
          <Input className="mt-1" value={current.brand || ""} onChange={(e) => patch("brand", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Main Heading</label>
          <Input className="mt-1" value={current.mainTitle || ""} onChange={(e) => patch("mainTitle", e.target.value)} dir={lang === "ar" ? "rtl" : "ltr"} />
        </div>
      </div>

      {/* Form Labels */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Form Labels</h2>
        {[
          { field: "name", label: "Name Placeholder" },
          { field: "email", label: "Email Placeholder" },
          { field: "subject", label: "Subject Placeholder" },
          { field: "message", label: "Message Placeholder" },
          { field: "button", label: "Submit Button Text" },
        ].map(({ field, label }) => (
          <div key={field}>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
            <Input
              className="mt-1"
              value={current.form?.[field] || ""}
              onChange={(e) => patchForm(field, e.target.value)}
              dir={lang === "ar" ? "rtl" : "ltr"}
            />
          </div>
        ))}
      </div>

      {/* Sticky save */}
      <div className="sticky bottom-4">
        <Button onClick={save} disabled={saving} className="w-full shadow-lg flex items-center gap-2 justify-center py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save {lang.toUpperCase()} Content
        </Button>
      </div>
    </main>
  );
}
