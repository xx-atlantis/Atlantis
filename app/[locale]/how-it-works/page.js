"use client";

import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

import HowItWorks from "@/app/components/app/HowItWorks";
import ProjectsShowcase from "@/app/components/app/ProjectShowcase";
import WhyBestChoice from "@/app/components/app/WhyBestChoice";
import FaqSection from "@/app/components/app/FaqSection";
import LoadingScreen from "@/app/components/Loading";

export default function HowPage() {
  const { locale } = useLocale();
  const { data, loading, error } = usePageContent(); // <-- use shared content

  if (loading) return <LoadingScreen />;
  if (error) return <p className="text-center text-red-600 py-20">{error}</p>;

  const hero = data?.howitworks || {};
  const isRTL = locale === "ar";

  return (
    <div>
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="relative min-h-[30vh] md:min-h-[90vh] overflow-hidden mx-4 sm:mx-8 md:mx-16 my-6 sm:my-10 md:my-12 rounded-lg flex items-center justify-center"
      >
        {/* ===== Background Image ===== */}
        <Image
          src={hero.heroImage}
          alt="Interior design background"
          fill
          className="object-cover object-center"
          priority
        />

        {/* ===== Overlay Card ===== */}
        <div
          className={`absolute z-10 bg-white/95 shadow-2xl rounded-2xl 
              ${isRTL ? "sm:right-10 md:right-16" : "sm:left-10 md:right-16"}
              max-w-2xs md:max-w-md
              p-5 sm:p-8 md:p-10 flex flex-col justify-center 
              backdrop-blur-sm`}
        >
          <div className="flex items-center gap-2 mb-5 sm:mb-6">
            <img src="/logo.png" alt="Logo" width={45} height={45} />
            <span className="font-semibold text-gray-700 text-sm sm:text-base md:text-lg">
              {hero.brand}
            </span>
          </div>

          <span className="font-semibold text-gray-700 text-sm sm:text-base md:text-lg">
            {hero.title}
          </span>
        </div>

        <div className="absolute inset-0 bg-black/20 z-0"></div>
      </section>

      {/* ===== Sections from CMS ===== */}
      <HowItWorks />
      <WhyBestChoice />
      <ProjectsShowcase />
      <FaqSection />
    </div>
  );1
}
