"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, ChevronDown, ChevronRight } from "lucide-react";

/* -------------------------------------------
   STATIC UI LABELS FOR ADMIN
-------------------------------------------- */
const t = {
  section: "How It Works",
  smallTitle: "Small Title",
  mainTitle: "Main Title",
  step: "Step",
  title: "Title",
  desc: "Description",
  save: "Save Content",
};

/* -------------------------------------------
   DEFAULT DATA STRUCTURE (MULTI-LANG READY)
-------------------------------------------- */
const defaultHow = {
  smallTitle: { en: "", ar: "" },
  mainTitle: { en: "", ar: "" },
  steps: [
    { en: { title: "", desc: "" }, ar: { title: "", desc: "" } },
    { en: { title: "", desc: "" }, ar: { title: "", desc: "" } },
    { en: { title: "", desc: "" }, ar: { title: "", desc: "" } },
  ],
};

/* -------------------------------------------
   REUSABLE CARD COMPONENT
-------------------------------------------- */
const SectionCard = ({ title, right, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-xl bg-white shadow-sm mb-6">
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
   MAIN ADMIN COMPONENT
-------------------------------------------- */
export default function HowItWorksCmsAdmin() {
  const [data, setData] = useState(structuredClone(defaultHow));
  const [lang, setLang] = useState("en"); // 🔥 Language switch

  /* PATCH function for nested paths */
  const patch = (path, value) => {
    setData((prev) => {
      const copy = structuredClone(prev);
      const keys = path.split(".");
      let ref = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
      }
      ref[keys.at(-1)] = value;
      return copy;
    });
  };

  /* SAVE to localStorage */
  const save = () => {
    localStorage.setItem("cms_howitworks", JSON.stringify(data));
    alert("Saved How It Works");
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-6">How It Works CMS</h1>

      <SectionCard
        title={t.section}
        right={
          <Button onClick={save} className="flex items-center gap-2">
            <Save size={14} /> {t.save}
          </Button>
        }
      >
        {/* 🔥 LANGUAGE SWITCHER */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={lang === "en" ? "default" : "outline"}
            onClick={() => setLang("en")}
          >
            English
          </Button>
          <Button
            variant={lang === "ar" ? "default" : "outline"}
            onClick={() => setLang("ar")}
          >
            Arabic
          </Button>
        </div>

        {/* SMALL TITLE */}
        <div className="mb-4">
          <label className="font-medium">
            {t.smallTitle} ({lang.toUpperCase()})
          </label>
          <Input
            className="mt-1"
            value={data.smallTitle[lang]}
            onChange={(e) => patch(`smallTitle.${lang}`, e.target.value)}
          />
        </div>

        {/* MAIN TITLE */}
        <div className="mb-6">
          <label className="font-medium">
            {t.mainTitle} ({lang.toUpperCase()})
          </label>
          <Textarea
            rows={2}
            className="mt-1"
            value={data.mainTitle[lang]}
            onChange={(e) => patch(`mainTitle.${lang}`, e.target.value)}
          />
        </div>

        {/* STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.steps.map((step, i) => (
            <div key={i} className="border rounded-lg p-4 shadow-sm bg-gray-50">
              <h3 className="font-semibold mb-3">
                {t.step} {i + 1} ({lang.toUpperCase()})
              </h3>

              {/* Step Title */}
              <div className="mb-3">
                <label className="font-medium text-sm">{t.title}</label>
                <Input
                  className="mt-1"
                  value={step[lang].title}
                  onChange={(e) =>
                    patch(`steps.${i}.${lang}.title`, e.target.value)
                  }
                />
              </div>

              {/* Step Description */}
              <div>
                <label className="font-medium text-sm">{t.desc}</label>
                <Textarea
                  rows={4}
                  className="mt-1"
                  value={step[lang].desc}
                  onChange={(e) =>
                    patch(`steps.${i}.${lang}.desc`, e.target.value)
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
