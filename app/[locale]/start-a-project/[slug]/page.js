"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "@/app/components/ImageUploader";
import { ChevronRight } from "lucide-react";

const FORM_KEY = "start_project_form_v1";

export default function StartProjectSinglePage() {
  const { slug } = useParams();
  const router = useRouter();
  const type = slug?.toLowerCase();
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const { data } = usePageContent();
  const content = data?.[`${type}Steps`];

  const [form, setForm] = useState({});
  const [hasAdditionalFee, setHasAdditionalFee] = useState(false);
  const [additionalFeeAmount, setAdditionalFeeAmount] = useState(0);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(FORM_KEY);
      if (savedData) {
        const parsedMaster = JSON.parse(savedData);
        if (parsedMaster[type]) {
          const projectEntry = parsedMaster[type];
          setForm(projectEntry.form || {});
          setHasAdditionalFee(projectEntry.hasAdditionalFee || false);
          setAdditionalFeeAmount(projectEntry.additionalFeeAmount || 0);
        }
      }
    } catch (e) {
      console.error("Error loading form data", e);
    }
  }, [type]);

  const updateForm = (key, value, questionText = null) => {
    setForm((prev) => {
      let updatedLocalForm;

      // Handle MULTI-SELECT for the very first question (step_0)
      if (key === "step_0") {
        const currentSelections = Array.isArray(prev[key]?.selections) ? prev[key].selections : [];
        const isAlreadySelected = currentSelections.some((item) => item.cardName === value.cardName);

        let newSelections;
        if (isAlreadySelected) {
          // Remove if clicked again
          newSelections = currentSelections.filter((item) => item.cardName !== value.cardName);
        } else {
          // Add to array
          newSelections = [...currentSelections, value];
        }

        updatedLocalForm = {
          ...prev,
          [key]: {
            question: questionText || prev[key]?.question,
            selections: newSelections,
            // Joined string for quick reference/preview
            cardName: newSelections.map((s) => s.cardName).join(", "),
          },
        };
      } else {
        // Standard SINGLE-SELECT for all other steps
        const newEntry = { ...value };
        if (questionText) newEntry.question = questionText;
        updatedLocalForm = { ...prev, [key]: newEntry };
      }

      // Fee Logic (triggered by "Plan" questions)
      let newHasAdditionalFee = hasAdditionalFee;
      let newAdditionalFeeAmount = additionalFeeAmount;
      const isPlanQuestion = questionText?.toLowerCase().includes("plan");

      if (isPlanQuestion) {
        if (value?.cardName === "no") {
          newHasAdditionalFee = true;
          newAdditionalFeeAmount = 199;
        } else if (value?.cardName === "yes") {
          newHasAdditionalFee = false;
          newAdditionalFeeAmount = 0;
        }
      }

      // Save full master structure to localStorage
      const masterData = JSON.parse(localStorage.getItem(FORM_KEY) || "{}");
      masterData[type] = {
        form: updatedLocalForm,
        hasAdditionalFee: newHasAdditionalFee,
        additionalFeeAmount: newAdditionalFeeAmount,
      };
      localStorage.setItem(FORM_KEY, JSON.stringify(masterData));

      setHasAdditionalFee(newHasAdditionalFee);
      setAdditionalFeeAmount(newAdditionalFeeAmount);

      return updatedLocalForm;
    });
  };

  const handleSubmit = () => {
    const validStepKeys = content.steps?.map((_, i) => `step_${i}`) || [];
    const validFinalKeys = content.finalSteps?.map((_, i) => `final_${i}`) || [];
    const allowedKeys = [...validStepKeys, ...validFinalKeys, "uploadedPlan"];

    const filteredForm = Object.keys(form)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = form[key];
        return obj;
      }, {});

    if (Object.keys(filteredForm).length === 0) {
      toast.warn(isRTL ? "يرجى اختيار خيار واحد على الأقل" : "Please select at least one option");
      return;
    }

    const payload = {
      type,
      form: filteredForm,
      hasAdditionalFee,
      additionalFeeAmount,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("startProjectData", JSON.stringify(payload));
    router.push(`/${locale}/packages`);
  };

  if (!content)
    return (
      <div className="py-20 text-center font-semibold text-red-500">
        Missing CMS content for "{type}"
      </div>
    );

  return (
    <section className="mx-4 sm:mx-8 md:mx-16 my-8" dir={isRTL ? "rtl" : "ltr"}>
      <ToastContainer rtl={isRTL} />
      <div className="max-w-8xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 hidden lg:block">
          <div className="sticky top-24 rounded-4xl overflow-hidden shadow-2xl border-4 border-gray-100">
            <img
              src={content.kindImage}
              alt={type}
              className="w-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-100">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">{content.introTitle}</h1>
          <p className="text-gray-600 mb-8 text-lg">{content.introSubtitle}</p>

          <div className="space-y-12">
            {content.steps?.map((step, sIndex) => {
              const stepKey = `step_${sIndex}`;
              return (
                <div key={stepKey} className="pb-8 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-theme text-white font-bold text-sm">
                      {sIndex + 1}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {step.options.map((opt, oIndex) => {
                      // Logic to determine if this specific card is selected
                      const isSelected =
                        sIndex === 0
                          ? form[stepKey]?.selections?.some((s) => s.cardName === opt.cardName)
                          : form[stepKey]?.cardName === opt.cardName;

                      return (
                        <OptionCard
                          key={`opt-${oIndex}`}
                          option={opt}
                          selected={!!isSelected}
                          onClick={() => updateForm(stepKey, opt, step.title)}
                        />
                      );
                    })}
                  </div>

                  {/* Upload Plan Logic */}
                  {step.options.some((o) => o.cardName === "yes") &&
                    form[stepKey]?.cardName === "yes" && (
                      <div className="mt-6 p-6 border-2 border-dashed border-primary-theme/30 rounded-2xl bg-gradient-to-br from-gray-50 to-white">
                        <p className="text-sm font-semibold text-gray-700 mb-4">
                          {isRTL ? "📎 قم بتحميل المخطط الخاص بك" : "📎 Upload Your Plan"}
                        </p>
                        <ImageUploader
                          value={form.uploadedPlan?.value || ""}
                          inputId={`plan-upload-${sIndex}`}
                          onChange={(url) => updateForm("uploadedPlan", { value: url }, "Uploaded Plan")}
                        />
                      </div>
                    )}
                </div>
              );
            })}

            {/* Final Dropdown Steps */}
            {content.finalSteps?.map((fs, fIndex) => (
              <div key={`final-${fIndex}`} className="pb-8 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-theme text-white font-bold text-sm">
                    {(content.steps?.length || 0) + fIndex + 1}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">{fs.title}</h2>
                </div>
                <Select
                  value={form[`final_${fIndex}`]?.value || ""}
                  onValueChange={(val) => {
                    const selected = fs.options.find((o) => o.value === val);
                    updateForm(`final_${fIndex}`, selected, fs.title);
                  }}
                >
                  <SelectTrigger className="w-full bg-white h-14 border-2 hover:border-primary-theme transition-colors rounded-lg text-base shadow-sm">
                    <SelectValue placeholder={fs.selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {fs.options.map((opt, optIndex) => (
                      <SelectItem key={optIndex} value={opt.value} className="text-base py-3">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-primary-theme to-primary-btn text-white py-5 rounded-xl text-lg font-bold hover:shadow-2xl hover:scale-[1.02] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {content.submitLabel}
              <ChevronRight size={20} className={isRTL ? "rotate-180" : ""} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function OptionCard({ option, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
        ${
          selected
            ? "ring-4 ring-primary-theme shadow-xl scale-105"
            : "border-2 border-gray-200 hover:border-primary-theme shadow-md"
        }`}
    >
      {option.cardImageUrl ? (
        <div className="relative h-40 overflow-hidden">
          <img
            src={option.cardImageUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt={option.cardTitle}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-bold text-base drop-shadow-lg">{option.cardTitle}</p>
          </div>
          {selected && (
            <div className="absolute top-3 right-3 w-8 h-8 bg-primary-theme rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`p-5 min-h-[140px] flex flex-col items-center justify-center text-center relative ${
            selected ? "bg-gradient-to-br from-primary-theme/5 to-primary-btn/5" : "bg-white"
          }`}
        >
          {selected && (
            <div className="absolute top-2 right-2 w-7 h-7 bg-primary-theme rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
          <p
            className={`font-bold text-base mb-1 ${selected ? "text-primary-theme" : "text-gray-900"}`}
          >
            {option.cardTitle}
          </p>
          {option.cardDescription && (
            <p className="text-sm text-gray-600 leading-relaxed">{option.cardDescription}</p>
          )}
        </div>
      )}
    </button>
  );
}