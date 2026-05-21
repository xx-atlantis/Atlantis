"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";

export default function WhatWeDeliver() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/deliver-gallery")
      .then((r) => r.json())
      .then(({ data }) => { if (data) setData(data); })
      .catch(() => {});
  }, []);

  if (!data || data.images.length === 0) return null;

  const heading = isRTL ? data.headingAr : data.headingEn;
  const subheading = isRTL ? data.subheadingAr : data.subheadingEn;

  return (
    <section className="py-16 sm:py-20 bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-10">

        {/* Title */}
        <div className="text-center mb-12">
          <p className="text-xs sm:text-sm font-bold text-[#4A6E6D] uppercase tracking-wider mb-2">
            {isRTL ? "معرض أعمالنا" : "Our Work"}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2D3247] mb-3">{heading}</h2>
          {subheading && (
            <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">{subheading}</p>
          )}
        </div>

        {/* Masonry-style grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {data.images.map((img, i) => (
            <div
              key={img.id}
              className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm border border-gray-100 group relative"
            >
              <div className="relative w-full" style={{ paddingBottom: i % 3 === 1 ? "75%" : "66.66%" }}>
                <Image
                  src={img.url}
                  alt={img.alt || heading}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {img.alt && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">{img.alt}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
