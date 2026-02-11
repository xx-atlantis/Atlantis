"use client";
import React from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { SlidersHorizontal } from "lucide-react";
import { usePageContent } from "@/app/context/PageContentProvider";
import Link from "next/link";

export default function OurProjects() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const content = data?.ourprojects; // 🔥 CMS block
  if (!content) return null; // prevents undefined UI crash

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="bg-white">
      {/* ===== Hero Banner ===== */}
      <div className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden mt-10 sm:mt-16">
        <div className="relative h-[300px] sm:h-[400px] md:h-[550px]">
          <Image
            src={content?.hero?.image}
            alt="Portfolio Hero"
            fill
            className="object-cover object-center brightness-[0.55]"
            priority
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-3 font-semibold">
              {content?.hero?.title}
            </h2>
            <p className="text-sm sm:text-lg max-w-xl mb-5 text-gray-100">
              {content?.hero?.description}
            </p>
            <button className="bg-primary-btn hover:bg-blue-900 transition text-white px-6 py-2.5 rounded-lg text-sm sm:text-base font-medium">
              {content?.hero?.button}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Category Section ===== */}
      <div className="text-center py-12 sm:py-16 px-4 sm:px-8">
        <p className="text-xs sm:text-sm text-primary-theme uppercase tracking-wide font-semibold mb-2">
          {content?.section?.smallTitle}
        </p>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          {content?.section?.mainTitle}
        </h3>

        {/* ===== Portfolio Grid ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {content?.items?.map((item, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-72 sm:h-80 w-full">
                <Image
                  src={item?.image}
                  alt={item?.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
              </div>
              <div className="absolute bottom-3 left-0 right-0 text-center text-white">
                <p className="text-sm sm:text-base font-medium">
                  {item?.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== All Projects Section ===== */}
      <div className="text-center py-10 sm:py-16 px-4 sm:px-8 border-t border-gray-100">
        <p className="text-xs sm:text-sm text-primary-theme uppercase tracking-wide font-semibold mb-2">
          {content?.allprojects?.smallTitle}
        </p>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          {content?.allprojects?.mainTitle}
        </h3>

        {/* ===== Header Row ===== */}
        {/* <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
          <h4 className="text-sm sm:text-base font-bold text-gray-800">
            {content?.allprojects?.filterLabel}
          </h4>
          <button className="flex items-center gap-2 text-gray-800 text-sm sm:text-base border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-100 transition">
            <SlidersHorizontal size={16} />
            {content?.allprojects?.filterButton}
          </button>
        </div> */}

        {/* ===== Projects Grid ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {content?.allprojects?.projects?.map((proj, index) => (
            <Link
            href={`/${locale}/${proj?.link}`}
              key={index}
              className="bg-white border border-gray-200 rounded-4xl transition overflow-hidden p-2"
            >
              <div className="relative h-48 sm:h-56 md:h-60 rounded-4xl ">
                <Image
                  src={proj?.image}
                  alt={proj?.title}
                  fill
                  className="object-cover rounded-4xl "
                />
              </div>

              <div className="p-4 text-left">
                
                <h4 className="text-base sm:text-lg font-semibold text-primary-theme mb-2">
                  {proj?.title}
                </h4>
                <p className="text-sm text-gray-800 mb-1">
                  {proj?.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
