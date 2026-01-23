"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, ChevronDown, ChevronRight } from "lucide-react";

/* -------------------------------------------
   STATIC LABELS FOR ADMIN
-------------------------------------------- */
const t = {
  section: "Why Best Choice",
  title: "Main Title",
  cta: "CTA Button Text",
  featureBox: "Feature",
  fTitle: "Feature Title",
  fDesc: "Feature Description",
  save: "Save Content",
};

/* -------------------------------------------
   DEFAULT MULTI-LANGUAGE STRUCTURE
-------------------------------------------- */
const defaultWhy = {
  title: { en: "", ar: "" },
  cta: { en: "", ar: "" },
  features: [
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
   MAIN COMPONENT
-------------------------------------------- */
export default function WhyBestChoiceAdmin() {
  const [data, setData] = useState(structuredClone(defaultWhy));
  const [lang, setLang] = useState("en"); // 🔥 language switcher

  /* -------------------------------------------
     NESTED PATCH
  -------------------------------------------- */
  const patch = (path, value) => {
    setData((prev) => {
      const copy = structuredClone(prev);
      const keys = path.split(".");
      let ref = copy;

      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
      }

      ref[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  /* -------------------------------------------
     SAVE FUNCTION
  -------------------------------------------- */
  const save = () => {
    localStorage.setItem("cms_whybest", JSON.stringify(data));
    alert("Saved Why Best Choice Section");
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-6">Why Best Choice CMS</h1>

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

        {/* MAIN TITLE */}
        <div className="mb-5">
          <label className="font-medium">
            {t.title} ({lang.toUpperCase()})
          </label>
          <Textarea
            rows={2}
            className="mt-1"
            value={data.title[lang]}
            onChange={(e) => patch(`title.${lang}`, e.target.value)}
          />
        </div>

        {/* CTA BUTTON */}
        <div className="mb-8">
          <label className="font-medium">
            {t.cta} ({lang.toUpperCase()})
          </label>
          <Input
            className="mt-1"
            value={data.cta[lang]}
            onChange={(e) => patch(`cta.${lang}`, e.target.value)}
          />
        </div>

        {/* FEATURES (3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.features.map((f, i) => (
            <div key={i} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
              <h3 className="font-semibold mb-3">
                {t.featureBox} {i + 1} ({lang.toUpperCase()})
              </h3>

              {/* FEATURE TITLE */}
              <div className="mb-3">
                <label className="text-sm font-medium">{t.fTitle}</label>
                <Input
                  className="mt-1"
                  value={data.features[i][lang].title}
                  onChange={(e) =>
                    patch(`features.${i}.${lang}.title`, e.target.value)
                  }
                />
              </div>

              {/* FEATURE DESCRIPTION */}
              <div>
                <label className="text-sm font-medium">{t.fDesc}</label>
                <Textarea
                  rows={4}
                  className="mt-1"
                  value={data.features[i][lang].desc}
                  onChange={(e) =>
                    patch(`features.${i}.${lang}.desc`, e.target.value)
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
