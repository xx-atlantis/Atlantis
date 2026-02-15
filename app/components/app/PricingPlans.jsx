"use client";

import { useState } from "react";
import { Check, Circle, ShieldCheck, ArrowRight, Building2, Home, Armchair, SaudiRiyalIcon } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function PackagesSection({ onSelectPackage, projectType }) {
  const { locale } = useLocale();
  const { data } = usePageContent();

  const isRTL = locale === "ar";
  const [selected, setSelected] = useState(null);

  const content = data?.packages;
  
  if (!content) return null;

  /**
   * 1. FILTERING LOGIC (Untouched)
   */
  const filteredPackages = content.list.filter((pkg) => {
    if (!projectType) return true; 
    return pkg.type?.toLowerCase() === projectType.toLowerCase();
  });

  /**
   * 2. DYNAMIC GRID LOGIC (Untouched)
   */
  const gridConfig = {
    1: "grid-cols-1 max-w-md", 
    2: "grid-cols-1 sm:grid-cols-2 max-w-4xl", 
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl",
  }[Math.min(filteredPackages.length, 3)] || "grid-cols-1 lg:grid-cols-3 max-w-6xl";

  const handleSelect = (pkg, index) => {
    const newSelected = selected === index ? null : index;
    setSelected(newSelected);
    onSelectPackage(newSelected === null ? null : pkg);
  };

  // HELPER: Get Dynamic Icon
  const getIcon = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes('room') || t.includes('غرفة')) return <Armchair className="w-6 h-6" />;
    if (t.includes('apartment') || t.includes('شقة')) return <Building2 className="w-6 h-6" />;
    return <Home className="w-6 h-6" />;
  };

  // HELPER: Get Dynamic Unit Label
  const getUnitLabel = (title) => {
    const t = (title || "").toLowerCase();
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

  if (filteredPackages.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400 font-medium italic">
        {isRTL 
          ? "لا توجد باقات متاحة لهذا النوع من المشاريع حالياً." 
          : "No packages available for this project type at the moment."}
      </div>
    );
  }

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="text-center relative">
      
      {/* ===== Header & Guarantee Section ===== */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
          {content.mainTitle?.normal}{" "}
          <span className="text-[#2D3247]">{content.mainTitle?.highlight}</span>
        </h2>
        
        {content.refundHeading && (
          <div className="mt-6 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 px-6 py-3 rounded-full text-yellow-800 text-sm font-semibold">
            <ShieldCheck className="w-5 h-5 text-yellow-600" />
            <span>{content.refundHeading} — {content.refundText}</span>
          </div>
        )}
      </div>

      {/* ===== Packages Grid ===== */}
      <div className={`w-full mx-auto grid gap-6 items-stretch ${gridConfig}`}>
        {filteredPackages.map((pkg, index) => {
          const isSelected = selected === index;
          const isRecommended = pkg.recommended;

          return (
            <div 
              key={index}
              className={`
                relative rounded-2xl p-8 border transition-all duration-300 flex flex-col items-center text-center cursor-pointer
                ${isSelected 
                  ? "bg-[#2D3247] text-white border-[#2D3247] shadow-xl transform md:-translate-y-2" 
                  : "bg-white text-gray-900 border-gray-100 shadow-lg hover:shadow-xl hover:border-[#5E7E7D]/30"
                }
              `}
              onClick={() => handleSelect(pkg, index)}
            >
              {/* Recommended Badge */}
              {isRecommended && !isSelected && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#5E7E7D] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                  {content.recommended || (isRTL ? "موصى به" : "Recommended")}
                </span>
              )}
              {isRecommended && isSelected && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#2D3247] text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                  {content.recommended || (isRTL ? "موصى به" : "Recommended")}
                </span>
              )}

              {/* Icon Circle */}
              <div className={`
                w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors
                ${isSelected ? "bg-white/10 text-white" : "bg-[#5E7E7D]/10 text-[#5E7E7D]"}
              `}>
                {getIcon(pkg.title || pkg.type)}
              </div>

              {/* Type / Title */}
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isSelected ? "text-gray-300" : "text-[#5E7E7D]"}`}>
                {pkg.type}
              </p>
              <h3 className="text-xl font-bold mb-6 capitalize">{pkg.title}</h3>

              {/* Features List (styled to blend with light/dark modes) */}
              <ul className={`space-y-3 mb-8 w-full flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? (feature.included ? 'bg-white/20 text-white' : 'text-white/20') 
                        : (feature.included ? 'bg-[#5E7E7D]/10 text-[#5E7E7D]' : 'text-gray-200')
                    }`}>
                      {feature.included ? <Check size={16} strokeWidth={3} className="p-0.5" /> : <Circle size={16} strokeWidth={3} className="p-0.5" />}
                    </div>
                    <span className={`text-sm font-medium ${
                      isSelected 
                        ? (feature.included ? "text-gray-100" : "text-gray-400 line-through") 
                        : (feature.included ? "text-gray-800" : "text-gray-400 line-through")
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Price Block */}
              <div className="mb-6 w-full">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {pkg.price} <SaudiRiyalIcon className="inline-block" />
                  </span>
                  <span className={`text-sm font-medium opacity-80 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                    {content.perRoom || getUnitLabel(pkg.title || pkg.type)}
                  </span>
                </div>
                {pkg.oldPrice && (
                  <span className={`text-sm line-through ${isSelected ? "text-gray-400" : "text-gray-400"}`}>
                    {pkg.oldPrice}
                  </span>
                )}
              </div>

              {/* Select Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents double firing since the card is also clickable
                  handleSelect(pkg, index);
                }}
                className={`
                  w-full py-3 rounded-xl font-bold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2
                  ${isSelected 
                    ? "bg-white text-[#2D3247] shadow-md hover:bg-gray-100" 
                    : "bg-[#2D3247] text-white shadow-md hover:bg-[#1e2231]"
                  }
                `}
              >
                {isSelected ? (content.selected || "Selected") : (content.select || "Select Package")}
                {!isSelected && <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />}
                {isSelected && <Check size={16} strokeWidth={3} />}
              </button>

              {/* Tax Note (if it exists in your data) */}
              {pkg.tax && (
                <p className={`text-[10px] mt-4 font-medium ${isSelected ? "text-gray-400" : "text-emerald-600"}`}>
                  {pkg.tax}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}