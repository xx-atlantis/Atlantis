"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, ChevronDown, ChevronRight } from "lucide-react";

/* -------------------------------------------
   UI LABELS
-------------------------------------------- */
const UI = {
  en: {
    section: "Why Best Choice",
    title: "Main Title",
    cta: "CTA Button Text",
    featureBox: "Feature",
    fTitle: "Feature Title",
    fDesc: "Feature Description",
    save: "Save Content",
  },
  ar: {
    section: "لماذا نحن الخيار الأفضل",
    title: "العنوان الرئيسي",
    cta: "نص زر الدعوة",
    featureBox: "الميزة",
    fTitle: "عنوان الميزة",
    fDesc: "وصف الميزة",
    save: "حفظ المحتوى",
  },
};

/* -------------------------------------------
   DEFAULT STRUCTURE
-------------------------------------------- */
const defaultWhy = {
  title: "",
  cta: "",
  features: [
    { title: "", desc: "" },
    { title: "", desc: "" },
    { title: "", desc: "" },
  ],
};

/* -------------------------------------------
   REUSABLE ACCORDION CARD
-------------------------------------------- */
const SectionCard = ({ title, right, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-xl bg-white shadow-sm">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 font-semibold"
        >
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {title}
        </button>
        {right}
      </div>

      {open && <div className="p-5">{children}</div>}
    </div>
  );
};

/* -------------------------------------------
   MAIN CMS COMPONENT
-------------------------------------------- */
export default function WhyBestChoiceCmsAdmin() {
  const { locale } = useLocale();
  const t = UI[locale];

  const [data, setData] = useState({
    en: structuredClone(defaultWhy),
    ar: structuredClone(defaultWhy),
  });

  const current = data[locale];

  /* -------------------------------------------
     PATCH FUNCTION
-------------------------------------------- */
  const patch = (path, value) => {
    setData((prev) => {
      const copy = structuredClone(prev);
      const keys = path.split(".");
      let ref = copy[locale];
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys.at(-1)] = value;
      return copy;
    });
  };

  /* -------------------------------------------
     SAVE FUNCTION
-------------------------------------------- */
  const save = () => {
    localStorage.setItem(`cms_whybest_${locale}`, JSON.stringify(current));
    alert(`Saved WhyBest (${locale})`);
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-6">
        {t.section} CMS ({locale.toUpperCase()})
      </h1>

      <SectionCard
        title={t.section}
        right={
          <Button onClick={save} className="flex items-center gap-2">
            <Save size={14} /> {t.save}
          </Button>
        }
      >
        {/* ===== MAIN TITLE ===== */}
        <div className="mb-5">
          <label className="font-medium">{t.title}</label>
          <Textarea
            rows={2}
            className="mt-1"
            value={current.title}
            onChange={(e) => patch("title", e.target.value)}
          />
        </div>

        {/* ===== CTA TEXT ===== */}
        <div className="mb-8">
          <label className="font-medium">{t.cta}</label>
          <Input
            className="mt-1"
            value={current.cta}
            onChange={(e) => patch("cta", e.target.value)}
          />
        </div>

        {/* ===== FEATURES (3 FIXED) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="border p-4 rounded-lg bg-gray-50 shadow-sm"
            >
              <h3 className="font-semibold mb-3">
                {t.featureBox} {i + 1}
              </h3>

              {/* Feature Title */}
              <div className="mb-3">
                <label className="text-sm font-medium">{t.fTitle}</label>
                <Input
                  className="mt-1"
                  value={current.features[i].title}
                  onChange={(e) =>
                    patch(`features.${i}.title`, e.target.value)
                  }
                />
              </div>

              {/* Feature Description */}
              <div>
                <label className="text-sm font-medium">{t.fDesc}</label>
                <Textarea
                  rows={4}
                  className="mt-1"
                  value={current.features[i].desc}
                  onChange={(e) =>
                    patch(`features.${i}.desc`, e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
