"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ImageUploader from "@/app/components/ImageUploader"; // ✅ Import uploader

const FORM_KEY = "start_project_form_v1";

export default function StartProjectSinglePage() {
  const { slug } = useParams();
  const router = useRouter();
  const type = slug?.toLowerCase();

  const { locale } = useLocale();
  const isRTL = locale === "ar";

  const { data } = usePageContent();
  const content = data?.[`${type}Steps`];

  if (!content)
    return (
      <div className="py-20 text-center font-semibold text-red-500">
        Missing CMS content for "{type}"
      </div>
    );

  /* -------------------------------------------------
     Load saved form
  --------------------------------------------------*/
  const [form, setForm] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FORM_KEY)) || {};
    } catch {
      return {};
    }
  });

  const updateForm = (key, value) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    localStorage.setItem(FORM_KEY, JSON.stringify(updated));
  };

  /* -------------------------------------------------
     Submit Project → Go to packages
  --------------------------------------------------*/
  const handleSubmit = () => {
    const payload = {
      type,
      form,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("startProjectData", JSON.stringify(payload));
    router.push(`/${locale}/packages`);
  };

  return (
    <section className="mx-4 sm:mx-8 md:mx-16 my-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDE IMAGE */}
        <div className="lg:w-1/3 hidden lg:block">
          <div className="sticky top-24 rounded-xl overflow-hidden shadow-lg">
            <img
              src={content.kindImage}
              alt={type}
              className="w-full h-[500px] object-cover"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
            {content.introTitle}
          </h1>

          <p className="text-gray-600 mb-6">{content.introSubtitle}</p>

          <div className="space-y-10">
            {/* ====================================================
               MAIN STEPS (GRID OPTIONS)
            ====================================================== */}
            {content.steps?.map((step, sIndex) => (
              <div key={`step-${sIndex}`}>
                <h2 className="text-lg font-semibold mb-2">{step.title}</h2>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {step.options.map((opt, oIndex) => (
                    <OptionCard
                      key={`step-${sIndex}-opt-${oIndex}`}
                      option={opt}
                      selected={
                        form[`step_${sIndex}`]?.cardName === opt.cardName
                      }
                      onClick={() => updateForm(`step_${sIndex}`, opt)}
                    />
                  ))}
                </div>

                {/* 🔥 If "Yes" is selected → show ImageUploader */}
                {step.options.some((o) => o.cardName === "yes") &&
                  form[`step_${sIndex}`]?.cardName === "yes" && (
                    <div className="mt-4">
                      <ImageUploader
                        value={form.uploadedPlan || ""}
                        inputId={`plan-upload-${sIndex}`} // ✔ Unique input ID
                        onChange={(url) => {
                          updateForm("uploadedPlan", url);
                        }}
                      />

                      {/* Preview from saved URL */}
                      {form.uploadedPlan && (
                        <img
                          src={form.uploadedPlan}
                          className="mt-4 h-52 object-cover rounded-md shadow"
                        />
                      )}
                    </div>
                  )}
              </div>
            ))}

            {/* ====================================================
               FINAL STEPS (Dropdowns)
            ====================================================== */}
            {content.finalSteps?.map((fs, fIndex) => (
              <div key={`final-${fIndex}`}>
                <h2 className="text-lg font-semibold mb-2">{fs.title}</h2>

                <Select
                  value={form[`final_${fIndex}`]?.value || ""}
                  onValueChange={(value) => {
                    const selected = fs.options.find((o) => o.value === value);
                    updateForm(`final_${fIndex}`, selected);
                  }}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder={fs.selectPlaceholder} />
                  </SelectTrigger>

                  <SelectContent>
                    {fs.options.map((opt, optIndex) => (
                      <SelectItem
                        key={`final-${fIndex}-opt-${optIndex}`}
                        value={opt.value}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              className="w-full bg-primary-btn text-white py-3 rounded-xl text-lg font-medium hover:bg-primary-theme transition"
            >
              {content.submitLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   OPTION CARD
======================================================= */
function OptionCard({ option, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border overflow-hidden transition
        ${
          selected
            ? "border-4 border-primary-theme"
            : "border-gray-300 hover:border-primary-theme"
        }`}
    >
      {option.cardImageUrl ? (
        <div className="h-32 relative">
          <img
            src={option.cardImageUrl}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 bg-black/50 w-full text-white text-center py-1 text-sm">
            {option.cardTitle}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="font-bold">{option.cardTitle}</p>
          {option.cardDescription && (
            <p className="text-sm">{option.cardDescription}</p>
          )}
          {option.cardDescription2 && (
            <p className="text-sm">{option.cardDescription2}</p>
          )}
        </div>
      )}
    </button>
  );
}
