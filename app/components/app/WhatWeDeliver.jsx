"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";

function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const img = images[index];

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tabular-nums">
        {index + 1} / {images.length}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
      >
        <X size={22} />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Image */}
      <div
        className="relative w-full max-w-5xl max-h-[80vh] mx-16 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.url}
          alt={img.alt || ""}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl select-none"
          draggable={false}
        />
        {img.alt && (
          <div className="absolute bottom-0 inset-x-0 text-center pb-4">
            <span className="inline-block bg-black/60 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
              {img.alt}
            </span>
          </div>
        )}
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Dot strip */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); /* jump handled via index prop */ }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? "bg-white w-4" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WhatWeDeliver() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState(null); // null = closed, number = open index

  useEffect(() => {
    fetch("/api/admin/deliver-gallery")
      .then((r) => r.json())
      .then(({ data }) => { if (data) setData(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const open  = (i) => setActive(i);
  const close = useCallback(() => setActive(null), []);
  const prev  = useCallback(() => setActive((i) => (i - 1 + data.images.length) % data.images.length), [data]);
  const next  = useCallback(() => setActive((i) => (i + 1) % data.images.length), [data]);

  if (loading || !data || data.images.length === 0) return null;

  const heading    = isRTL ? data.headingAr    : data.headingEn;
  const subheading = isRTL ? data.subheadingAr : data.subheadingEn;

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

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {data.images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => open(i)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#6D9494]/50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D3247]"
              style={{ aspectRatio: "4/3" }}
            >
              <Image
                src={img.url}
                alt={img.alt || heading}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#2D3247]/0 group-hover:bg-[#2D3247]/30 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2.5 shadow-lg">
                  <ZoomIn size={18} className="text-[#2D3247]" />
                </div>
              </div>
              {/* Caption bar */}
              {img.alt && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs font-medium truncate">{img.alt}</p>
                </div>
              )}
            </button>
          ))}
        </div>

      </div>

      {/* Lightbox */}
      {active !== null && (
        <Lightbox
          images={data.images}
          index={active}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </section>
  );
}
