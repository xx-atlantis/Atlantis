"use client";

import { Check, Circle, ArrowRight } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useRouter } from "next/navigation";

// 1. Accept optional props for custom CTA text and link
export default function PricingPlans({ ctaText, ctaLink }) {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const router = useRouter();

  const isRTL = locale === "ar";

  const plansData = data?.plans || {};
  const plans = plansData?.list || [];
  const mainTitle = plansData?.mainTitle || {};

  // 2. Determine which text to display (Prop > CMS Data)
  const buttonText = ctaText || plansData?.cta;

  // 3. Update handler to use the prop link if provided
  const handleCta = () => {
    if (ctaLink) {
      router.push(ctaLink);
    } else {
      router.push(`/${locale}/pricing-plans`);
    }
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-10 md:py-10 bg-white text-center"
    >
      {/* ===== Heading ===== */}
      <p className="text-sm text-[#5E7E7D] font-semibold uppercase mb-2">
        {plansData?.smallTitle || ""}
      </p>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-12 sm:mb-16 leading-snug">
        {mainTitle?.normal || ""}{" "}
        <span className="text-[#2D3247]">{mainTitle?.highlight || ""}</span>
      </h2>

      {/* ===== Pricing Cards ===== */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm border min-h-[480px] transition-transform hover:scale-[1.02] ${
              plan.recommended
                ? "border-yellow-100 shadow-md bg-[#6D94941A]"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            {/* Recommended Badge */}
            {plan.recommended && (
              <span className="absolute top-3 right-3 bg-yellow-400 text-gray-800 text-[11px] sm:text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                {plansData?.recommended || "Recommended"}
              </span>
            )}

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-[#5E7E7D] mb-2">
              {plan.title}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[#5E7E7D] mb-5 sm:mb-6">
              {plan.area}
            </p>
            {/* Features */}
            <ul className="space-y-3 text-start mb-6 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check
                      size={18}
                      className="text-[#2D3247] shrink-0 mt-0.5"
                    />
                  ) : (
                    <Circle
                      size={16}
                      className="text-gray-300 shrink-0 mt-[3px]"
                    />
                  )}
                  <span className="text-gray-800 text-sm leading-relaxed">
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Price */}
            <div className="mt-auto">
              <p className="text-[#5E7E7D] font-semibold text-base sm:text-lg">
                <span className="text-xl sm:text-2xl font-bold text-[#2D3247]">
                  {plan.price}
                </span>{" "}
                {plansData?.perRoom || ""}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm line-through mt-1">
                {plan.oldPrice}
              </p>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#5E7E7D] my-2">
              {plan.tax}
            </p>
          </div>
        ))}
      </div>

      <div className="w-full  max-w-7xl mx-auto px-4 sm:px-8 bg-gray-50 py-3  rounded-2xl flex flex-col md:flex-row items-center justify-center gap-8 mt-6">
        <h4 className="text-lg font-bold">
          {plansData.refundHeading}
        </h4>
        <p className="text-sm md:text-lg font-medium">
          {plansData.refundText}
        </p>
      </div>

      {/* ===== CTA ===== */}
      {/* 4. Render if buttonText exists (either from prop or CMS) */}
      {buttonText && (
        <div className="mt-12 sm:mt-16 flex justify-center">
          <button
            onClick={handleCta}
            className="flex items-center justify-center gap-2 bg-[#2D3247] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg hover:bg-[#1e2231] transition text-sm sm:text-base font-medium w-11/12 md:w-auto"
          >
            {buttonText} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}