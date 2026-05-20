"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import Image from "next/image";

import step1 from "@/public/icons/step1.png";
import step2 from "@/public/icons/step2.png";
import step3 from "@/public/icons/step3.png";

const icons = [step1, step2, step3];

/*
  Layout (LTR):
    Step 1 — top-left
    Step 2 — top-right  (slightly lower)
    Step 3 — bottom-left (much lower)

  SVG viewBox 0 0 1280 520
    Step 1 badge ≈ (70, 65)
    Step 2 badge ≈ (1060, 185)
    Step 3 badge ≈ (390, 415)

  Curve 1: oval arc bowing UPWARD from step 1 → step 2
  Curve 2: oval arc bowing DOWNWARD from step 2 → step 3
*/

export default function HowItWorks() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const how = data?.howitworks || {};
  const steps = how?.steps || [];

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-10 sm:py-24 relative bg-white overflow-hidden"
    >
      {/* ── Section Title ── */}
      <div className="text-center mb-12 sm:mb-16 px-4">
        <p className="text-sm sm:text-base text-[#4A6E6D] font-semibold tracking-widest uppercase mb-3">
          {how.smallTitle || ""}
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-snug max-w-2xl mx-auto">
          {how.mainTitle || ""}
        </h2>
      </div>

      {/* ── Steps ── */}
      <div className="relative w-full max-w-5xl mx-auto px-6 md:px-10">

        {/* ── SVG dashed oval curves ── */}
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 520"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          {isRTL ? (
            <>
              {/* RTL Curve 1: step 1 (top-right) → step 2 (top-left), oval bows upward */}
              <path
                d="M 930,65 C 820,-55 180,-55 70,185"
                stroke="#C5CDD6"
                strokeWidth="2.5"
                strokeDasharray="14 9"
                strokeLinecap="round"
              />
              {/* RTL Curve 2: step 2 (top-left) → step 3 (bottom-right), oval bows downward */}
              <path
                d="M 70,185 C -60,340 860,500 640,415"
                stroke="#C5CDD6"
                strokeWidth="2.5"
                strokeDasharray="14 9"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {/* LTR Curve 1: step 1 (top-left) → step 2 (top-right), oval bows upward */}
              <path
                d="M 70,65 C 180,-55 820,-55 930,185"
                stroke="#C5CDD6"
                strokeWidth="2.5"
                strokeDasharray="14 9"
                strokeLinecap="round"
              />
              {/* LTR Curve 2: step 2 (top-right) → step 3 (bottom-left), oval bows downward */}
              <path
                d="M 930,185 C 1060,340 140,500 360,415"
                stroke="#C5CDD6"
                strokeWidth="2.5"
                strokeDasharray="14 9"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>

        {/* ── Step cards ── */}
        <div className="flex flex-col gap-10 md:gap-0">
          {steps.map((step, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;

            // Desktop alignment: 1=left, 2=right, 3=left-center
            const alignClass =
              isSecond
                ? isRTL ? "md:mr-auto" : "md:ml-auto"
                : isRTL ? "md:ml-auto" : "md:mr-auto";

            const textAlign = isSecond ? "text-right" : "text-left";

            // Vertical spacing to create stagger
            const marginClass =
              isFirst ? "md:mb-8" : isSecond ? "md:mb-24" : "";

            return (
              <div
                key={index}
                className={`flex flex-row items-start gap-4 md:gap-5 w-full md:w-auto md:max-w-xs ${alignClass} ${marginClass}`}
              >
                {/* Badge */}
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#5E7E7D] text-white flex items-center justify-center font-bold text-base z-10 shadow-sm">
                  {index + 1}
                </div>

                {/* Content */}
                <div className={textAlign}>
                  {/* Title row — icon before title on step 1, after on steps 2 & 3 */}
                  <div className={`flex items-center gap-2 mb-1.5 ${isSecond ? "justify-end" : "justify-start"}`}>
                    {isFirst && icons[0] && (
                      <Image
                        src={icons[0]}
                        alt="Step 1"
                        width={24}
                        height={24}
                        className="shrink-0"
                      />
                    )}
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    {!isFirst && icons[index] && (
                      <Image
                        src={icons[index]}
                        alt={`Step ${index + 1}`}
                        width={24}
                        height={24}
                        className="shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
