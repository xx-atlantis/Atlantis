"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Layers, Type, ImageIcon } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { Label } from "@/components/ui/label";

export default function DataRenderer({ value, path, onChange, canCreate, canUpdate, canDelete, depth = 0 }) {
  
  // 🖼️ IMPROVED IMAGE DETECTION
  const fieldName = path.split('.').pop()?.toLowerCase() || "";
  const isImageKey = fieldName.includes("image") || fieldName.includes("img") || fieldName.includes("icon");
  
  const hasImageValue = typeof value === "string" && (value.startsWith("/") || value.startsWith("http"));
  
  const isImage = isImageKey || hasImageValue;

  if (typeof value === "string" && isImage) {
    return (
      <div className="flex flex-col gap-2 p-2 border rounded-lg bg-gray-50/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
          <ImageIcon size={14} /> IMAGE ASSET
        </div>
        <ImageUploader 
          value={value} 
          path={path} 
          onChange={(url) => onChange(path, url)} 
          disabled={!canUpdate}
        />
      </div>
    );
  }

  // ✏️ STRINGS (Text / Textarea)
  if (typeof value === "string") {
    const isLongText = value.length > 60 || fieldName.includes("description") || fieldName.includes("subtitle");
    
    return (
      <div className="space-y-1.5">
        {isLongText ? (
          <Textarea
            disabled={!canUpdate}
            className="min-h-[80px] bg-white resize-none focus-visible:ring-black"
            value={value}
            placeholder={`Enter ${fieldName}...`}
            onChange={(e) => onChange(path, e.target.value)}
          />
        ) : (
          <Input 
            value={value} 
            placeholder={`Enter ${fieldName}...`}
            onChange={(e) => onChange(path, e.target.value)} 
            disabled={!canUpdate}
            className="bg-white focus-visible:ring-black"
          />
        )}
      </div>
    );
  }

  // 🧱 OBJECTS (Recursive)
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return (
      <div className={`space-y-4 rounded-xl ${depth > 0 ? "border-l-2 border-gray-100 pl-4 py-2" : ""}`}>
        {Object.keys(value).map((key) => (
          <div key={key} className="space-y-2">
            <Label className="text-[11px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1.5">
              <Type size={12} /> {key.replace(/([A-Z])/g, ' $1')}
            </Label>
            <DataRenderer
              value={value[key]}
              path={path ? `${path}.${key}` : key}
              onChange={onChange}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
              depth={depth + 1}
            />
          </div>
        ))}
      </div>
    );
  }

  // 📦 ARRAYS (Lists)
  if (Array.isArray(value)) {
    const addItem = () => {
      const template = value.length > 0 
        ? (typeof value[0] === "object" ? structuredClone(value[0]) : "")
        : "";
      onChange(path, [...value, template]);
    };

    const removeItem = (index) => {
      const newList = value.filter((_, i) => i !== index);
      onChange(path, newList);
    };

    return (
      <div className="space-y-4 mt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
            <Layers size={14} /> LIST ITEMS ({value.length})
          </span>
          {canCreate && (
            <Button variant="ghost" size="sm" onClick={addItem} className="h-7 text-xs hover:bg-black hover:text-white border border-dashed">
              <Plus size={14} className="mr-1" /> Add Item
            </Button>
          )}
        </div>
        
        <div className="grid gap-4">
          {value.map((item, i) => (
            <div key={i} className="group relative border rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              {canDelete && (
                <button
                  onClick={() => removeItem(i)}
                  className="absolute -top-2 -right-2 bg-white border text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white z-10 shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <div className="absolute -left-3 top-4 bg-gray-100 text-[10px] font-bold px-1.5 py-0.5 rounded border text-gray-500">
                #{i + 1}
              </div>
              <DataRenderer
                value={item}
                path={path ? `${path}.${i}` : `${i}`}
                onChange={onChange}
                canCreate={canCreate}
                canUpdate={canUpdate}
                canDelete={canDelete}
                depth={depth + 1}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div className="text-xs text-gray-400 italic">Unsupported data type</div>;
}