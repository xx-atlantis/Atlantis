"use client";

import React from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { Award, Users, UserRoundCog, Ungroup, Lightbulb } from "lucide-react";

export default function AboutUs() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const content = data?.aboutus;

  if (!content) return null; // Wait for provider to load

  const IconMap = {
    "/award": Award,
    "/users": Users,
    "/UserRoundCog": UserRoundCog,
    "/Ungroup": Ungroup,
    "/Lightbulb": Lightbulb,
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-14 sm:py-20 px-4 sm:px-8 md:px-16 bg-white"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12 sm:gap-16">
        {/* ===== Top Section Hero Card ===== */}
        <div className="relative flex flex-col-reverse sm:flex-row items-center justify-end gap-12">
          <div className="relative w-full sm:w-[75%] h-[380px] sm:h-[480px] md:h-[550px] rounded-2xl overflow-hidden">
            <Image
              src={content?.hero?.image}
              alt="About Atlantis"
              fill
              className="object-cover object-center brightness-70"
              priority
            />
          </div>

          <div
            className={`sm:absolute ${
              isRTL ? "sm:right-0" : "sm:left-0"
            } sm:top-1/2 sm:-translate-y-1/2 bg-white border border-gray-100 shadow-lg rounded-2xl p-6 sm:p-8 max-w-md w-full sm:w-[600px]`}
          >
            <div className="flex items-center gap-2 mb-4">
              <img
                src={content?.hero?.logo}
                alt="Logo"
                width={24}
                height={24}
                className="rounded-sm"
              />
              <span className="font-semibold text-gray-700 text-sm sm:text-base">
                {content?.hero?.brand}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 leading-snug">
              {content?.hero?.title}
            </h2>
            <button className="bg-[#2D3247] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e2231] transition text-sm sm:text-base font-medium">
              {content?.hero?.button}
            </button>
          </div>
        </div>

        {/* ===== Section 2 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 sm:gap-12">
          <div className="relative w-full h-[280px] sm:h-[350px] md:h-[420px] rounded-2xl overflow-hidden">
            <Image
              src={content?.section?.image}
              alt={content?.section?.title}
              fill
              className="object-cover object-center"
            />
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-3 sm:mb-4">
              {content?.section?.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 max-w-lg">
              {content?.section?.description}
            </p>
            <button className="bg-[#2D3247] text-white px-5 py-2.5 rounded-lg hover:bg-[#1e2231] transition text-sm sm:text-base font-medium">
              {content?.section?.button}
            </button>
          </div>
        </div>

        <div className="text-center mt-10 sm:mt-14">
          <p className="text-xs sm:text-sm text-[#6D9494] uppercase tracking-wide font-semibold mb-2">
            {content?.values?.smallTitle}
          </p>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
            {content?.values?.mainTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {content?.values?.items?.map((val, i) => {
              const Icon = IconMap[val.icon] || Lightbulb;

              // Perfect staggered (honeycomb) layout
              let position = "";

              if (i === 0) position = "lg:col-start-1 lg:col-span-2";
              if (i === 1) position = "lg:col-start-3 lg:col-span-2";
              if (i === 2) position = "lg:col-start-5 lg:col-span-2";

              if (i === 3) position = "lg:col-start-2 lg:col-span-2";
              if (i === 4) position = "lg:col-start-4 lg:col-span-2";

              return (
                <div
                  key={i}
                  className={`bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition p-6 text-left ${position}`}
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-4 text-[#5E7E7D]">
                    <Icon className="w-10 h-10" />
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {val.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== SERVICES ===== */}
        <div className="text-center mt-14 sm:mt-16">
          <p className="text-xs sm:text-sm text-[#6D9494] uppercase tracking-wide font-semibold mb-2">
            {content?.services?.smallTitle}
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
            {content?.services?.mainTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#6D9494] max-w-2xl mx-auto mb-8">
            {content?.services?.subtitle}
          </p>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full mx-auto">
            {content?.services?.items?.map((srv, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col"
              >
                <div className="relative w-full h-48 sm:h-52 md:h-56">
                  <Image
                    src={srv.image}
                    alt={srv.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4 sm:p-5 text-left">
                  <span className="inline-block text-[11px] sm:text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 mb-2">
                    {srv.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {srv.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
