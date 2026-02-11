"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

/* Convert file → Base64 */
const fileToBase64 = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

export default function FieldRenderer({ value, path, onChange , canCreate, canUpdate, canDelete }) {
  // ============================================================
  // 🖼️ 1) IMAGE SUPPORT — MUST COME BEFORE STRING CHECK
  // ============================================================
  // ============================================================
  // 🖼️ IMAGE UPLOAD via CLOUDINARY
  // ============================================================
  // ============================================================
  // 🖼️ IMAGE UPLOAD (Supports "/" + "http")
  // ============================================================
// Inside FieldRenderer.js
if (typeof value === "string" && (value.startsWith("/") || value.startsWith("http"))) {
  return (
    <ImageUploader 
      value={value} 
      path={path} // ADD THIS LINE
      onChange={(url) => onChange(path, url)} 
      disabled={!canUpdate}
    />
  );
}
  if (typeof value === "string" && value === "") {
    return (
      <ImageUploader value={value} onChange={(url) => onChange(path, url)} disabled={!canUpdate} />
    );
  }

  // ============================================================
  // ✏️ 2) STRINGS (normal text)
  // ============================================================
  if (typeof value === "string") {
    const long = value.length > 50;
    return long ? (
      <Textarea
      disabled={!canUpdate}
        rows={3}
        value={value}
        onChange={(e) => onChange(path, e.target.value)}
      />
    ) : (
      <Input value={value} onChange={(e) => onChange(path, e.target.value)} disabled={!canUpdate} />
    );
  }

  // ============================================================
  // 🧱 3) OBJECTS
  // ============================================================
  if (typeof value === "object" && !Array.isArray(value)) {
    return (
      <div className="space-y-4">
        {Object.keys(value).map((key) => (
          <div key={key}>
            <label className="font-medium capitalize">{key}</label>
            <FieldRenderer
              value={value[key]}
              path={path ? `${path}.${key}` : key}
              onChange={onChange}
              canCreate={canCreate} // PASS THROUGH
              canUpdate={canUpdate} // PASS THROUGH
              canDelete={canDelete}
            />
          </div>
        ))}
      </div>
    );
  }

  // ============================================================
  // 📦 4) ARRAYS
  // ============================================================
  if (Array.isArray(value)) {
    const addItem = () => {
      const template =
        typeof value[0] === "object" ? structuredClone(value[0]) : "";
      onChange(path, [...value, template]);
    };

    const removeItem = (index) => {
      const cp = [...value];
      cp.splice(index, 1);
      onChange(path, cp);
    };

    return (
      <div className="space-y-4">
        {value.map((item, i) => (
          <div
            key={i}
            className="border p-4 rounded-lg bg-white shadow-sm relative"
          >
            {/* <button
              className="absolute top-2 right-2 text-red-600"
              onClick={() => removeItem(i)}
            >
              <Trash2 size={16} />
            </button> */}

            <FieldRenderer
              value={item}
              path={`${path}.${i}`}
              onChange={onChange}
              canCreate={canCreate} // PASS THROUGH
              canUpdate={canUpdate} // PASS THROUGH
              canDelete={canDelete} // PASS THROUGH
            />
          </div>
        ))}

        {/* <Button onClick={addItem} className="flex items-center gap-2">
          <Plus size={14} /> Add Item
        </Button> */}
      </div>
    );
  }

  return <div className="bg-blue-50 text-blue-600 border rounded-xl p-1 text-center">The UI for this Section is Preset you cannot change it. </div>;
}
