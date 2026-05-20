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

  // Duplicate the list so the marquee loops seamlessly
  const track = [...logos, ...logos];

  return (
    <section className="py-12 bg-white border-y border-gray-100 overflow-hidden">
      <div className="text-center mb-8 px-4">
        <p className="text-sm text-[#6D9494] font-semibold tracking-widest uppercase">
          {isRTL ? "عملاؤنا" : "Our Clients"}
        </p>
      </div>

      {/* Marquee wrapper — overflow hidden on section, inner div scrolls */}
      <div
        className="relative flex"
        style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
      >
        <div
          className="flex gap-12 items-center"
          style={{
            animation: `marquee 30s linear infinite`,
            animationDirection: isRTL ? "reverse" : "normal",
            willChange: "transform",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
        >
          {track.map((logo, i) => (
            <div
              key={`${logo.id}-${i}`}
              className="flex-shrink-0 h-20 w-48 relative grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <Image
                src={logo.url}
                alt={logo.alt || "Client"}
                fill
                className="object-contain"
                sizes="192px"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
