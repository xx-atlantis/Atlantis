"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";

/* --------------------------------------------------------------------
   STATIC LABELS (admin-only)
-------------------------------------------------------------------- */
const t = {
  section: "Pricing Plans",
  smallTitle: "Small Title",
  mainTitleNormal: "Main Title (Normal)",
  mainTitleHighlight: "Main Title (Highlight)",
  cta: "CTA Button Title",

  plan: "Plan",
  addPlan: "Add New Plan",
  deletePlan: "Delete Plan",

  title: "Plan Title",
  price: "Price",
  oldPrice: "Old Price",
  recommended: "Recommended?",

  features: "Features",
  addFeature: "Add Feature",
  deleteFeature: "Delete Feature",

  featureText: "Feature Text",
  included: "Included?",
  save: "Save Content",
};

/* --------------------------------------------------------------------
   MULTI-LANG TEMPLATES
-------------------------------------------------------------------- */
const newFeature = () => ({
  text: { en: "", ar: "" },
  included: false,
});

const newPlan = () => ({
  title: { en: "", ar: "" },
  price: "",
  oldPrice: "",
  recommended: false,
  features: [newFeature()],
});

const defaultPlans = {
  smallTitle: { en: "", ar: "" },
  mainTitle: {
    normal: { en: "", ar: "" },
    highlight: { en: "", ar: "" },
  },
  cta: { en: "", ar: "" },
  list: [],
};

/* --------------------------------------------------------------------
   Section Card
-------------------------------------------------------------------- */
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

/* --------------------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------------------- */
export default function PricingPlansCmsAdmin() {
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem("cms_pricing");
    return stored ? JSON.parse(stored) : structuredClone(defaultPlans);
  });

  const [lang, setLang] = useState("en"); // 🔥 LANGUAGE SWITCH

  const patch = (path, value) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const keys = path.split(".");
      let ref = cp;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys.at(-1)] = value;
      return cp;
    });
  };

  const addPlan = () => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp.list.push(newPlan());
      return cp;
    });
  };

  const deletePlan = (index) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp.list.splice(index, 1);
      return cp;
    });
  };

  const addFeature = (p) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp.list[p].features.push(newFeature());
      return cp;
    });
  };

  const deleteFeature = (p, f) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp.list[p].features.splice(f, 1);
      return cp;
    });
  };

  const save = () => {
    localStorage.setItem("cms_pricing", JSON.stringify(data));
    alert("Saved Pricing Content");
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-6">{t.section} CMS</h1>

      <SectionCard
        title={t.section}
        right={
          <Button onClick={save} className="flex items-center gap-2">
            <Save size={14} /> {t.save}
          </Button>
        }
      >
        {/* 🔥 LANGUAGE SWITCH */}
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
        <label className="font-medium">{t.smallTitle} ({lang.toUpperCase()})</label>
        <Input
          className="mt-1 mb-4"
          value={data.smallTitle[lang]}
          onChange={(e) => patch(`smallTitle.${lang}`, e.target.value)}
        />

        {/* MAIN TITLES */}
        <label className="font-medium">{t.mainTitleNormal} ({lang.toUpperCase()})</label>
        <Input
          className="mt-1 mb-4"
          value={data.mainTitle.normal[lang]}
          onChange={(e) => patch(`mainTitle.normal.${lang}`, e.target.value)}
        />

        <label className="font-medium">{t.mainTitleHighlight} ({lang.toUpperCase()})</label>
        <Input
          className="mt-1 mb-6"
          value={data.mainTitle.highlight[lang]}
          onChange={(e) => patch(`mainTitle.highlight.${lang}`, e.target.value)}
        />

        {/* CTA */}
        <label className="font-medium">{t.cta} ({lang.toUpperCase()})</label>
        <Input
          className="mt-1 mb-8"
          value={data.cta[lang]}
          onChange={(e) => patch(`cta.${lang}`, e.target.value)}
        />

        {/* ADD PLAN */}
        <Button onClick={addPlan} className="flex items-center gap-2 mb-6">
          <Plus size={16} /> {t.addPlan}
        </Button>

        {/* PLANS */}
        {data.list.map((plan, p) => (
          <div
            key={p}
            className="border rounded-lg p-5 mb-8 bg-gray-50 shadow-sm"
          >
            {/* HEADER */}
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">
                {t.plan} {p + 1} ({lang.toUpperCase()})
              </h3>

              <button
                onClick={() => deletePlan(p)}
                className="text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 size={16} /> {t.deletePlan}
              </button>
            </div>

            {/* TITLE */}
            <label className="font-medium">{t.title}</label>
            <Input
              className="mt-1 mb-4"
              value={plan.title[lang]}
              onChange={(e) =>
                patch(`list.${p}.title.${lang}`, e.target.value)
              }
            />

            {/* PRICES */}
            <label className="font-medium">{t.price}</label>
            <Input
              className="mt-1 mb-4"
              value={plan.price}
              onChange={(e) => patch(`list.${p}.price`, e.target.value)}
            />

            <label className="font-medium">{t.oldPrice}</label>
            <Input
              className="mt-1 mb-4"
              value={plan.oldPrice}
              onChange={(e) => patch(`list.${p}.oldPrice`, e.target.value)}
            />

            {/* Recommended */}
            <div
              className="flex items-center gap-2 mb-6 cursor-pointer"
              onClick={() =>
                patch(`list.${p}.recommended`, !plan.recommended)
              }
            >
              {plan.recommended ? (
                <CheckSquare size={20} className="text-green-600" />
              ) : (
                <Square size={20} className="text-gray-400" />
              )}
              <span className="font-medium">{t.recommended}</span>
            </div>

            {/* FEATURES */}
            <h4 className="font-semibold mb-3">{t.features}</h4>

            {plan.features.map((f, fIndex) => (
              <div
                key={fIndex}
                className="mb-4 p-3 rounded-lg bg-white border shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {t.featureText} {fIndex + 1} ({lang.toUpperCase()})
                  </span>
                  <button
                    onClick={() => deleteFeature(p, fIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* FEATURE TEXT */}
                <Input
                  className="mb-3"
                  value={f.text[lang]}
                  onChange={(e) =>
                    patch(
                      `list.${p}.features.${fIndex}.text.${lang}`,
                      e.target.value
                    )
                  }
                  placeholder="Feature description"
                />

                {/* INCLUDED */}
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() =>
                    patch(
                      `list.${p}.features.${fIndex}.included`,
                      !f.included
                    )
                  }
                >
                  {f.included ? (
                    <CheckSquare size={18} className="text-green-600" />
                  ) : (
                    <Square size={18} className="text-gray-400" />
                  )}
                  <span>{t.included}</span>
                </div>
              </div>
            ))}

            <Button
              onClick={() => addFeature(p)}
              className="flex items-center gap-2 mt-3"
            >
              <Plus size={14} /> {t.addFeature}
            </Button>
          </div>
        ))}
      </SectionCard>
    </main>
  );
}
