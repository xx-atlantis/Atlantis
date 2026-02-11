"use client";

import { Check, X, Star } from "lucide-react";

export default function PackageCard({ item, perRoom, isRecommended, onChange, onSetRecommended, locale }) {
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
      <button
        type="button"
        onClick={onSetRecommended}
        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 border ${
          isRecommended ? "bg-gray-800 text-white border-gray-800" : "bg-white text-slate-400 border-slate-200"
        }`}
      >
        <Star size={12} fill={isRecommended ? "currentColor" : "none"} />
        {isAr ? (isRecommended ? "موصى بها" : "تحديد كموصى بها") : (isRecommended ? "Recommended" : "Set Recommended")}
      </button>

      <div className="mt-4 mb-6 space-y-4">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Title</label>
          <input
            value={item.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full p-2 text-lg font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Price</label>
            <input
              value={item.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="w-24">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Unit</label>
            <div className="p-2 text-slate-400 text-sm">{perRoom}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <label className="text-[10px] uppercase font-bold text-slate-400 block">Features</label>
        {item.features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFeature(idx)}
              className={`shrink-0 w-6 h-6 rounded flex items-center justify-center border ${
                feature.included ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-300"
              }`}
            >
              {feature.included ? <Check size={14} /> : <X size={14} />}
            </button>
            <input
              value={feature.text}
              onChange={(e) => handleFeatureChange(idx, e.target.value)}
              className="flex-1 p-1.5 text-sm border-b focus:border-blue-500 outline-none bg-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  );
}