"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SectionCard from "./SectionCard";
import { Globe, Save, Languages } from "lucide-react";
import DataRenderer from "./DataRenderer";

export default function TabSections({ 
  sectionKey, 
  sectionData, 
  onSave, 
  canCreate = true, 
  canUpdate = true, 
  canDelete = true 
}) {
  const [tab, setTab] = useState("en");
  const [localData, setLocalData] = useState(sectionData);

  useEffect(() => {
    setLocalData(sectionData);
  }, [sectionData]);

  const patch = (locale, path, value) => {
    setLocalData((prev) => {
      const clone = structuredClone(prev);
      
      if (!path) {
        clone[locale] = value;
        return clone;
      }

      const keys = path.split(".").filter(Boolean);
      let ref = clone[locale];

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!ref[key]) {
          ref[key] = !isNaN(keys[i + 1]) ? [] : {};
        }
        ref = ref[key];
      }

      ref[keys.at(-1)] = value;
      return clone;
    });
  };

  const handleSave = () => {
    onSave(sectionKey, tab, localData[tab]);
  };

  return (
    <SectionCard
      title={sectionKey.replace(/([A-Z])/g, ' $1').toUpperCase()}
      right={
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border">
          <button
            onClick={() => setTab("en")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              tab === "en" ? "bg-black shadow-sm text-white" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Globe size={14} /> ENGLISH
          </button>
          <button
            onClick={() => setTab("ar")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              tab === "ar" ? "bg-black shadow-sm text-white" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Languages size={14} /> ARABIC
          </button>
        </div>
      }
    >
      <div className="rounded-xl bg-gray-50/50 border-2 border-dashed border-gray-200 p-6">
        <DataRenderer
          key={`${sectionKey}-${tab}`} 
          value={localData[tab]}
          path=""
          onChange={(path, value) => patch(tab, path, value)}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </div>

      {canUpdate && (
        <div className="mt-6 flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Locale</span>
            <span className="text-sm font-semibold flex items-center gap-2">
               {tab === "en" ? "English" : "العربية"}
            </span>
          </div>
          <Button 
            onClick={handleSave}
            className="bg-black text-white hover:bg-gray-800 px-8 py-5 rounded-lg flex gap-2"
          >
            <Save size={18} /> Save {tab.toUpperCase()} Changes
          </Button>
        </div>
      )}
    </SectionCard>
  );
}