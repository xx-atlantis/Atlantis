"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Type, Image as ImageIcon } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { cn } from "@/lib/utils";

const lastKey = (path = "") => path.split(".").filter(Boolean).pop() || "";

export default function FieldRenderer({
  value,
  path,
  onChange,
  canCreate,
  canUpdate,
  canDelete,
  isStylesSection = false,
}) {
  const currentKey = lastKey(path);
  const isStylesList = isStylesSection && currentKey === "list";

  // 1. IMAGE HANDLER (Strict check)
  // We check if the key is "image" OR if the value looks like a path
  const isImageField = currentKey === "image" || (typeof value === "string" && (value.startsWith("/") || value.startsWith("http")));
  
  if (isImageField && typeof value === "string") {
    return (
      <div className="mt-1 group/img relative rounded-xl border border-slate-100 bg-slate-50/30 p-1 transition-all hover:border-blue-200">
        <ImageUploader
          value={value}
          path={path}
          onChange={(url) => onChange(path, url)}
          disabled={!canUpdate}
        />
      </div>
    );
  }

  // 2. TEXT FIELDS (Title)
  if (typeof value === "string") {
    return (
      <div className="relative group/input mt-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within/input:text-blue-500">
          <Type size={14} />
        </div>
        <Input
          disabled={!canUpdate}
          value={value}
          placeholder={`Enter ${currentKey}...`}
          className="h-10 pl-9 bg-white border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 rounded-lg text-sm transition-all"
          onChange={(e) => onChange(path, e.target.value)}
        />
      </div>
    );
  }

  // 3. OBJECTS (The Container for Title & Image)
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-3">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="flex flex-col">
            <span className="text-[9px] font-black tracking-[0.15em] text-slate-400 uppercase mb-1 ml-1">
              {key}
            </span>
            <FieldRenderer
              value={val}
              path={path ? `${path}.${key}` : key}
              onChange={onChange}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
              isStylesSection={isStylesSection}
            />
          </div>
        ))}
      </div>
    );
  }

  // 4. ARRAYS (The Styles Grid)
  if (Array.isArray(value)) {
    const addItem = () => {
      // ✅ FORCED CLEAN TEMPLATE
      const template = isStylesList 
        ? { title: "", image: "" } 
        : (value.length > 0 && typeof value[0] === 'object' ? Object.keys(value[0]).reduce((acc, k) => ({...acc, [k]: ""}), {}) : "");
      
      onChange(path, [...value, template]);
    };

    const removeItem = (idx) => {
      const next = value.filter((_, i) => i !== idx);
      onChange(path, next);
    };

    return (
      <div className="w-full">
        <div className={cn("grid gap-6", isStylesList ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
          {value.map((item, i) => (
            <div
              key={i}
              className={cn(
                "group relative bg-white border border-slate-200/60 rounded-2xl p-5 transition-all duration-500",
                isStylesList ? "hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1" : ""
              )}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Style Card
                  </span>
                </div>
                {canDelete && isStylesList && (
                  <button
                    onClick={() => removeItem(i)}
                    className="h-7 w-7 flex items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Renders Title & Image fields based on the template */}
              <FieldRenderer
                value={item}
                path={`${path}.${i}`}
                onChange={onChange}
                canCreate={canCreate}
                canUpdate={canUpdate}
                canDelete={canDelete}
                isStylesSection={isStylesSection}
              />
            </div>
          ))}

          {/* Minimalist Add Button */}
          {isStylesList && canCreate && (
            <button
              onClick={addItem}
              className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-100 bg-white transition-all hover:border-blue-200 hover:bg-blue-50/20 group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                <Plus size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-600">
                Add Style
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}