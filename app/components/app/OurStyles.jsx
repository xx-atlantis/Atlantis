"use client";

import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function OurStyles() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const router = useRouter();

  const isRTL = locale === "ar";
  const stylesData = data?.styles?.[locale] || data?.styles || {};
  const styles = stylesData?.list || [];
  const mainTitle = stylesData?.mainTitle || {};

  const handleCta = () => {
    router.push(`/${locale}/portfolio`);
  };

  const totalItems = styles.length;

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* ===== Heading ===== */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[10px] tracking-[0.4em] text-[#4A6E6D] font-black uppercase mb-3">
            {stylesData?.smallTitle || ""}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            {mainTitle?.normal || ""}{" "}
            <span className="text-[#2D3247]">{mainTitle?.highlight || ""}</span>
          </h2>
        </div>

        {/* ===== Dynamic Layout Container ===== */}
        <div 
          className={cn(
            "flex flex-wrap justify-center gap-4 md:gap-6",
            // For 3 or 5 items, we constrain the total container width to prevent giant cards
            (totalItems === 3 || totalItems === 5) && "max-w-7xl mx-auto"
          )}
        >
          {styles.map((style, index) => {
            // Logic for "3 on top, 2 centered"
            const isLastTwoOfFive = totalItems === 5 && index >= 3;
            
            return (
              <div
                key={index}
                className={cn(
                  "relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700",
                  "w-full sm:w-[calc(50%-8px)]", 
                  // Size logic for Desktop
                  totalItems <= 4 
                    ? "lg:w-[calc(25%-18px)] max-w-[300px]" // Smaller footprint for 1-4 items
                    : "lg:w-[calc(33.333%-16px)] max-w-[360px]", // Standard size for 5+
                  isLastTwoOfFive && "lg:w-[calc(33.333%-16px)]"
                )}
              >
                {/* Modern Aspect Ratio - 4:5 is cleaner for interiors */}
                <div className="aspect-[4/5] relative">
                  <Image
                    src={style.image}
                    alt={style.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Text Content */}
                  <div className={cn(
                    "absolute bottom-0 w-full p-6 text-white transition-all duration-500",
                    isRTL ? "text-right" : "text-left"
                  )}>
                    <h3 className="text-lg font-semibold tracking-wide drop-shadow-md">
                      {style.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== CTA Button ===== */}
        {stylesData?.cta && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={handleCta}
              className="bg-[#2D3247] text-white px-10 py-3.5 rounded-lg transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 text-xs font-bold tracking-widest uppercase"
            >
              {stylesData.cta}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}