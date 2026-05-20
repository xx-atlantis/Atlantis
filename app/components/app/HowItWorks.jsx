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
    Step 1 — top-left    [icon][Title][badge●1]
    Step 2 — top-right   [badge●2][Title][icon]
    Step 3 — centered    [badge●3][Title][icon]

  SVG viewBox 0 0 1000 520
    Step 1 badge ≈ (280, 72)   — badge is RIGHT of icon+title in left-aligned block
    Step 2 badge ≈ (670, 200)  — badge is LEFT of title in right-aligned block
    Step 3 badge ≈ (340, 430)  — badge is LEFT of title in centered block

  Curve 1: half-oval arc bowing UPWARD  from step 1 → step 2
  Curve 2: half-oval arc bowing DOWNWARD from step 2 → step 3
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
              {/* RTL Curve 1: step 1 badge (724,24) → step 2 badge (316,110), bows upward */}
              <path
                d="M 724,24 C 610,-40 430,-40 316,110"
                stroke="#C5CDD6"
                strokeWidth="2.5"
                strokeDasharray="14 9"
                strokeLinecap="round"
              />
              {/* RTL Curve 2: step 2 badge (316,110) → step 3 badge (665,384), bows downward */}
              <path
                d="M 316,110 C 180,350 850,480 665,384"
                stroke="#C5CDD6"
                strokeWidth="2.5"
                strokeDasharray="14 9"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {/* LTR Curve 1: step 1 badge (276,24) → step 2 badge (684,110), bows upward */}
              <path
                d="M 276,24 C 390,-40 570,-40 684,110"
                stroke="#C5CDD6"
                strokeWidth="2.5"
                strokeDasharray="14 9"
                strokeLinecap="round"
              />
              {/* LTR Curve 2: step 2 badge (684,110) → step 3 badge (335,384), bows downward */}
              <path
                d="M 684,110 C 820,350 150,480 335,384"
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
            const isFirst  = index === 0;
            const isSecond = index === 1;

            const alignClass = isSecond
              ? (isRTL ? "md:mr-auto" : "md:ml-auto")
              : isFirst
              ? (isRTL ? "md:ml-auto" : "md:mr-auto")
              : "md:mx-auto"; // step 3 centered under the two upper steps

            const marginClass = isFirst ? "md:mb-8" : isSecond ? "md:mb-24" : "";

            const Badge = (
              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#5E7E7D] text-white flex items-center justify-center font-bold text-base z-10 shadow-sm">
                {index + 1}
              </div>
            );

            /* ── Step 1: [icon] [Title + Badge] [desc] ── */
            if (isFirst) {
              return (
                <div key={index} className={`flex flex-row items-start gap-3 w-full md:w-auto md:max-w-xs ${alignClass} ${marginClass}`}>
                  {/* Icon to the left */}
                  {icons[0] && (
                    <Image src={icons[0]} alt="Step 1" width={28} height={28} className="shrink-0 mt-1" />
                  )}
                  <div>
                    {/* Title + badge on the same row */}
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">{step.title}</h3>
                      {Badge}
                    </div>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            }

            /* ── Steps 2 & 3: [Badge] [Title + icon] [desc] ── */
            return (
              <div key={index} className={`flex flex-row items-start gap-3 w-full md:w-auto md:max-w-xs ${alignClass} ${marginClass}`}>
                {Badge}
                <div className={isSecond ? "text-right" : "text-left"}>
                  <div className={`flex items-center gap-2 mb-1.5 ${isSecond ? "justify-end" : "justify-start"}`}>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">{step.title}</h3>
                    {icons[index] && (
                      <Image src={icons[index]} alt={`Step ${index + 1}`} width={24} height={24} className="shrink-0" />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
