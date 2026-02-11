"use client";

import { useState } from "react";
import { Check, Circle, ShieldCheck } from "lucide-react";
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
   * 1. FILTERING LOGIC
   * Filters the list based on the projectType passed from localStorage
   */
  const filteredPackages = content.list.filter((pkg) => {
    if (!projectType) return true; 
    return pkg.type?.toLowerCase() === projectType.toLowerCase();
  });

  /**
   * 2. DYNAMIC GRID LOGIC
   * Adjusts column counts and max-width to ensure 1 or 2 cards stay centered 
   * and don't stretch awkwardly.
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

  if (filteredPackages.length === 0) {
    return (
      <div className="py-20 text-gray-400 font-medium italic">
        {isRTL 
          ? "لا توجد باقات متاحة لهذا النوع من المشاريع حالياً." 
          : "No packages available for this project type at the moment."}
      </div>
    );
  }

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="text-center">
      {/* Header & Guarantee Section */}
      <div className="max-w-3xl mx-auto mb-6">
        <h2 className="text-3xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
          {content.mainTitle?.normal}{" "}
          <span className="text-[#5E7E7D]">{content.mainTitle?.highlight}</span>
        </h2>
        
        {content.refundHeading && (
          <div className="mt-4 inline-flex items-center gap-3 bg-amber-50/80 border border-amber-100 px-6 py-3 rounded-2xl">
            <ShieldCheck size={20} className="text-amber-600" />
            <p className="text-sm text-amber-900">
              <span className="font-bold">{content.refundHeading}:</span> {content.refundText}
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Grid Container */}
      <div className={`w-full mx-auto grid gap-8 justify-center items-stretch ${gridConfig}`}>
        {filteredPackages.map((pkg, index) => {
          const isRecommended = pkg.recommended;
          const isSelected = selected === index;

          return (
            <div
              key={index}
              className={`relative rounded-[2.5rem] p-8 flex flex-col shadow-sm border transition-all duration-500 ${
                isRecommended
                  ? "border-[#5E7E7D] bg-white ring-8 ring-[#5E7E7D]/5 scale-[1.02] z-10"
                  : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200"
              } ${isSelected ? "ring-2 ring-[#2D3247] border-[#2D3247]" : ""}`}
            >
              {isRecommended && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#5E7E7D] text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">
                  {content.recommended || (isRTL ? "موصى به" : "Recommended")}
                </span>
              )}

              {/* Package Identification */}
              <div className="mb-8">
                <div className="inline-block px-3 py-1 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  {pkg.type}
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase">
                  {pkg.title}
                </h3>
              </div>

              {/* Features List */}
              <ul className={`space-y-4 mb-10 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    {feature.included ? (
                      <div className="bg-[#2D3247] rounded-full p-1 shrink-0 mt-0.5 shadow-sm">
                        <Check size={12} className="text-white" />
                      </div>
                    ) : (
                      <Circle size={20} className="text-gray-200 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-xs leading-relaxed font-medium ${feature.included ? "text-gray-700" : "text-gray-300"}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Pricing & CTA */}
              <div className="border-t border-gray-100">
                <div className="mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-[1000] tracking-tighter text-[#2D3247]">
                      {pkg.price}
                    </span>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                      {content.perRoom}
                    </span>
                  </div>
                  {pkg.oldPrice && (
                    <p className="text-gray-300 text-sm line-through decoration-red-400/30 mt-1">
                      {pkg.oldPrice}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSelect(pkg, index)}
                  className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all active:scale-95 ${
                    isSelected
                      ? "bg-[#2D3247] text-white shadow-xl shadow-black/20"
                      : "bg-white hover:bg-[#2D3247] hover:text-white border-2 border-gray-100 hover:border-[#2D3247] hover:shadow-lg"
                  }`}
                >
                  {isSelected ? (content.selected || "Selected") : (content.select || "Select Package")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}