"use client";

import { Check, X, Star, Tag } from "lucide-react";

export default function PackageCard({ item, perRoom, isRecommended, onChange, onSetRecommended, locale, readOnly }) {
  const isAr = locale === "ar";

  const handleInputChange = (field, value) => {
    onChange({ ...item, [field]: value });
  };

  const handleFeatureChange = (index, text) => {
    const newFeatures = [...item.features];
    newFeatures[index].text = text;
    handleInputChange("features", newFeatures);
  };

  const toggleFeature = (index) => {
    const newFeatures = [...item.features];
    newFeatures[index].included = !newFeatures[index].included;
    handleInputChange("features", newFeatures);
  };

  return (
    <div className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all bg-white ${
      isRecommended ? "border-gray-800 shadow-lg" : "border-slate-200"
    }`}>
      {/* Recommended Toggle Button */}
      {!readOnly && (
        <button
          type="button"
          onClick={onSetRecommended}
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 border transition-colors ${
            isRecommended ? "bg-gray-800 text-white border-gray-800" : "bg-white text-slate-400 border-slate-200 hover:border-gray-400"
          }`}
        >
          <Star size={12} fill={isRecommended ? "currentColor" : "none"} />
          {isAr ? (isRecommended ? "موصى بها" : "تحديد كموصى بها") : (isRecommended ? "Recommended" : "Set Recommended")}
        </button>
      )}

      <div className="mt-4 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Type</label>
            <div className="relative">
              <Tag size={12} className="absolute left-2 top-3 text-slate-400" />
              <input
                value={item.type || ""}
                onChange={(e) => handleInputChange("type", e.target.value)}
                disabled={readOnly}
                placeholder="e.g. Basic"
                className="w-full pl-7 p-2 text-sm border rounded-lg focus:ring-2 focus:ring-black outline-none bg-slate-50"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Title</label>
            <input
              value={item.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={readOnly}
              className="w-full p-2 text-sm font-semibold border rounded-lg focus:ring-2 focus:ring-black outline-none"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Price</label>
            <input
              value={item.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              disabled={readOnly}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
            />
          </div>
          <div className="w-24">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Unit</label>
            <div className="p-2 text-slate-400 text-xs border border-transparent italic">{perRoom}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <label className="text-[10px] uppercase font-bold text-slate-400 block">Features</label>
        {item.features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => !readOnly && toggleFeature(idx)}
              disabled={readOnly}
              className={`shrink-0 w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                feature.included ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-300"
              }`}
            >
              {feature.included ? <Check size={14} /> : <X size={14} />}
            </button>
            <input
              value={feature.text}
              onChange={(e) => handleFeatureChange(idx, e.target.value)}
              disabled={readOnly}
              className="flex-1 p-1.5 text-sm border-b focus:border-black outline-none bg-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  );
}