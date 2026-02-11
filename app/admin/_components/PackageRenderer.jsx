"use client";

import { useState, useEffect } from "react";
import PackageCard from "./PackageCard";
import { Save } from "lucide-react";

export default function PackageRenderer({ content, locale, onSave, readOnly }) {
  const [draft, setDraft] = useState(content);

  // Update local draft if props change (e.g., after a successful save)
  useEffect(() => {
    setDraft(content);
  }, [content]);

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

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
      className="p-8"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex justify-between items-center mb-10">
        <div className="flex-1 max-w-md">
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Section Heading</label>
          <input
            value={draft.heading}
            onChange={(e) => setDraft({ ...draft, heading: e.target.value })}
            className="w-full text-2xl font-bold border-b-2 focus:border-black outline-none pb-1"
          />
        </div>

        {!readOnly && (
          <button
            type="submit"
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-gray-300"
          >
            <Save size={18} />
            {locale === "ar" ? "حفظ التغييرات" : "Save Changes"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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