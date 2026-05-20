"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import step1Icon from "@/public/icons/step1.png";
import step2Icon from "@/public/icons/step2.png";
import step3Icon from "@/public/icons/step3.png";

/*
  Desktop layout mirrors Figma frame (1120 × 392):
    Badge 1 center: (309, 18)  → 27.6% left, 4.6% top
    Badge 2 center: (766, 83)  → 68.4% left, 21.2% top
    Badge 3 center: (375, 289) → 33.5% left, 73.7% top

  Curves are drawn dynamically from measured badge positions so they
  always connect correctly regardless of font size / container width.
*/

export default function HowItWorks() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const how = data?.howitworks || {};
  const steps = how?.steps || [];

  // Support "First part ||accent part" in CMS mainTitle for the colored split
  const rawTitle = how.mainTitle || "";
  const titleSplit = rawTitle.includes("||") ? rawTitle.split("||").map((s) => s.trim()) : null;
  const titleMain = titleSplit ? titleSplit[0] : rawTitle;
  const titleAccent = titleSplit ? titleSplit[1] : null;

  const containerRef = useRef(null);
  const badge1Ref   = useRef(null);
  const badge2Ref   = useRef(null);
  const badge3Ref   = useRef(null);
  const [svg, setSvg] = useState({ c1: "", c2: "", vw: 1120, vh: 392 });

  useEffect(() => {
    const draw = () => {
      const con = containerRef.current;
      const b1  = badge1Ref.current;
      const b2  = badge2Ref.current;
      const b3  = badge3Ref.current;
      if (!con || !b1 || !b2 || !b3) return;

      const cr = con.getBoundingClientRect();
      if (!cr.width || !cr.height) return;

      const pt = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - cr.left, y: r.top + r.height / 2 - cr.top };
      };

      const p1 = pt(b1);
      const p2 = pt(b2);
      const p3 = pt(b3);
      const vw = cr.width;
      const vh = cr.height;

      // Curve 1 — S-arch badge1 → badge2 (dips below then rises, matching Figma)
      const dx1 = p2.x - p1.x;
      const c1 = `M${p1.x},${p1.y} `
        + `C${p1.x + dx1 * 0.37},${p1.y + vh * 0.34} `
        + `${p1.x + dx1 * 0.63},${p1.y - vh * 0.22} `
        + `${p2.x},${p2.y}`;

      // Curve 2 — two-segment S-curve badge2 → badge3 (sweeps across, matching Figma)
      const dx2 = p2.x - p3.x; // positive in LTR (p2 right of p3), negative in RTL
      const dy2 = p3.y - p2.y;
      const mx  = p2.x - dx2 * 0.55;
      const my  = p2.y + dy2 * 0.45;
      const c2 = `M${p2.x},${p2.y} `
        + `C${p2.x - dx2 * 0.04},${p2.y + dy2 * 0.22} `
        + `${p2.x - dx2 * 0.42},${p2.y + dy2 * 0.60} `
        + `${mx},${my} `
        + `C${p3.x + dx2 * 0.15},${p2.y + dy2 * 0.02} `
        + `${p3.x - dx2 * 0.10},${p3.y + dy2 * 0.08} `
        + `${p3.x},${p3.y}`;

      setSvg({ c1, c2, vw, vh });
    };

    draw();
    const ro = new ResizeObserver(draw);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [steps]);

  const dash = {
    stroke: "#C5CDD6",
    strokeWidth: "2",
    strokeDasharray: "14 9",
    strokeLinecap: "round",
    fill: "none",
  };

  // Figma positions as % of 1120 × 392 container
  // isRTL mirrors left↔right using `right` instead of `left`
  const pos = (ltrLeft, top) =>
    isRTL ? { right: ltrLeft, top } : { left: ltrLeft, top };

  const s0 = steps[0];
  const s1 = steps[1];
  const s2 = steps[2];

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-12 sm:py-24 bg-white overflow-hidden"
    >
      {/* ── Title ── */}
      <div className="text-center mb-12 sm:mb-16 px-4">
        <p className="text-sm sm:text-base text-[#6D9494] font-semibold tracking-widest uppercase mb-3">
          {how.smallTitle}
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-snug max-w-2xl mx-auto">
          {titleMain}
          {titleAccent && (
            <>
              {" "}
              <span style={{ color: "#363b53" }}>{titleAccent}</span>
            </>
          )}
        </h2>
      </div>

      {/* ── Mobile: stacked ── */}
      <div className="md:hidden flex flex-col gap-10 max-w-lg mx-auto px-6">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6D9494] text-white flex items-center justify-center font-bold text-lg">
              {i + 1}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1.5">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: Figma absolute layout ── */}
      <div className="hidden md:block w-full max-w-[1120px] mx-auto px-6">
        <div
          ref={containerRef}
          className="relative w-full"
          style={{ aspectRatio: "1120 / 392" }}
        >
          {/* Dynamic dashed curves */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${svg.vw} ${svg.vh}`}
            fill="none"
            aria-hidden="true"
          >
            {svg.c1 && <path d={svg.c1} {...dash} />}
            {svg.c2 && <path d={svg.c2} {...dash} />}
          </svg>

          {/* ── Step 1 — top-left (LTR) / top-right (RTL) ── */}
          {/* Figma: card starts at 3.75% left, badge centre at 27.6% */}
          <div className="absolute flex items-start gap-3" style={pos("3.75%", "1.26%")}>
            <Image
              src={step1Icon}
              alt=""
              width={28}
              height={28}
              className="shrink-0 mt-1"
            />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-xl text-gray-900 whitespace-nowrap">
                  {s0?.title}
                </h3>
                <div
                  ref={badge1Ref}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6D9494] text-white flex items-center justify-center font-bold text-lg shadow-sm"
                >
                  1
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed" style={{ maxWidth: 273 }}>
                {s0?.desc}
              </p>
            </div>
          </div>

          {/* ── Step 2 — top-right (LTR) / top-left (RTL) ── */}
          {/* Figma: badge left edge at 66.6%, top 16.16% */}
          <div className="absolute flex items-start gap-3" style={pos("66.6%", "16.16%")}>
            <div
              ref={badge2Ref}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6D9494] text-white flex items-center justify-center font-bold text-lg shadow-sm"
            >
              2
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-xl text-gray-900 whitespace-nowrap">
                  {s1?.title}
                </h3>
                <Image src={step2Icon} alt="" width={24} height={24} className="shrink-0" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed" style={{ maxWidth: 299 }}>
                {s1?.desc}
              </p>
            </div>
          </div>

          {/* ── Step 3 — bottom-center ── */}
          {/* Figma: badge left edge at 31.67%, top 68.7% */}
          <div className="absolute flex items-start gap-3" style={pos("31.67%", "68.7%")}>
            <div
              ref={badge3Ref}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6D9494] text-white flex items-center justify-center font-bold text-lg shadow-sm"
            >
              3
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-xl text-gray-900 whitespace-nowrap">
                  {s2?.title}
                </h3>
                <Image src={step3Icon} alt="" width={24} height={24} className="shrink-0" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed" style={{ maxWidth: 439 }}>
                {s2?.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
