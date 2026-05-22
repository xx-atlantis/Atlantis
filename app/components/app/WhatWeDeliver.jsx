"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";

export default function WhatWeDeliver() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/deliver-gallery")
      .then((r) => r.json())
      .then(({ data }) => { if (data) setData(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Don't render at all while loading or if no content configured
  if (loading || !data) return null;
  // Hide section entirely if no images have been added yet
  if (data.images.length === 0) return null;

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

        {/* Gallery grid — uniform cards, image contained (no cropping) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.images.map((img) => (
            <div
              key={img.id}
              className="group relative bg-[#F5F3EF] rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{ aspectRatio: "4/3" }}
            >
              <Image
                src={img.url}
                alt={img.alt || heading}
                fill
                className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {img.alt && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs font-medium truncate">{img.alt}</p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
