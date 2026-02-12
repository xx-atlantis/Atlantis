"use client";

import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useRouter } from "next/navigation";

export default function PricingPlans({ ctaText, ctaLink }) {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const router = useRouter();

  const isRTL = locale === "ar";

  const plansData = data?.plans || {};
  const plans = plansData?.list || [];
  const mainTitle = plansData?.mainTitle || {};

  const buttonText = ctaText || plansData?.cta;

  const handleCta = () => {
    if (ctaLink) {
      router.push(ctaLink);
    } else {
      router.push(`/${locale}/start-a-project`);
    }
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ===== Header ===== */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-bold text-[#5E7E7D] uppercase tracking-wider mb-3">
            {plansData?.smallTitle || ""}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            {mainTitle?.normal || ""}{" "}
            <span className="text-[#2D3247] relative inline-block">
              {mainTitle?.highlight || ""}
              {/* Optional underline decoration */}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#BF953F] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h2>
        </div>

        {/* ===== Pricing Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
          
          {plans.map((plan, index) => {
            // Logic to highlight the middle card (index 1)
            const isPopular = index === 1;

            return (
              <div
                key={index}
                className={`
                  relative rounded-3xl transition-all duration-300 flex flex-col
                  ${isPopular 
                    ? "bg-white shadow-2xl ring-1 ring-[#2D3247]/10 z-10 md:-mt-8 md:mb-4 border-t-4 border-[#2D3247]" 
                    : "bg-white shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1"
                  }
                `}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2D3247] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-lg">
                    <Sparkles size={12} className="text-yellow-400" />
                    {isRTL ? "الأكثر طلباً" : "Most Popular"}
                  </div>
                )}

                <div className="p-8">
                  {/* Title & Area */}
                  <h3 className={`text-xl font-bold mb-2 ${isPopular ? "text-[#2D3247]" : "text-gray-700"}`}>
                    {plan.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 font-medium bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                    {plan.area}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 font-medium text-sm">
                       {plansData?.perRoom || ""}
                    </span>
                  </div>
                  
                  {/* Old Price / Tax Note */}
                  <div className="flex items-center gap-3 mb-8 text-sm">
                    {plan.oldPrice && (
                      <span className="text-gray-400 line-through decoration-red-400 decoration-2">
                        {plan.oldPrice}
                      </span>
                    )}
                     <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                      {plan.tax}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 w-full mb-8" />

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPopular ? 'bg-[#2D3247] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-gray-200 text-gray-300">
                             <X size={12} />
                          </div>
                        )}
                        <span className={`text-sm leading-relaxed ${feature.included ? "text-gray-700 font-medium" : "text-gray-400 line-through decoration-gray-300"}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Card-specific CTA (Optional visual, leads to same place) */}
                  <button 
                    onClick={handleCta}
                    className={`
                      w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2
                      ${isPopular 
                        ? "bg-[#2D3247] text-white hover:bg-[#1e2231] shadow-lg shadow-[#2D3247]/20" 
                        : "bg-white border-2 border-gray-100 text-gray-600 hover:border-[#2D3247] hover:text-[#2D3247]"
                      }
                    `}
                  >
                    {isRTL ? "ابدأ المشروع" : "Start Project"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== Guarantee Box ===== */}
        <div className="mt-16 md:mt-24 max-w-5xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#BF953F]/20 via-[#FCF6BA]/40 to-[#B38728]/20 p-[1px] rounded-2xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-[15px] p-8 md:p-10 text-center md:text-start flex flex-col md:flex-row items-center gap-8 shadow-sm">
              
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-[#BF953F] to-[#B38728] rounded-full flex items-center justify-center shadow-lg text-white shrink-0">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                 </svg>
              </div>

              {/* Text */}
              <div className="flex-1">
                <h4 className="text-xl font-extrabold text-[#2D3247] mb-2">
                  {plansData.refundHeading}
                </h4>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {plansData.refundText}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}