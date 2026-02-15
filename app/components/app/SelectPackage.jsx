"use client";

import { useState } from "react";
import { Check, Circle, Building2, Home, Hotel, SaudiRiyal, ChevronRight, ArrowRight } from "lucide-react";
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

  // Icon mapping for package types
  const getPackageIcon = (type) => {
    const iconMap = {
      room: Hotel,
      apartment: Building2,
      villa: Home,
    };
    const IconComponent = iconMap[type?.toLowerCase()] || Building2;
    return IconComponent;
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

  // Get all features from filtered packages (combining all packages' features)
  const allFeatures = filteredPackages.reduce((acc, pkg) => {
    pkg.features.forEach(feature => {
      if (!acc.find(f => f.text === feature.text)) {
        acc.push(feature);
      }
    });
    return acc;
  }, []);

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="text-center">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
          {content.sectionLabel || "OUR PLANS"}
        </p>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
          {content.mainTitle?.normal}{" "}
          <span className="text-[#5E7E7D]">{content.mainTitle?.highlight}</span>
        </h2>
      </div>

      {/* Packages Grid */}
      <div className={`w-full mx-auto grid gap-6 justify-center items-stretch ${gridConfig}`}>
        {filteredPackages.map((pkg, index) => {
          const isRecommended = pkg.recommended;
          const isSelected = selected === index;
          const PackageIcon = getPackageIcon(pkg.type);

          return (
            <div
              key={index}
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 ${
                isRecommended
                  ? "bg-[#2D3247] text-white scale-105 shadow-2xl z-10"
                  : "bg-[#2D3247] text-white shadow-lg hover:shadow-xl"
              } ${isSelected ? "ring-4 ring-[#5E7E7D]" : ""}`}
            >
              {/* Icon */}
              <div className={`mx-auto mb-6 p-4 rounded-2xl ${
                isRecommended ? "bg-white/10" : "bg-white/10"
              }`}>
                <PackageIcon size={32} className={isRecommended ? "text-white" : "text-white"} />
              </div>

              {/* Package Title */}
              <h3 className={`text-2xl font-bold mb-2 ${
                isRecommended ? "text-white" : "text-white"
              }`}>
                {pkg.title}
              </h3>

              {/* Subtitle */}
              <p className={`text-sm mb-8 ${
                isRecommended ? "text-white/70" : "text-white/70"
              }`}>
                {pkg.subtitle || `${pkg.area || "..."}`}
              </p>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-4xl font-black tracking-tighter ${
                    isRecommended ? "text-white" : "text-white"
                  }`}>
                    {pkg.price} <SaudiRiyal size={20} className="inline-block items-center" />
                  </span>
                  <span className={`text-sm font-medium ${
                    isRecommended ? "text-white/60" : "text-white/60"
                  }`}>
                    / {pkg.type || "Room"}
                  </span>
                </div>
                {pkg.oldPrice && (
                  <p className={`text-sm line-through mt-2 ${
                    isRecommended ? "text-white/40" : "text-white/40"
                  }`}>
                    ({pkg.oldPrice}) <SaudiRiyal size={20} className="inline-block items-center" />
                  </p>
                )}
              </div>

              {/* CTA Button - Original Select/Selected Logic */}
              <button
                onClick={() => handleSelect(pkg, index)}
                className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-[0.15em] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isSelected
                    ? isRecommended 
                      ? "bg-white text-[#2D3247]"
                      : "bg-white text-[#2D3247] shadow-xl shadow-black/20"
                    : isRecommended
                      ? "bg-white text-[#2D3247] hover:bg-gray-100"
                      : "bg-white text-[#2D3247] hover:bg-gray-100 hover:text-[#2D3247] border-2 border-gray-100 hover:border-[#2D3247] hover:shadow-lg"
                }`}
              >
                {isSelected ? (content.selected || "Selected") : (content.select || "Select Package")}
                {!isRecommended && <span className=""><ArrowRight size={16} className="text-[#2D3247]" /></span>}
              </button>

              {/* VAT Notice */}
              <p className={`text-xs mt-4 ${
                isRecommended ? "text-white/60" : "text-white/60"
              }`}>
                {content.vatNotice}
              </p>
            </div>
          );
        })}
      </div>

      {/* All Packages Include Section - Features from filtered packages */}
      {allFeatures.length > 0 && (
        <div className="bg-gray-50 mt-4 rounded-3xl max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h3 className="text-3xl font-bold text-gray-900">
                {content.allPackagesTitle?
                  content.allPackagesTitle
                  : isRTL 
                    ? "تتضمن الحزمة" 
                    : "Package Include"}
              </h3>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {content.allPackagesSubtitle?
                content.allPackagesSubtitle
                : isRTL 
                  ? "نقدم نفس الجودة العالية والاهتمام بالتفاصيل لجميع أنواع الوحدات" 
                  : "We provide the same high quality and attention to detail for all unit types"}
            </p>
          </div>

          {/* Features Grid */}
          <div className={`bg-gray-100 rounded-2xl shadown-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isRTL ? "text-right" : "text-left"}`}>
            {allFeatures.map((feature, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl ${
                feature.included ? "" : "opacity-50"
              }`}>
                <div className={`rounded-full p-1 shrink-0 mt-1 ${
                  feature.included 
                    ? "bg-gray-300" 
                    : "bg-gray-200"
                }`}>
                  {feature.included ? (
                    <Check size={14} className="text-black" />
                  ) : (
                    <Circle size={14} className="text-gray-400" />
                  )}
                </div>
                <p className={`text-sm leading-relaxed font-medium ${
                  feature.included ? "text-gray-700" : "text-gray-400"
                }`}>
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}