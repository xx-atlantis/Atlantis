"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import FieldRenderer from "./FieldRenderer";
import SectionCard from "./SectionCard";

export default function SectionWithTabs({ sectionKey, sectionData, onSave , 
  canCreate = true, 
  canUpdate = true, 
  canDelete = true}) {
  const [tab, setTab] = useState("en");
  const [localData, setLocalData] = useState(sectionData);

  // patch helper
  const patch = (locale, path, value) => {
    const clone = structuredClone(localData);
    let ref = clone[locale];
    const keys = path.split(".");

    for (let i = 0; i < keys.length - 1; i++) {
      ref = ref[keys[i]];
    }
    ref[keys.at(-1)] = value;

    setLocalData(clone);
  };

  return (
    <SectionCard
      title={`${sectionKey.toUpperCase()}`}
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
      {/* CONTENT */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <FieldRenderer
          value={localData[tab]}
          path=""
          onChange={(path, value) => patch(tab, path, value)}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </div>

      {/* SAVE BUTTON */}
      {canUpdate && (
      <div className="mt-4">
        <Button onClick={() => onSave(tab, localData[tab])}>
          Save {tab.toUpperCase()}
        </Button>
      </div>
      )}
    </SectionCard>
  );
}
