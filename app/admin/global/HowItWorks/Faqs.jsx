"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

/* -------------------------------------------
   STATIC LABELS FOR ADMIN
-------------------------------------------- */
const t = {
  section: "FAQ Section",
  title: "FAQ Title",
  question: "Question",
  answer: "Answer",
  save: "Save Content",
};

/* -------------------------------------------
   DEFAULT MULTI-LANGUAGE STRUCTURE
-------------------------------------------- */
const defaultFAQ = {
  mainTitle: { en: "Frequently Asked Questions", ar: "الأسئلة الشائعة" },
  items: [
    {
      question: { en: "What design services do you offer?", ar: "ما هي الخدمات التصميمية التي تقدمها؟" },
      answer: { en: "We offer various services including...", ar: "نحن نقدم خدمات مختلفة تشمل..." },
    },
    {
      question: { en: "Who are the team I can rely on with this project?", ar: "من هم الفريق الذي يمكنني الاعتماد عليه في هذا المشروع؟" },
      answer: { en: "Our team consists of experts in...", ar: "فريقنا يتكون من خبراء في..." },
    },
  ],
};

/* -------------------------------------------
   NESTED PATCH FUNCTION FOR MULTI-LANGUAGE
-------------------------------------------- */
const patch = (path, value, setData) => {
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

export default function FAQAdmin() {
  const [data, setData] = useState(structuredClone(defaultFAQ));
  const [lang, setLang] = useState("en"); // Language switcher

  /* -------------------------------------------
     SAVE FUNCTION
  -------------------------------------------- */
  const save = () => {
    localStorage.setItem("cms_faq", JSON.stringify(data));
    alert("Saved FAQ Content");
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-6">FAQ CMS</h1>

      <div className="border rounded-xl bg-white shadow-sm mb-6">
        {/* Language Switcher */}
        <div className="flex gap-2 mb-6">
          <Button variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>
            English
          </Button>
          <Button variant={lang === "ar" ? "default" : "outline"} onClick={() => setLang("ar")}>
            Arabic
          </Button>
        </div>

        {/* MAIN TITLE */}
        <div className="mb-5">
          <label className="font-medium">{t.title} ({lang.toUpperCase()})</label>
          <Textarea
            rows={2}
            className="mt-1"
            value={data.mainTitle[lang]}
            onChange={(e) => patch(`mainTitle.${lang}`, e.target.value, setData)}
          />
        </div>

        {/* FAQ ITEMS */}
        <div className="space-y-4">
          {data.items.map((item, index) => (
            <div key={index} className="border-b p-4">
              {/* QUESTION */}
              <label className="font-medium">{t.question} ({lang.toUpperCase()})</label>
              <Input
                className="mt-1"
                value={item.question[lang]}
                onChange={(e) => patch(`items.${index}.question.${lang}`, e.target.value, setData)}
              />

              {/* ANSWER */}
              <label className="font-medium">{t.answer} ({lang.toUpperCase()})</label>
              <Textarea
                rows={4}
                className="mt-1"
                value={item.answer[lang]}
                onChange={(e) => patch(`items.${index}.answer.${lang}`, e.target.value, setData)}
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={save} className="flex items-center gap-2">
            <Save size={14} /> {t.save}
          </Button>
        </div>
      </div>
    </main>
  );
}
