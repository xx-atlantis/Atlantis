"use client";

import { useState, useEffect } from "react";
import { Trash2, GripVertical, Plus, Loader2, Save } from "lucide-react";
import Image from "next/image";
import MediaPicker from "@/app/admin/_components/MediaPicker";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "/api/admin/deliver-gallery";

export default function DeliverGalleryAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [adding, setAdding] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Failed to load gallery"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Gallery saved!");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addImage = async () => {
    if (!newUrl) return toast.error("Please select an image first");
    setAdding(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, alt: newAlt }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData((prev) => ({ ...prev, images: [...(prev?.images || []), json.data] }));
      setNewUrl("");
      setNewAlt("");
      toast.success("Image added!");
    } catch (err) {
      toast.error(err.message || "Failed to add image");
    } finally {
      setAdding(false);
    }
  };

  const deleteImage = async (id) => {
    if (!confirm("Remove this image?")) return;
    try {
      const res = await fetch(API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData((prev) => ({ ...prev, images: prev.images.filter((img) => img.id !== id) }));
      toast.success("Image removed");
    } catch (err) {
      toast.error(err.message || "Failed to remove image");
    }
  };

  const onDragStart = (i) => setDragIdx(i);
  const onDragOver = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const updated = [...data.images];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(i, 0, moved);
    setData((prev) => ({ ...prev, images: updated }));
    setDragIdx(i);
  };
  const onDragEnd = () => setDragIdx(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] p-8">
      <ToastContainer position="bottom-right" theme="light" />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">What We Deliver</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gallery shown on the Promotions page — edit heading, subheading, and images.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#2D3247] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1e2231] disabled:opacity-50 transition"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save All
        </button>
      </div>

      {/* Headings */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 space-y-4">
        <h2 className="font-semibold text-gray-800 text-lg">Section Headings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Heading (EN)</label>
            <input
              value={data?.headingEn || ""}
              onChange={(e) => setData((p) => ({ ...p, headingEn: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Heading (AR)</label>
            <input
              dir="rtl"
              value={data?.headingAr || ""}
              onChange={(e) => setData((p) => ({ ...p, headingAr: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Subheading (EN)</label>
            <textarea
              rows={2}
              value={data?.subheadingEn || ""}
              onChange={(e) => setData((p) => ({ ...p, subheadingEn: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Subheading (AR)</label>
            <textarea
              dir="rtl"
              rows={2}
              value={data?.subheadingAr || ""}
              onChange={(e) => setData((p) => ({ ...p, subheadingAr: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Add image */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4 text-lg">Add Image</h2>
        <div className="flex gap-6 items-end flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <MediaPicker label="Gallery Image" value={newUrl} onChange={setNewUrl} aspect="auto" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Caption (optional)</label>
            <input
              value={newAlt}
              onChange={(e) => setNewAlt(e.target.value)}
              placeholder="e.g. Living room transformation"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
            />
          </div>
          <button
            onClick={addImage}
            disabled={adding || !newUrl}
            className="flex items-center gap-2 bg-[#6D9494] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#5a7e7e] disabled:opacity-50 transition"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add Image
          </button>
        </div>
      </div>

      {/* Image list */}
      {(!data?.images || data.images.length === 0) ? (
        <div className="text-center py-20 text-gray-400">
          No images yet. Add your first gallery image above.
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">Drag rows to reorder, then click Save All.</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {data.images.map((img, i) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDragEnd={onDragEnd}
                className={`flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 cursor-grab active:cursor-grabbing transition ${
                  dragIdx === i ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <GripVertical size={18} className="text-gray-300 shrink-0" />
                <div className="w-28 h-16 relative rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                  <Image src={img.url} alt={img.alt || "Gallery"} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <input
                    value={img.alt}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        images: prev.images.map((x) => (x.id === img.id ? { ...x, alt: e.target.value } : x)),
                      }))
                    }
                    placeholder="Caption"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
                  />
                </div>
                <span className="text-xs text-gray-400 shrink-0">#{i + 1}</span>
                <button onClick={() => deleteImage(img.id)} className="text-red-400 hover:text-red-600 shrink-0 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
