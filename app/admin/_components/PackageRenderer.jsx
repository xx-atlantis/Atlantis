"use client";

import { useState, useEffect } from "react";
import PackageCard from "./PackageCard";
import { Save, ShieldCheck } from "lucide-react";

export default function PackageRenderer({ content, locale, onSave, readOnly }) {
  // Extract only the localized package data from the full content object
  const [draft, setDraft] = useState(content?.packages?.[locale]);

  useEffect(() => {
    setDraft(content?.packages?.[locale]);
  }, [content, locale]);

  if (!draft) return null;

  const handleUpdateList = (index, updatedPkg) => {
    const newList = [...draft.list];
    newList[index] = updatedPkg;
    setDraft({ ...draft, list: newList });
  };

  const handleSetRecommended = (index) => {
    const newList = draft.list.map((pkg, i) => ({
      ...pkg,
      recommended: i === index
    }));
    setDraft({ ...draft, list: newList });
  };

  const isAr = locale === "ar";

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
      className="p-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10">
        <div className="space-y-6 flex-1 w-full max-w-2xl">
          {/* Main Title Editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Main Title (Normal)</label>
              <input
                value={draft.mainTitle?.normal || ""}
                onChange={(e) => setDraft({ ...draft, mainTitle: { ...draft.mainTitle, normal: e.target.value } })}
                disabled={readOnly}
                className="w-full text-lg border-b-2 border-slate-100 focus:border-black outline-none pb-1 bg-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Main Title (Highlight)</label>
              <input
                value={draft.mainTitle?.highlight || ""}
                onChange={(e) => setDraft({ ...draft, mainTitle: { ...draft.mainTitle, highlight: e.target.value } })}
                disabled={readOnly}
                className="w-full text-lg font-bold text-blue-600 border-b-2 border-slate-100 focus:border-blue-600 outline-none pb-1 bg-transparent"
              />
            </div>
          </div>

          {/* Refund Guarantee Editor */}
          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 flex gap-4">
            <ShieldCheck className="text-amber-600 shrink-0 mt-1" size={24} />
            <div className="flex-1 space-y-3">
              <input
                value={draft.refundHeading || ""}
                onChange={(e) => setDraft({ ...draft, refundHeading: e.target.value })}
                disabled={readOnly}
                className="w-full bg-transparent font-bold text-amber-900 outline-none border-b border-amber-200/50 focus:border-amber-500"
                placeholder="Guarantee Heading"
              />
              <textarea
                value={draft.refundText || ""}
                onChange={(e) => setDraft({ ...draft, refundText: e.target.value })}
                disabled={readOnly}
                className="w-full bg-transparent text-sm text-amber-800 outline-none resize-none"
                rows={2}
                placeholder="Guarantee Description"
              />
            </div>
          </div>
        </div>

        {!readOnly && (
          <button
            type="submit"
            className="shrink-0 flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200"
          >
            <Save size={20} />
            {isAr ? "حفظ التغييرات" : "Save Changes"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {draft.list?.map((pkg, index) => (
          <PackageCard 
            key={index} 
            item={pkg} 
            perRoom={draft.perRoom}
            isRecommended={pkg.recommended}
            onChange={(updatedPkg) => handleUpdateList(index, updatedPkg)}
            onSetRecommended={() => handleSetRecommended(index)}
            readOnly={readOnly}
            locale={locale}
          />
        ))}
      </div>
    </form>
  );
}