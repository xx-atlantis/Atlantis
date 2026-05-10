"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Trash2, Save, Loader2, UploadCloud, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

/* ─── helpers ─────────────────────────────────────────────────── */
const emptyProject = () => ({
  title: "",
  before: "",
  after: "",
  review: { avatar: "", name: "", location: "", text: "" },
});

const defaultContent = () => ({
  smallTitle: "",
  mainTitle: { normal: "", highlight: "" },
  list: [],
});

/* ─── tiny cloudinary uploader ────────────────────────────────── */
function ImgUpload({ value, onChange, label }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const id = `img-${label}-${Math.random().toString(36).slice(2)}`;

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    upload(f);
  };

  const upload = async (file) => {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/cloudinary/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (data?.url) { onChange(data.url); setPreview(null); }
    else toast.error("Image upload failed");
  };

  const src = preview || value;

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</p>}
      <div className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
        {src ? (
          <Image src={src} alt={label} fill className="object-cover rounded-xl" />
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
        <UploadCloud size={13} /> {src ? "Change" : "Upload"}
      </label>
      <input id={id} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  );
}

/* ─── main page ───────────────────────────────────────────────── */
export default function BeforeAfterAdmin() {
  const [lang, setLang] = useState("en");
  const [en, setEn] = useState(defaultContent);
  const [ar, setAr] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const current = lang === "en" ? en : ar;
  const setCurrent = lang === "en" ? setEn : setAr;

  /* load */
  useEffect(() => {
    fetch("/api/admin/content?page=home")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.projects?.en) setEn(data.projects.en);
        if (data?.projects?.ar) setAr(data.projects.ar);
      })
      .catch(() => toast.error("Failed to load content"))
      .finally(() => setLoading(false));
  }, []);

  /* nested patch helpers */
  const patchRoot = (field, value) =>
    setCurrent((prev) => ({ ...prev, [field]: value }));

  const patchMainTitle = (sub, value) =>
    setCurrent((prev) => ({
      ...prev,
      mainTitle: { ...prev.mainTitle, [sub]: value },
    }));

  const patchProject = (idx, field, value) =>
    setCurrent((prev) => {
      const list = structuredClone(prev.list);
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, list };
    });

  const patchReview = (idx, field, value) =>
    setCurrent((prev) => {
      const list = structuredClone(prev.list);
      list[idx] = { ...list[idx], review: { ...list[idx].review, [field]: value } };
      return { ...prev, list };
    });

  const addProject = () =>
    setCurrent((prev) => ({ ...prev, list: [...prev.list, emptyProject()] }));

  const removeProject = (idx) =>
    setCurrent((prev) => {
      const list = [...prev.list];
      list.splice(idx, 1);
      return { ...prev, list };
    });

  /* save */
  const save = async () => {
    setSaving(true);
    const promise = fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "home", key: "projects", locale: lang, content: current }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
      return json;
    });

    toast.promise(promise, {
      pending: `Saving ${lang.toUpperCase()} content…`,
      success: `${lang.toUpperCase()} content saved!`,
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
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Before / After Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Edit the slider projects and customer reviews shown on the homepage.</p>
        </div>
        <Button onClick={save} disabled={saving} className="flex items-center gap-2">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save {lang.toUpperCase()}
        </Button>
      </div>

      {/* language switcher */}
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

      {/* section titles */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 mb-1">Section Titles</h2>
        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Small Label</label>
          <Input className="mt-1" value={current.smallTitle} onChange={(e) => patchRoot("smallTitle", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Main Title (Normal)</label>
            <Input className="mt-1" value={current.mainTitle?.normal} onChange={(e) => patchMainTitle("normal", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Main Title (Highlight)</label>
            <Input className="mt-1" value={current.mainTitle?.highlight} onChange={(e) => patchMainTitle("highlight", e.target.value)} />
          </div>
        </div>
      </div>

      {/* projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Projects ({current.list.length})</h2>
          <Button variant="outline" size="sm" onClick={addProject} className="flex items-center gap-1">
            <Plus size={14} /> Add Project
          </Button>
        </div>

        {current.list.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            No projects yet. Click "Add Project" to get started.
          </div>
        )}

        {current.list.map((proj, i) => (
          <div key={i} className="bg-white rounded-xl border p-5 space-y-5">
            {/* project header */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Project {i + 1}</span>
              <button
                onClick={() => removeProject(i)}
                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>

            {/* tab title */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tab Title</label>
              <Input
                className="mt-1"
                value={proj.title || ""}
                onChange={(e) => patchProject(i, "title", e.target.value)}
              />
            </div>

            {/* before / after images */}
            <div className="grid grid-cols-2 gap-4">
              <ImgUpload
                label="Before Image"
                value={proj.before}
                onChange={(url) => patchProject(i, "before", url)}
              />
              <ImgUpload
                label="After Image"
                value={proj.after}
                onChange={(url) => patchProject(i, "after", url)}
              />
            </div>

            {/* review */}
            <div className="border-t pt-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer Review</p>

              {/* avatar */}
              <div className="flex items-start gap-4">
                <div className="w-36 shrink-0">
                  <ImgUpload
                    label="Avatar Photo"
                    value={proj.review?.avatar}
                    onChange={(url) => patchReview(i, "avatar", url)}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reviewer Name</label>
                    <Input
                      className="mt-1"
                      value={proj.review?.name || ""}
                      onChange={(e) => patchReview(i, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Location</label>
                    <Input
                      className="mt-1"
                      value={proj.review?.location || ""}
                      onChange={(e) => patchReview(i, "location", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Review Text</label>
                <Textarea
                  rows={3}
                  className="mt-1"
                  value={proj.review?.text || ""}
                  onChange={(e) => patchReview(i, "text", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* sticky save */}
      {current.list.length > 0 && (
        <div className="sticky bottom-4">
          <Button onClick={save} disabled={saving} className="w-full shadow-lg flex items-center gap-2 justify-center py-3">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save {lang.toUpperCase()} Content
          </Button>
        </div>
      )}
    </main>
  );
}
