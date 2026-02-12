"use client";

import { Check, ArrowRight, Sparkles, Building2, Home, Armchair, SaudiRiyalIcon } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function PricingPlans({ ctaText, ctaLink }) {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const router = useRouter();

  const isRTL = locale === "ar";

  const plansData = data?.plans || {};
  const rawPlans = plansData?.list || [];
  const mainTitle = plansData?.mainTitle || {};
  
  // Use passed CTA text, or fallback to generic "Select Package" to avoid confusion
  const buttonText = ctaText || plansData?.cta || (isRTL ? "اختر الباقة" : "Select Package");

  // 1. SORTING LOGIC: Room -> Apartment -> Villa
  const sortedPlans = useMemo(() => {
    if (!rawPlans.length) return [];
    
    // Assign a weight to each type
    const getWeight = (title) => {
      const t = title.toLowerCase();
      if (t.includes('room') || t.includes('غرفة')) return 1;
      if (t.includes('apartment') || t.includes('شقة')) return 2;
      if (t.includes('villa') || t.includes('فيلا')) return 3;
      return 4; // Others
    };

    return [...rawPlans].sort((a, b) => getWeight(a.title) - getWeight(b.title));
  }, [rawPlans]);

  // 2. EXTRACT COMMON FEATURES (Take from the first plan since they are all same)
  const commonFeatures = sortedPlans[0]?.features || [];

  // 3. HELPER: Get Dynamic Icon
  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('room') || t.includes('غرفة')) return <Armchair className="w-6 h-6" />;
    if (t.includes('apartment') || t.includes('شقة')) return <Building2 className="w-6 h-6" />;
    return <Home className="w-6 h-6" />;
  };

  // 4. HELPER: Get Dynamic Unit Label (/Room, /Villa, etc)
  const getUnitLabel = (title) => {
    const t = title.toLowerCase();
    if (isRTL) {
        if (t.includes('room') || t.includes('غرفة')) return '/ غرفة';
        if (t.includes('apartment') || t.includes('شقة')) return '/ شقة';
        if (t.includes('villa') || t.includes('فيلا')) return '/ فيلا';
        return '';
    } else {
        if (t.includes('room')) return '/ Room';
        if (t.includes('apartment')) return '/ Apartment';
        if (t.includes('villa')) return '/ Villa';
        return '';
    }
  };

  const handleCta = () => {
    if (ctaLink) {
      router.push(ctaLink);
    } else {
      router.push(`/${locale}/start-a-project`);
    }
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ===== Header ===== */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-bold text-[#5E7E7D] uppercase tracking-wider mb-3">
            {plansData?.smallTitle || ""}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
            {mainTitle?.normal || ""}{" "}
            <span className="text-[#2D3247]">{mainTitle?.highlight || ""}</span>
          </h2>
        </div>

        {/* ===== PART 1: COMPACT PRICING CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {sortedPlans.map((plan, index) => {
            const isMiddle = index === 1; // Typically Apartment is middle now
            
            return (
              <div 
                key={index}
                className={`
                  relative rounded-2xl p-8 border transition-all duration-300 flex flex-col items-center text-center
                  ${isMiddle 
                    ? "bg-[#2D3247] text-white border-[#2D3247] shadow-xl transform md:-translate-y-2" 
                    : "bg-white text-gray-900 border-gray-100 shadow-lg hover:shadow-xl hover:border-[#5E7E7D]/30"
                  }
                `}
              >
                {/* Icon Circle */}
                <div className={`
                  w-14 h-14 rounded-full flex items-center justify-center mb-4
                  ${isMiddle ? "bg-white/10 text-white" : "bg-[#5E7E7D]/10 text-[#5E7E7D]"}
                `}>
                  {getIcon(plan.title)}
                </div>

                <h3 className="text-xl font-bold mb-1">{plan.title}</h3>
                <p className={`text-sm mb-6 ${isMiddle ? "text-gray-300" : "text-gray-500"}`}>
                  {plan.area}
                </p>

                {/* Price Block */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {plan.price} <SaudiRiyalIcon className="inline-block" />
                    </span>
                    {/* DYNAMIC UNIT LABEL HERE */}
                    <span className={`text-sm font-medium opacity-80 ${isMiddle ? "text-gray-300" : "text-gray-500"}`}>
                      {getUnitLabel(plan.title)}
                    </span>
                  </div>
                  {plan.oldPrice && (
                    <span className={`text-sm line-through ${isMiddle ? "text-gray-500" : "text-gray-300"}`}>
                      {plan.oldPrice}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCta}
                  className={`
                    w-full py-3 rounded-xl font-bold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2
                    ${isMiddle 
                      ? "bg-white text-[#2D3247] hover:bg-gray-100" 
                      : "bg-[#2D3247] text-white hover:bg-[#1e2231]"
                    }
                  `}
                >
                  {buttonText}
                  <ArrowRight size={16} />
                </button>

                <p className={`text-[10px] mt-3 font-medium ${isMiddle ? "text-gray-400" : "text-emerald-600"}`}>
                  {plan.tax}
                </p>
              </div>
            );
          })}
        </div>

        {/* ===== PART 2: UNIFIED FEATURES LIST ===== */}
        <div className="bg-gray-50/80 rounded-3xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-[#2D3247] flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-500" size={24} />
              {isRTL ? "جميع الباقات تشمل الميزات التالية" : "All Packages Include"}
            </h3>
            <p className="text-gray-500 mt-2">
              {isRTL ? "نقدم نفس الجودة العالية والاهتمام بالتفاصيل لجميع أنواع الوحدات" : "We provide the same high quality and attention to detail for all unit types"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {commonFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${feature.included ? "bg-[#5E7E7D]/10 text-[#5E7E7D]" : "bg-gray-100 text-gray-300"}`}>
                   <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <span className={`text-sm md:text-base font-medium ${feature.included ? "text-gray-800" : "text-gray-400 line-through"}`}>
                    {feature.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Guarantee Section (Keep as footer) ===== */}
        <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 px-6 py-3 rounded-full text-yellow-800 text-sm font-semibold">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {plansData.refundHeading} — {plansData.refundText}
            </div>
        </div>

      </div>
    </section>
  );
}