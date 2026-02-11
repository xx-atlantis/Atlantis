"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UploadCloud, ImageIcon } from "lucide-react";

// 1. Add 'path' to props (passed from FieldRenderer)
export default function ImageUploader({ value, onChange, label, disabled, path }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 2. Create a unique ID using path or label
  const uniqueId = `file-${path || label || Math.random().toString(36).slice(2)}`;

  const pick = (e) => {
    if (disabled) return;
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const upload = async () => {
    if (!file || disabled) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/cloudinary/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setUploading(false);

    if (data?.url) {
      onChange(data.url);
      setFile(null);
      setPreview(null);
    }
  };

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

      <div className="border rounded-xl p-4 bg-gray-50">
        {value || preview ? (
          <Image
            src={preview || value}
            alt="Preview"
            width={320}
            height={180}
            className="rounded-lg object-cover border"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <ImageIcon size={32} />
            <span className="text-sm mt-2">No image selected</span>
          </div>
        )}
      </div>

      {!disabled && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            // 3. Reference the unique ID
            onClick={() => document.getElementById(uniqueId).click()}
          >
            Choose Image
          </Button>

          {preview && (
            <Button onClick={upload} disabled={uploading}>
              <UploadCloud size={14} className="mr-1" />
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          )}
        </div>
      )}
      
      <input
        // 4. Set the unique ID here
        id={uniqueId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pick}
        disabled={disabled}
      />
    </div>
  );
}