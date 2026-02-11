"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { Clock, HandCoins, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WhyBestChoice() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const router = useRouter();

  const isRTL = locale === "ar";

  const why = data?.whybest || {};
  const features = why?.features || [];
  const icons = [Clock, HandCoins, UserRound];

  const handleCta = () => {
    router.push(`/${locale}/start-a-project`);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-10 sm:py-24 bg-white text-center"
    >
      {/* ===== Section Title ===== */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-10 sm:mb-16 leading-snug px-4">
        {why.title || ""}
      </h2>

      {/* ===== Feature Cards ===== */}
      <div
        className={`w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 px-4 sm:px-8 md:px-16 ${
          isRTL ? "md:direction-rtl" : ""
        }`}
      >
        {features.map((feature, index) => {
          const Icon = icons[index];
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-4 sm:space-y-5"
            >
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full text-[#5E7E7D] mb-2">
                {Icon && <Icon size={42} strokeWidth={1.5} />}
              </div>

              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-black">
                {feature.title}
              </h3>

              <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-[280px] sm:max-w-[320px] md:max-w-[360px]">
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ===== CTA Button ===== */}
      {why.cta && (
        <div className="mt-12 sm:mt-16">
          <button
            onClick={handleCta}
            className="bg-[#2D3247] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-[#1e2231] transition w-11/12 md:w-auto"
          >
            {why.cta}
          </button>
        </div>
      )}
    </section>
  );
}
