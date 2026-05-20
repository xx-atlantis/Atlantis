"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";

export default function ClientLogos() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [logos, setLogos] = useState([]);

  useEffect(() => {
    fetch("/api/admin/client-logos")
      .then((r) => r.json())
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) setLogos(data);
      })
      .catch(() => {});
  }, []);

  if (logos.length === 0) return null;

  // Triple the list so the marquee never shows a gap
  const track = [...logos, ...logos, ...logos];

  return (
    <section className="py-16 sm:py-20 bg-[#F5F3EF] overflow-hidden">

      {/* ── Title ── */}
      <div className="text-center mb-12 px-4">
        <h2 className="text-sm sm:text-base font-bold text-[#4A6E6D] uppercase tracking-wider mb-2">
          {isRTL ? "شركاء النجاح" : "Trusted By"}
        </h2>
        <h3 className="text-3xl md:text-4xl font-bold text-[#2D3247]">
          {isRTL ? "عملاؤنا" : "Our Clients"}
        </h3>
      </div>

      {/* ── Marquee ── */}
      <div
        className="relative"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div
          className="flex gap-6 items-stretch"
          style={{
            animation: "marquee 35s linear infinite",
            animationDirection: isRTL ? "reverse" : "normal",
            willChange: "transform",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
        >
          {track.map((logo, i) => (
            <div
              key={`${logo.id}-${i}`}
              className="flex-shrink-0 w-72 h-36 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center p-6 grayscale hover:grayscale-0 hover:shadow-md hover:border-[#6D9494]/40 transition-all duration-300 group"
            >
              <div className="relative w-full h-full">
                <Image
                  src={logo.url}
                  alt={logo.alt || "Client"}
                  fill
                  className="object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  sizes="288px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </section>
  );
}
