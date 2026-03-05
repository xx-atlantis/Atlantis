"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FieldRenderer from "./FieldRenderer";
import SectionCard from "./SectionCard";

/* ---------------------------
  Deep patch (supports arrays)
---------------------------- */
const splitPath = (path = "") => String(path).split(".").filter(Boolean);
const isIndex = (k) => String(Number(k)) === k;

function deepSetSection(prevSection, locale, path, value) {
  const clone = structuredClone(prevSection);

  // If updating the whole locale object itself
  if (!path) {
    clone[locale] = value;
    return clone;
  }

  const keys = splitPath(path);
  let ref = clone[locale];

  // If somehow locale is missing
  if (ref == null) {
    ref = {};
    clone[locale] = ref;
  }

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const nextKey = keys[i + 1];
    const nextShouldBeArray = isIndex(nextKey);

    // read current
    let next = Array.isArray(ref) && isIndex(k) ? ref[Number(k)] : ref[k];

    // create missing
    if (next == null) next = nextShouldBeArray ? [] : {};

    // clone next container
    const nextCloned = Array.isArray(next) ? next.slice() : { ...next };

    // write back cloned container
    if (Array.isArray(ref) && isIndex(k)) ref[Number(k)] = nextCloned;
    else ref[k] = nextCloned;

    ref = nextCloned;
  }

  const last = keys[keys.length - 1];
  if (Array.isArray(ref) && isIndex(last)) ref[Number(last)] = value;
  else ref[last] = value;

  return clone;
}

export default function SectionWithTabs({
  sectionKey,
  sectionData,
  onSave,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) {
  const [tab, setTab] = useState("en");
  const [localData, setLocalData] = useState(sectionData);

  // Sync if parent data changes
  useEffect(() => {
    console.log("[SectionWithTabs] sectionData changed", {
      sectionKey,
      keys: sectionData ? Object.keys(sectionData) : null,
    });
    setLocalData(sectionData);
  }, [sectionData, sectionKey]);

  const patch = (locale, path, value) => {
    console.log("[SectionWithTabs] patch()", { sectionKey, locale, path, value });

    setLocalData((prev) => {
      const before =
        path && prev?.[locale] ? splitPath(path).reduce((acc, k) => {
          if (acc == null) return undefined;
          return Array.isArray(acc) && isIndex(k) ? acc[Number(k)] : acc[k];
        }, prev[locale]) : prev?.[locale];

      const updated = deepSetSection(prev, locale, path, value);

      const after =
        path && updated?.[locale] ? splitPath(path).reduce((acc, k) => {
          if (acc == null) return undefined;
          return Array.isArray(acc) && isIndex(k) ? acc[Number(k)] : acc[k];
        }, updated[locale]) : updated?.[locale];

      console.log("[SectionWithTabs] patch result", {
        sectionKey,
        locale,
        path,
        before,
        after,
        changed: JSON.stringify(before) !== JSON.stringify(after),
      });

      return updated;
    });
  };

  const activeValue = localData?.[tab];

  return (
    <SectionCard
      title={sectionKey.toUpperCase()}
      right={
        <div className="flex gap-3">
          <Button
            type="button"
            variant={tab === "en" ? "default" : "outline"}
            onClick={() => {
              console.log("[SectionWithTabs] switch tab -> en", { sectionKey });
              setTab("en");
            }}
          >
            English
          </Button>
          <Button
            type="button"
            variant={tab === "ar" ? "default" : "outline"}
            onClick={() => {
              console.log("[SectionWithTabs] switch tab -> ar", { sectionKey });
              setTab("ar");
            }}
          >
            Arabic
          </Button>
        </div>
      }
    >
      <div className="border p-4 rounded-lg bg-gray-50">
        {activeValue == null ? (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            Missing locale data for <b>{tab}</b> in section <b>{sectionKey}</b>.
            <div className="mt-1 text-xs text-yellow-700">
              localData keys: {localData ? Object.keys(localData).join(", ") : "null"}
            </div>
          </div>
        ) : (
          <FieldRenderer
            key={`${sectionKey}-${tab}`}
            value={localData[tab]}
            path=""
            onChange={(path, value) => patch(tab, path, value)}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            isStylesSection={sectionKey === "styles"}   // ✅ ADD THIS
          />
        )}
      </div>

      {canUpdate && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400 italic">
            Editing {sectionKey} / {tab.toUpperCase()}
          </p>
          <Button
            type="button"
            onClick={() => {
              console.log("[SectionWithTabs] SAVE clicked", {
                sectionKey,
                tab,
                payloadPreview: localData?.[tab],
              });
              onSave(tab, localData?.[tab]);
            }}
          >
            Save {tab.toUpperCase()} Changes
          </Button>
        </div>
      )}
    </SectionCard>
  );
}