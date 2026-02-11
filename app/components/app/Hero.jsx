"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function HeroSection() {
  const { locale } = useLocale();
  const { data } = usePageContent();

  console.log("Hero Section Data:", data);
  const isRTL = locale === "ar";

  const hero = data?.hero || {};

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative h-[45vh] md:h-[90vh] overflow-hidden mx-4 sm:mx-8 md:mx-20 my-6 sm:my-10 md:my-12 rounded-lg"
    >
      {/* ===== Background Image ===== */}
      <Image
        src={hero.heroImage}
        alt="Hero Background"
        fill
        className="object-cover object-center"
        priority
      />

      {/* ===== White Overlay Card ===== */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-[90%] sm:w-auto ${
          isRTL
            ? "right-4 sm:right-10 md:right-16"
            : "left-4 sm:left-10 md:left-16"
        } bg-white/95 shadow-2xl rounded-2xl p-5 sm:p-8 md:p-10 max-w-[90%] sm:max-w-md md:max-w-xl`}
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <img
            src="/logo.png"
            alt="Atlantis Logo"
            width={40}
            height={40}
            className="sm:w-[45px] md:w-[50px]"
          />
          <span className="font-semibold text-gray-700 text-sm sm:text-base md:text-lg">
            {hero.brand}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold leading-snug mb-4 sm:mb-6 text-gray-900">
          {hero.title}
        </h1>

        <Link href={`/${locale}/start-a-project`}>
          <button className="bg-[#2D3247] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm md:text-base font-medium hover:bg-[#1e2231] transition cursor-pointer">
            {hero.button}
          </button>
        </Link>
      </div>
    </section>
  );
}
