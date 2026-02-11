"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FieldRenderer from "./FieldRenderer";
import SectionCard from "./SectionCard";

export default function SectionWithTabs({ 
  sectionKey, 
  sectionData, 
  onSave, 
  canCreate = true, 
  canUpdate = true, 
  canDelete = true 
}) {
  const [tab, setTab] = useState("en");
  // Initialize localData specifically for this section
  const [localData, setLocalData] = useState(sectionData);

  // Sync if parent data actually changes (important for CMS refreshes)
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
        // Ensure path exists; handle both array indices and object keys
        if (!ref[key]) {
          ref[key] = isNaN(keys[i + 1]) ? {} : [];
        }
        ref = ref[key];
      }

      ref[keys.at(-1)] = value;
      return clone;
    });
  };

  return (
    <SectionCard
      title={sectionKey.toUpperCase()}
      right={
        <div className="flex gap-3">
          <Button
            variant={tab === "en" ? "default" : "outline"}
            onClick={() => setTab("en")}
          >
            English
          </Button>
          <Button
            variant={tab === "ar" ? "default" : "outline"}
            onClick={() => setTab("ar")}
          >
            Arabic
          </Button>
        </div>
      }
    >
      <div className="border p-4 rounded-lg bg-gray-50">
        <FieldRenderer
          // ADDED KEY: This forces a re-render of inputs when switching tabs
          // preventing data "bleeding" between English and Arabic views.
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
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400 italic">
            Editing {sectionKey} / {tab.toUpperCase()}
          </p>
          <Button onClick={() => onSave(tab, localData[tab])}>
            Save {tab.toUpperCase()} Changes
          </Button>
        </div>
      )}
    </SectionCard>
  );
}