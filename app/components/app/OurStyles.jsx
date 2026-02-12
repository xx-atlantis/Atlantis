"use client";

import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useRouter } from "next/navigation";

export default function OurStyles() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const router = useRouter();

  const isRTL = locale === "ar";

  const stylesData = data?.styles || {};
  const styles = stylesData?.list || [];
  const mainTitle = stylesData?.mainTitle || {};

  const handleCta = () => {
    router.push(`/${locale}/portfolio`);
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="py-10 bg-white text-center">
      {/* ===== Heading ===== */}
      <p className="text-sm text-[#5E7E7D] font-semibold uppercase mb-2">
        {stylesData?.smallTitle || ""}
      </p>

      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 md:mb-16">
        {mainTitle?.normal || ""}{" "}
        <span className="text-[#2D3247]">{mainTitle?.highlight || ""}</span>
      </h2>

      {/* ===== Scrollable Styles Container ===== */}
      <div className="
        w-full flex overflow-x-auto snap-x snap-mandatory 
        gap-6 px-6 pb-8
        scrollbar-hide
      ">
        {styles.map((style, index) => (
          <div
            key={index}
            // Mobile: w-[85vw] | Desktop: w-[calc(33.333%-1rem)]
            className="
              relative group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition 
              snap-center shrink-0 
              w-[85vw] md:w-[calc(33.333%-1rem)]
            "
          >
            <Image
              src={style.image}
              alt={style.title}
              width={500}
              height={400}
              className="object-cover w-full h-[400px] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent group-hover:opacity-100 transition" />
            
            <div className={`absolute bottom-6 left-6 right-6 text-white ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-lg font-medium">{style.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ===== CTA Button ===== */}
      {stylesData?.cta && (
        <div className="mt-8 md:mt-12 flex justify-center">
          <button
            onClick={handleCta}
            className="cursor-pointer bg-[#2D3247] text-white px-8 py-3 rounded-lg hover:bg-[#1e2231] transition text-sm font-medium w-11/12 md:w-auto"
          >
            {stylesData.cta}
          </button>
        </div>
      )}

      {/* Quick CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}