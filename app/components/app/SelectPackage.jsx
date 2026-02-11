"use client";
import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function PackagesSection({ onSelectPackage }) {
  const { locale } = useLocale();
  const { data } = usePageContent();

  const isRTL = locale === "ar";
  const [selected, setSelected] = useState(null);

  const content = data.packages;
  const packages = content.list;

  const handleSelect = (pkg, index) => {
    const newSelected = selected === index ? null : index;
    setSelected(newSelected);

    if (newSelected === null) {
      onSelectPackage(null);
    } else {
      onSelectPackage(pkg);
    }
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-12">
        {content.heading}
      </h2>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg, index) => {
          const isRecommended = pkg.recommended;
          const isSelected = selected === index;

          return (
            <div
              key={index}
              className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm border min-h-[480px] transition-transform hover:scale-[1.02] ${
                isRecommended
                  ? "border-yellow-100 shadow-md bg-[#6D94941A]"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              {isRecommended && (
                <span className="absolute top-0 right-0 bg-yellow-400 text-gray-800 text-[11px] sm:text-xs font-medium px-3 py-1 rounded-t-lg rounded-bl-lg">
                  {content.recommended}
                </span>
              )}

              <h3 className="text-lg sm:text-xl font-semibold text-[#5E7E7D] mb-6">
                {pkg.title}
              </h3>

              <ul className="space-y-3 text-left mb-6 flex-1">
                {pkg.features.map((feature, i) => (
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

              <div className="mt-auto flex flex-col items-center">
                <div className="mb-4">
                  <p className="text-[#5E7E7D] font-semibold text-base sm:text-lg">
                    <span className="text-xl sm:text-2xl font-bold text-[#2D3247]">
                      {pkg.price}
                    </span>{" "}
                    {content.perRoom}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm line-through mt-1">
                    {pkg.oldPrice}
                  </p>
                </div>

                <button
                  onClick={() => handleSelect(pkg, index)}
                  className={`w-1/2 rounded-lg text-sm font-medium px-6 py-2 transition ${
                    isSelected
                      ? "bg-[#2D3247] text-white cursor-default"
                      : "bg-gray-200 hover:bg-[#2D3247] hover:text-white text-gray-800"
                  }`}
                >
                  {isSelected ? content.selected : content.select}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
