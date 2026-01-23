"use client";

import { useLocale } from "@/app/components/LocaleProvider";
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

/* ============================================================
   UI LABELS
============================================================ */
const UI = {
  en: {
    section: "Pricing Plans",
    smallTitle: "Small Title",
    mainTitleNormal: "Main Title (Normal)",
    mainTitleHighlight: "Main Title (Highlight)",

    cta: "See Pricing",
    plan: "Plan",
    addPlan: "Add New Plan",
    deletePlan: "Delete Plan",

    title: "Title",
    price: "Price",
    oldPrice: "Old Price",
    recommended: "Recommended?",

    features: "Features",
    addFeature: "Add Feature",
    deleteFeature: "Delete Feature",

    featureText: "Feature Text",
    included: "Included?",
    save: "Save Content",
  },

  ar: {
    section: "خطط الأسعار",
    smallTitle: "العنوان الصغير",
    mainTitleNormal: "العنوان الرئيسي (عادي)",
    mainTitleHighlight: "العنوان الرئيسي (مميز)",
    cta: "عرض الأسعار",

    plan: "الخطة",
    addPlan: "إضافة خطة جديدة",
    deletePlan: "حذف الخطة",

    title: "العنوان",
    price: "السعر",
    oldPrice: "السعر القديم",
    recommended: "موصى بها؟",

    features: "المميزات",
    addFeature: "إضافة ميزة",
    deleteFeature: "حذف الميزة",

    featureText: "نص الميزة",
    included: "مدرجة؟",
    save: "حفظ المحتوى",
  },
};

/* ============================================================
   DEFAULT STRUCTURE
============================================================ */
const newFeature = () => ({
  text: "",
  included: false,
});

const newPlan = () => ({
  title: "",
  price: "",
  oldPrice: "",
  recommended: false,
  features: [ newFeature() ],
});

const defaultPlans = {
  smallTitle: "",
  mainTitle: { normal: "", highlight: "" },
  cta: "",
  list: [],
};

/* ============================================================
   REUSABLE ACCORDION
============================================================ */
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

/* ============================================================
   MAIN CMS
============================================================ */
export default function PricingPlansCmsAdmin() {
  const { locale } = useLocale();
  const t = UI[locale];

  const [data, setData] = useState({
    en: structuredClone(defaultPlans),
    ar: structuredClone(defaultPlans),
  });

  const current = data[locale];

  /* ---------------------------- PATCH ---------------------------- */
  const patch = (path, value) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const keys = path.split(".");
      let ref = cp[locale];
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys.at(-1)] = value;
      return cp;
    });
  };

  /* ---------------------- ADD / REMOVE PLAN ---------------------- */
  const addPlan = () => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp[locale].list.push(newPlan());
      return cp;
    });
  };

  const deletePlan = (index) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp[locale].list.splice(index, 1);
      return cp;
    });
  };

  /* ---------------------- ADD / REMOVE FEATURE ---------------------- */
  const addFeature = (planIndex) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp[locale].list[planIndex].features.push(newFeature());
      return cp;
    });
  };

  const deleteFeature = (planIndex, featureIndex) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp[locale].list[planIndex].features.splice(featureIndex, 1);
      return cp;
    });
  };

  /* ---------------------------- SAVE ---------------------------- */
  const save = () => {
    localStorage.setItem(
      `cms_plans_${locale}`,
      JSON.stringify(current)
    );
    alert(`Saved Pricing Plans (${locale})`);
  };

  /* ============================================================
     RENDER
  ============================================================= */
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
        {/* SMALL TITLE */}
        <div className="mb-4">
          <label className="font-medium">{t.smallTitle}</label>
          <Input
            className="mt-1"
            value={current.smallTitle}
            onChange={(e) => patch("smallTitle", e.target.value)}
          />
        </div>

        {/* MAIN TITLE */}
        <div className="mb-4">
          <label className="font-medium">{t.mainTitleNormal}</label>
          <Input
            className="mt-1"
            value={current.mainTitle.normal}
            onChange={(e) => patch("mainTitle.normal", e.target.value)}
          />
        </div>

        <div className="mb-8">
          <label className="font-medium">{t.mainTitleHighlight}</label>
          <Input
            className="mt-1"
            value={current.mainTitle.highlight}
            onChange={(e) => patch("mainTitle.highlight", e.target.value)}
          />
        </div>

        <div className="mb-8">
          <label className="font-medium">Cta Button Tittle</label>
          <Input
            className="mt-1"
            value={current.cta}
            onChange={(e) => patch("cta", e.target.value)}
          />
        </div>


        {/* ADD PLAN BUTTON */}
        <Button onClick={addPlan} className="flex items-center gap-2 mb-6">
          <Plus size={16} /> {t.addPlan}
        </Button>

        {/* PLAN LIST */}
        {current.list.map((plan, pIndex) => (
          <div
            key={pIndex}
            className="border rounded-lg p-5 mb-8 bg-gray-50 shadow-sm"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                {t.plan} {pIndex + 1}
              </h3>
              <button
                onClick={() => deletePlan(pIndex)}
                className="text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 size={16} /> {t.deletePlan}
              </button>
            </div>

            {/* TITLE */}
            <label className="font-medium">{t.title}</label>
            <Input
              className="mt-1 mb-4"
              value={plan.title}
              onChange={(e) =>
                patch(`list.${pIndex}.title`, e.target.value)
              }
            />

            {/* PRICE */}
            <label className="font-medium">{t.price}</label>
            <Input
              className="mt-1 mb-4"
              value={plan.price}
              onChange={(e) =>
                patch(`list.${pIndex}.price`, e.target.value)
              }
            />

            {/* OLD PRICE */}
            <label className="font-medium">{t.oldPrice}</label>
            <Input
              className="mt-1 mb-4"
              value={plan.oldPrice}
              onChange={(e) =>
                patch(`list.${pIndex}.oldPrice`, e.target.value)
              }
            />

            {/* RECOMMENDED */}
            <div
              className="flex items-center gap-2 mb-6 cursor-pointer select-none"
              onClick={() =>
                patch(`list.${pIndex}.recommended`, !plan.recommended)
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

            {plan.features.map((feature, fIndex) => (
              <div
                key={fIndex}
                className="mb-4 p-3 rounded-lg bg-white border shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {t.featureText} {fIndex + 1}
                  </span>
                  <button
                    onClick={() => deleteFeature(pIndex, fIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <Input
                  className="mb-3"
                  value={feature.text}
                  onChange={(e) =>
                    patch(`list.${pIndex}.features.${fIndex}.text`, e.target.value)
                  }
                  placeholder="Feature description"
                />

                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() =>
                    patch(
                      `list.${pIndex}.features.${fIndex}.included`,
                      !feature.included
                    )
                  }
                >
                  {feature.included ? (
                    <CheckSquare size={18} className="text-green-600" />
                  ) : (
                    <Square size={18} className="text-gray-400" />
                  )}
                  <span>{t.included}</span>
                </div>
              </div>
            ))}

            {/* ADD FEATURE BUTTON */}
            <Button
              onClick={() => addFeature(pIndex)}
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
