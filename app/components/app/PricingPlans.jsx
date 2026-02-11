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

      {/* ===== Golden Guarantee Section ===== */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-10">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] p-[1px] rounded-2xl shadow-lg">
          <div className="bg-white rounded-[15px] px-6 py-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
            
            {/* Decorative Gold Badge/Icon */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-b from-[#BF953F] to-[#B38728] p-2 rounded-full text-white shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-[#B38728] to-[#BF953F] bg-clip-text text-transparent uppercase tracking-tight">
                {plansData.refundHeading}
              </h4>
            </div>

            {/* Vertical Divider (Hidden on Mobile) */}
            <div className="hidden md:block w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

            <p className="text-gray-700 text-sm md:text-lg font-semibold text-center md:text-start max-w-2xl">
              {plansData.refundText}
            </p>

          </div>
        </div>
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