"use client";

import { Check, ArrowRight, Sparkles, Building2, Home, Armchair, SaudiRiyalIcon, CheckCircle2, LayoutGrid } from "lucide-react";
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
    if (t.includes('room') || t.includes('غرفة')) return <Armchair size={24} />;
    if (t.includes('apartment') || t.includes('شقة')) return <Building2 size={24} />;
    return <Home size={24} />;
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
    <section dir={isRTL ? "rtl" : "ltr"} className="min-h-screen py-16 bg-[#F8F9FB] text-[#1D1D1F]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ===== Header (Matching OrderSummary Summary Header) ===== */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary-theme font-bold tracking-[0.2em] text-xs uppercase mb-2 block">
            {plansData?.smallTitle || ""}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            {mainTitle?.normal || ""}{" "}
            <span className="text-primary-theme">{mainTitle?.highlight || ""}</span>
          </h2>
        </div>

        {/* ===== PART 1: PRICING CARDS (Matching Property/Checkout Cards) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-center">
          {sortedPlans.map((plan, index) => {
            const isMiddle = index === 1; // Highlight Middle
            
            return (
              <div 
                key={index}
                className={`
                  relative flex flex-col h-full transition-all duration-500 group
                  ${isMiddle 
                    ? "bg-[#2D3247] text-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-[#2D3247] transform md:-translate-y-4 z-10" 
                    : "bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-primary-theme"
                  }
                `}
              >
                {/* Icon & Label */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`
                    p-3 rounded-2xl transition-colors
                    ${isMiddle 
                      ? "bg-white/10 text-white" 
                      : "bg-gray-50 group-hover:bg-primary-theme/10 text-gray-400 group-hover:text-primary-theme"
                    }
                  `}>
                    {getIcon(plan.title)}
                  </div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isMiddle ? "text-gray-300" : "text-gray-400"}`}>
                    {isRTL ? "نوع الباقة" : "Package"}
                  </p>
                </div>

                {/* Title & Area */}
                <h3 className="text-3xl font-bold capitalize mb-1">{plan.title}</h3>
                <p className={`text-sm font-medium mb-8 ${isMiddle ? "text-gray-400" : "text-gray-500"}`}>
                  {plan.area}
                </p>

                {/* Spacer to align bottoms perfectly */}
                <div className="flex-grow"></div>

                {/* Price Block (Matching Checkout Style) */}
                <div className="flex justify-between items-end mb-8 w-full">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold uppercase tracking-tighter text-gray-400 mb-1">
                      {isRTL ? "الإجمالي" : "Total"}
                    </span>
                    <span className="text-sm font-bold text-gray-400">
                      {getUnitLabel(plan.title)}
                    </span>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <p className={`text-5xl font-[1000] tracking-tighter leading-none ${isMiddle ? "text-white" : "text-primary-theme"}`}>
                        {plan.price}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mr-1 ${isMiddle ? "text-gray-300" : "text-gray-400"}`}>
                        <SaudiRiyalIcon className="w-4 h-4 inline-block mb-1" />
                      </span>
                    </div>
                    {plan.oldPrice && (
                      <span className={`text-sm line-through mt-1 font-medium ${isMiddle ? "text-gray-500" : "text-gray-400"}`}>
                        {plan.oldPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Button Block */}
                <button
                  onClick={handleCta}
                  className={`
                    group/btn w-full py-5 rounded-[1.5rem] font-bold text-lg transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 shadow-xl
                    ${isMiddle 
                      ? "bg-white text-[#2D3247] hover:bg-primary-theme hover:text-white shadow-gray-900/10 hover:shadow-primary-theme/20" 
                      : "bg-[#2D3247] text-white hover:bg-primary-theme shadow-gray-200/50 hover:shadow-primary-theme/20"
                    }
                  `}
                >
                  <span>{buttonText}</span>
                  <ArrowRight size={22} className={`transition-transform duration-300 group-hover/btn:translate-x-1 ${isRTL ? "rotate-180" : ""}`}/>
                </button>

                {/* Tax Footnote */}
                <div className={`mt-6 pt-5 w-full flex justify-center border-t ${isMiddle ? "border-white/10" : "border-gray-50"}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isMiddle ? "text-gray-400" : "text-gray-400"}`}>
                    {plan.tax}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== PART 2: UNIFIED FEATURES (Matching Design Details Card) ===== */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <LayoutGrid className="text-primary-theme" size={28}/> 
              {isRTL ? "تفاصيل الباقات" : "Design Details Included"}
            </h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {commonFeatures.length} {isRTL ? "ميزة" : "Parameters"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {commonFeatures.map((feature, i) => (
              <div key={i} className="group relative flex gap-4">
                <div className="relative shrink-0 flex items-start mt-0.5">
                  {feature.included ? (
                    <CheckCircle2 size={24} className="text-green-500 bg-white rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                      <Check size={14} className="text-gray-300" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <p className={`font-bold text-lg leading-tight ${feature.included ? "text-[#1D1D1F]" : "text-gray-400 line-through"}`}>
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Guarantee Section (Matching "Preferences Saved" pill) ===== */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-bold text-gray-500">
              {plansData.refundHeading} — {plansData.refundText}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}