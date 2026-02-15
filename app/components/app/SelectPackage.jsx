"use client";

import { useState } from "react";
import { Check, Circle, ShieldCheck, ArrowRight, Building2, Home, Armchair, SaudiRiyalIcon, CheckCircle2 } from "lucide-react";
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
    if (t.includes('room') || t.includes('غرفة')) return <Armchair size={24} />;
    if (t.includes('apartment') || t.includes('شقة')) return <Building2 size={24} />;
    return <Home size={24} />;
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
    <section dir={isRTL ? "rtl" : "ltr"} className="relative">
      
      {/* ===== Header & Guarantee Section ===== */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          {content.mainTitle?.normal}{" "}
          <span className="text-primary-theme">{content.mainTitle?.highlight}</span>
        </h2>
        
        {content.refundHeading && (
          <div className="inline-flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
             <ShieldCheck className="w-4 h-4 text-green-500" />
            <p className="text-sm font-bold text-gray-500">
              {content.refundHeading} — {content.refundText}
            </p>
          </div>
        )}
      </div>

      {/* ===== Packages Grid ===== */}
      <div className={`w-full mx-auto grid gap-8 items-center ${gridConfig}`}>
        {filteredPackages.map((pkg, index) => {
          const isSelected = selected === index;
          const isRecommended = pkg.recommended;

          return (
            <div 
              key={index}
              className={`
                relative flex flex-col h-full transition-all duration-500 group cursor-pointer
                ${isSelected 
                  ? "bg-[#2D3247] text-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-[#2D3247] transform md:-translate-y-4 z-10" 
                  : "bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-primary-theme"
                }
              `}
              onClick={() => handleSelect(pkg, index)}
            >
              {/* Recommended Badge */}
              {isRecommended && !isSelected && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-theme text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  {content.recommended || (isRTL ? "موصى به" : "Recommended")}
                </span>
              )}
              {isRecommended && isSelected && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#2D3247] text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  {content.recommended || (isRTL ? "موصى به" : "Recommended")}
                </span>
              )}

              {/* Icon & Label */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`
                  p-3 rounded-2xl transition-colors
                  ${isSelected 
                    ? "bg-white/10 text-white" 
                    : "bg-gray-50 group-hover:bg-primary-theme/10 text-gray-400 group-hover:text-primary-theme"
                  }
                `}>
                  {getIcon(pkg.title || pkg.type)}
                </div>
                <p className={`text-xs font-bold uppercase tracking-widest ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                   {pkg.type}
                </p>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold capitalize mb-8">{pkg.title}</h3>

              {/* Features List */}
              <ul className={`space-y-4 mb-10 w-full flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="relative shrink-0 flex items-start mt-0.5">
                      {feature.included ? (
                        <CheckCircle2 
                           size={20} 
                           className={isSelected ? "text-white bg-white/20 rounded-full border-none" : "text-green-500 bg-white rounded-full"} 
                        />
                      ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
                          <Check size={12} className={isSelected ? "text-white/30" : "text-gray-300"} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className={`text-sm font-medium leading-snug ${
                      isSelected 
                        ? (feature.included ? "text-gray-100" : "text-gray-400 line-through") 
                        : (feature.included ? "text-[#1D1D1F]" : "text-gray-400 line-through")
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Spacer */}
              <div className="flex-grow"></div>

              {/* Price Block */}
              <div className="flex justify-between items-end mb-8 w-full">
                <div className="flex flex-col text-left">
                  <span className={`text-sm font-bold uppercase tracking-tighter mb-1 ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                    {isRTL ? "الإجمالي" : "Total"}
                  </span>
                  <span className={`text-sm font-bold ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                    {content.perRoom || getUnitLabel(pkg.title || pkg.type)}
                  </span>
                </div>
                
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <p className={`text-5xl font-[1000] tracking-tighter leading-none ${isSelected ? "text-white" : "text-primary-theme"}`}>
                      {pkg.price}
                    </p>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mr-1 ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                      <SaudiRiyalIcon className="w-4 h-4 inline-block mb-1" />
                    </span>
                  </div>
                  {pkg.oldPrice && (
                    <span className={`text-sm line-through mt-1 font-medium ${isSelected ? "text-gray-400" : "text-gray-400"}`}>
                      {pkg.oldPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleSelect(pkg, index);
                }}
                className={`
                  group/btn w-full py-5 rounded-[1.5rem] font-bold text-lg transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 shadow-xl
                  ${isSelected 
                    ? "bg-white text-[#2D3247] shadow-gray-900/20 hover:bg-gray-100" 
                    : "bg-[#2D3247] text-white hover:bg-primary-theme shadow-gray-200/50 hover:shadow-primary-theme/20"
                  }
                `}
              >
                <span>{isSelected ? (content.selected || "Selected") : (content.select || "Select Package")}</span>
                {!isSelected && <ArrowRight size={22} className={`transition-transform duration-300 group-hover/btn:translate-x-1 ${isRTL ? "rotate-180" : ""}`} />}
                {isSelected && <Check size={22} strokeWidth={3} className="text-green-500" />}
              </button>

              {/* Tax Note */}
              {pkg.tax && (
                <div className={`mt-6 pt-5 w-full flex justify-center border-t ${isSelected ? "border-white/10" : "border-gray-50"}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-gray-400" : "text-gray-400"}`}>
                    {pkg.tax}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}