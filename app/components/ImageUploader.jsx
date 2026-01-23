"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ImageUploader({ value, onChange, inputId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async () => {
    if (!selectedFile) return;

    const form = new FormData();
    form.append("file", selectedFile);

    setUploading(true);

    const res = await fetch("/api/cloudinary/upload", {
      method: "POST",
      body: form,
    });

    setUploading(false);

    const data = await res.json();

    if (data?.url) {
      onChange(data.url); // Return uploaded URL
      setPreview(null);
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* ============================================================
          CASE 1: NO URL + NO PREVIEW → Show Upload Box
      ============================================================ */}
      {!value && !preview && (
        <div
          className="w-[260px] h-[160px] border border-gray-300 bg-gray-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
          onClick={() => document.getElementById(inputId).click()}
        >
          <p className="text-sm text-gray-600 mb-1">Upload Image</p>
          <Button size="sm" variant="secondary">
            Browse
          </Button>

          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFilePick}
          />
        </div>
      )}

      {/* ============================================================
          CASE 2: SHOW CURRENT IMAGE (when URL exists and no preview)
      ============================================================ */}
      {value && !preview && (
        <div>
          <Image
            src={value}
            alt="Uploaded Image"
            width={260}
            height={160}
            className="rounded-lg border object-cover"
          />

          <Button
            variant="secondary"
            className="mt-3 bg-rose-800 text-white hover:bg-rose-600"
            onClick={() => document.getElementById(inputId).click()}
          >
            Change Image
          </Button>

          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFilePick}
          />
        </div>
      )}

      {/* ============================================================
          CASE 3: PREVIEW SELECTED IMAGE (before upload)
      ============================================================ */}
      {preview && (
        <div>
          <Image
            src={preview}
            alt="Preview"
            width={260}
            height={160}
            className="rounded-lg border object-cover"
          />

          {/* Change Image Button */}
          <Button
            variant="secondary"
            className="mt-3 bg-rose-800 text-white hover:bg-rose-600"
            onClick={() => document.getElementById(inputId).click()}
          >
            Change Image
          </Button>

          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFilePick}
          />

          {/* Upload Button */}
          <Button
            className="mt-3"
            onClick={uploadToCloudinary}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      )}
    </div>
  );
  
}
