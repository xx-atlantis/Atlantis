"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";

// Renders one bento block of up to 5 images in a 3-col grid
function BentoBlock({ group, heading }) {
  const cells = [
    // [colSpan, rowSpan, sizes hint]
    [2, 2, "(max-width:640px) 100vw, 66vw"],   // 0 — large
    [1, 1, "(max-width:640px) 100vw, 33vw"],   // 1 — small top-right
    [1, 1, "(max-width:640px) 100vw, 33vw"],   // 2 — small bottom-right
    [1, 1, "(max-width:640px) 100vw, 33vw"],   // 3 — small bottom-left
    [2, 1, "(max-width:640px) 100vw, 66vw"],   // 4 — wide bottom-right
  ];

  return (
    <div
      className="grid grid-cols-3 gap-3 sm:gap-4"
      style={{ gridTemplateRows: "220px 220px 220px" }}
    >
      {group.map((img, i) => {
        const [cs, rs, sizes] = cells[i] || [1, 1, "33vw"];
        return (
          <div
            key={img.id}
            className="relative rounded-2xl overflow-hidden group shadow-sm"
            style={{ gridColumn: `span ${cs}`, gridRow: `span ${rs}` }}
          >
            <Image
              src={img.url}
              alt={img.alt || heading}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes={sizes}
            />
            {/* dark gradient + caption on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              {img.alt && (
                <p className="text-white text-sm font-medium leading-snug">{img.alt}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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

  if (loading || !data || data.images.length === 0) return null;

  const heading    = isRTL ? data.headingAr    : data.headingEn;
  const subheading = isRTL ? data.subheadingAr : data.subheadingEn;

  // Split into bento blocks of 5
  const blocks = [];
  for (let i = 0; i < data.images.length; i += 5) {
    blocks.push(data.images.slice(i, i + 5));
  }

  return (
    <section className="py-16 sm:py-20 bg-[#F5F3EF]" dir={isRTL ? "rtl" : "ltr"}>
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

        {/* Bento blocks */}
        <div className="space-y-4">
          {blocks.map((group, i) => (
            <BentoBlock key={i} group={group} heading={heading} />
          ))}
        </div>

      </div>
    </section>
  );
}
