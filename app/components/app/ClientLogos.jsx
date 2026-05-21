"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";

const DURATION = 20; // seconds for one full loop

export default function ClientLogos() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [logos, setLogos] = useState([]);
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, baseX: 0 });

  useEffect(() => {
    fetch("/api/admin/client-logos")
      .then((r) => r.json())
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) setLogos(data);
      })
      .catch(() => {});
  }, []);

  if (logos.length === 0) return null;

  const track = [...logos, ...logos, ...logos];

  const startAnim = (fromX) => {
    const el = trackRef.current;
    if (!el) return;
    const trackWidth = el.scrollWidth / 3;
    // Clamp to [-trackWidth, 0]
    let x = fromX % trackWidth;
    if (x > 0) x -= trackWidth;
    const progress = -x / trackWidth; // 0..1
    const delay = -progress * DURATION;

    el.style.transition = "none";
    el.style.transform = "";
    el.style.animation = `marquee ${DURATION}s linear ${delay}s infinite`;
    el.style.animationDirection = isRTL ? "reverse" : "normal";
  };

  const pauseAnim = () => {
    const el = trackRef.current;
    if (!el) return;
    const matrix = new DOMMatrix(window.getComputedStyle(el).transform);
    const currentX = matrix.m41;
    el.style.animation = "none";
    el.style.transform = `translateX(${currentX}px)`;
    return currentX;
  };

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    const currentX = pauseAnim();
    drag.current = { active: true, startX: e.clientX, baseX: currentX };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    el.style.transform = `translateX(${drag.current.baseX + dx}px)`;
  };

  const onPointerUp = (e) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = trackRef.current;
    if (!el) return;
    const matrix = new DOMMatrix(window.getComputedStyle(el).transform);
    startAnim(matrix.m41);
  };

  return (
    <section className="py-16 sm:py-20 bg-[#F5F3EF] overflow-hidden">

      {/* Title */}
      <div className="text-center mb-12 px-4">
        <h2 className="text-sm sm:text-base font-bold text-[#4A6E6D] uppercase tracking-wider mb-2">
          {isRTL ? "شركاء النجاح" : "Trusted By"}
        </h2>
        <h3 className="text-3xl md:text-4xl font-bold text-[#2D3247]">
          {isRTL ? "عملاؤنا" : "Our Clients"}
        </h3>
      </div>

      {/* Marquee */}
      <div
        className="relative"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div
          ref={trackRef}
          className="flex gap-6 items-stretch cursor-grab active:cursor-grabbing select-none"
          style={{
            animation: `marquee ${DURATION}s linear infinite`,
            animationDirection: isRTL ? "reverse" : "normal",
            willChange: "transform",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {track.map((logo, i) => (
            <div
              key={`${logo.id}-${i}`}
              className="flex-shrink-0 w-96 h-48 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center p-4 grayscale hover:grayscale-0 hover:shadow-md hover:border-[#6D9494]/40 transition-all duration-300 group"
            >
              <div className="relative w-full h-full">
                <Image
                  src={logo.url}
                  alt={logo.alt || "Client"}
                  fill
                  draggable={false}
                  className="object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  sizes="384px"
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
