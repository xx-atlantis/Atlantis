"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import Image from "next/image";

import step1 from "@/public/icons/step1.png";
import step2 from "@/public/icons/step2.png";
import step3 from "@/public/icons/step3.png";

const icons = [step1, step2, step3];

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
      {/* ===== Section Title ===== */}
      <div className="text-center mb-12 sm:mb-16">
        <p className="text-sm sm:text-base text-[#4A6E6D] font-semibold tracking-wide uppercase mb-2">
          {how.smallTitle || ""}
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
          {how.mainTitle || ""}
        </h2>
      </div>

      {/* ===== Steps ===== */}
      <div className="relative w-full max-w-7xl mx-auto  py-6 sm:py-10">
        {/* Connecting curves — SVG so they align correctly in both LTR and RTL */}
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1280 480"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          {isRTL ? (
            <>
              {/* RTL: Badge 1 (far right x≈1232) → Badge 2 (x≈408, badge is right-side of left-anchored card) */}
              <path
                d="M1232,55 C972,55 648,145 408,165"
                stroke="#D1D5DB"
                strokeWidth="2.5"
                strokeDasharray="12 8"
                strokeLinecap="round"
              />
              {/* RTL: Badge 2 (x≈408) → Badge 3 (center x≈820) */}
              <path
                d="M408,165 C568,185 680,340 820,370"
                stroke="#D1D5DB"
                strokeWidth="2.5"
                strokeDasharray="12 8"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {/* LTR: Badge 1 (far left) → Badge 2 (right) */}
              <path
                d="M40,55 C300,55 860,145 1100,165"
                stroke="#D1D5DB"
                strokeWidth="2.5"
                strokeDasharray="12 8"
                strokeLinecap="round"
              />
              {/* LTR: Badge 2 (right) → Badge 3 (center) */}
              <path
                d="M1100,165 C940,185 600,340 460,370"
                stroke="#D1D5DB"
                strokeWidth="2.5"
                strokeDasharray="12 8"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
        <div className="flex flex-col gap-4 md:gap-0 p-4 md:p-0 items-baseline md:items-center">
          {steps.map((step, index) => {
            let alignmentClass = "text-center";
            if (index === 0)
              alignmentClass = isRTL
                ? "md:ml-auto text-right"
                : "md:mr-auto text-left";
            if (index === 1)
              alignmentClass = isRTL
                ? "md:mr-auto text-right"
                : "md:ml-auto text-right";

            // 🔥 Custom spacing per step (OPTION 1)
            let spacingClass = "";
            if (index === 0) spacingClass = "md:mb-0";
            if (index === 1) spacingClass = "md:mb-28";
            if (index === 2) spacingClass = "md:mb-0";

            return (
              <div
                key={index}
                className={`flex flex-row items-start gap-4 md:gap-6 ${alignmentClass} ${spacingClass}`}
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#5E7E7D] text-white rounded-full font-semibold shrink-0 text-sm sm:text-base z-10">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="max-w-sm">
                  <h3 className="text-lg md:text-xl font-semibold text-black mb-2 flex items-center gap-2">
                    {step.title}
                    {icons[index] && (
                      <Image
                        src={icons[index]}
                        alt={`Step ${index + 1}`}
                        width={20}
                        height={20}
                        className="inline-block"
                      />
                    )}
                  </h3>

                  <p className="text-gray-800 text-sm md:text-base leading-relaxed">
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
