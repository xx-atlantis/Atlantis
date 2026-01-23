"use client";
import SectionCard from "./SectionCard";
import FieldRenderer from "./FieldRenderer";

/* deep update helper */
function updatePath(obj, path, value) {
  const clone = structuredClone(obj);
  let ref = clone;
  const keys = path.split(".");

  for (let i = 0; i < keys.length - 1; i++) {
    ref = ref[keys[i]];
  }
  ref[keys.at(-1)] = value;

  return clone;
}

export default function UniversalSection({
  sectionKey,
  sectionData,
  onChange,
}) {
  return (
    <SectionCard title={sectionKey.toUpperCase()}>
      {["en", "ar"].map((locale) => (
        <div key={locale} className="mb-6">
          <h3 className="text-lg font-bold mb-3">{locale.toUpperCase()}</h3>

          <FieldRenderer
            value={sectionData[locale]}
            path={locale}
            onChange={(path, value) => {
              const updated = {
                ...sectionData,
                [locale]: updatePath(
                  sectionData[locale],
                  path.replace(locale + ".", ""),
                  value
                ),
              };
              onChange(updated);
            }}
          />
        </div>
      ))}
    </SectionCard>
  );
}
