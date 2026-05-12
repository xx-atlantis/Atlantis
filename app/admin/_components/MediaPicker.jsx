"use client";

import { useState } from "react";
import { UploadCloud, ImageIcon, Images, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import GalleryModal from "./GalleryModal";

/**
 * Unified image picker with upload + gallery.
 * Props:
 *   value      – current image URL
 *   onChange   – called with the new URL (or "" to clear)
 *   label      – optional label text above the picker
 *   disabled   – disables all interaction
 *   aspect     – "square" | "video" | "auto" (default "auto")
 */
export default function MediaPicker({ value, onChange, label, disabled, aspect = "auto" }) {
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const previewClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "video"
      ? "aspect-video"
      : "h-40";

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f || disabled) return;
    e.target.value = "";

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", f);
      const res = await fetch("/api/cloudinary/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data?.url) onChange(data.url);
      else toast.error("Upload failed");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {label && (
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
        )}

        {/* Preview */}
        <div
          className={`relative w-full ${previewClass} rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center`}
        >
          {value ? (
            <Image src={value} alt="preview" fill className="object-cover" />
          ) : (
            <div className="text-center text-gray-400 p-4">
              <ImageIcon size={28} className="mx-auto mb-1.5" />
              <span className="text-xs">No image</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <Loader2 size={22} className="text-white animate-spin" />
              <span className="text-white text-xs font-medium">Uploading…</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {!disabled && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Upload new */}
            <label className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition font-medium text-gray-700">
              <UploadCloud size={13} />
              {value ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
                disabled={uploading}
              />
            </label>

            {/* Choose from gallery */}
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700"
            >
              <Images size={13} />
              Gallery
            </button>

            {/* Remove */}
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition font-medium"
              >
                <X size={12} />
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      {galleryOpen && (
        <GalleryModal
          onSelect={(url) => { onChange(url); setGalleryOpen(false); }}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}
