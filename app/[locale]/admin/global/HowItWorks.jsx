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
    section: "How It Works",
    smallTitle: "Small Title",
    mainTitle: "Main Title",
    step: "Step",
    title: "Title",
    desc: "Description",
    save: "Save Content",
  },
  ar: {
    section: "كيف يعمل",
    smallTitle: "العنوان الصغير",
    mainTitle: "العنوان الرئيسي",
    step: "الخطوة",
    title: "العنوان",
    desc: "الوصف",
    save: "حفظ المحتوى",
  },
};

/* -------------------------------------------
   DEFAULT STRUCTURE
-------------------------------------------- */
const defaultHow = {
  smallTitle: "",
  mainTitle: "",
  steps: [
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
   MAIN COMPONENT
-------------------------------------------- */
export default function HowItWorksCmsAdmin() {
  const { locale } = useLocale();
  const t = UI[locale];

  const [data, setData] = useState({
    en: structuredClone(defaultHow),
    ar: structuredClone(defaultHow),
  });

  const current = data[locale];

  /* -------------------------------------------
     PATCH FUNCTION (same architecture)
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
    localStorage.setItem(
      `cms_howitworks_${locale}`,
      JSON.stringify(current)
    );
    alert(`Saved How It Works (${locale})`);
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-6">
        {t.section} CMS ({locale.toUpperCase()})
      </h1>

      {/* ===================== MAIN SECTION ===================== */}
      <SectionCard
        title={t.section}
        right={
          <Button onClick={save} className="flex items-center gap-2">
            <Save size={14} /> {t.save}
          </Button>
        }
      >
        {/* ----- SMALL TITLE ----- */}
        <div className="mb-4">
          <label className="font-medium">{t.smallTitle}</label>
          <Input
            className="mt-1"
            value={current.smallTitle}
            onChange={(e) => patch("smallTitle", e.target.value)}
          />
        </div>

        {/* ----- MAIN TITLE ----- */}
        <div className="mb-6">
          <label className="font-medium">{t.mainTitle}</label>
          <Textarea
            rows={2}
            className="mt-1"
            value={current.mainTitle}
            onChange={(e) => patch("mainTitle", e.target.value)}
          />
        </div>

        {/* ===================== STEPS ===================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="border rounded-lg p-4 shadow-sm bg-gray-50"
            >
              <h3 className="font-semibold mb-3">
                {t.step} {i + 1}
              </h3>

              {/* Step Title */}
              <div className="mb-3">
                <label className="font-medium text-sm">{t.title}</label>
                <Input
                  className="mt-1"
                  value={current.steps[i].title}
                  onChange={(e) =>
                    patch(`steps.${i}.title`, e.target.value)
                  }
                />
              </div>

              {/* Step Description */}
              <div>
                <label className="font-medium text-sm">{t.desc}</label>
                <Textarea
                  rows={4}
                  className="mt-1"
                  value={current.steps[i].desc}
                  onChange={(e) =>
                    patch(`steps.${i}.desc`, e.target.value)
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
