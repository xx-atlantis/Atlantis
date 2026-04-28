"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image"; // 1. IMPORT NEXT IMAGE
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
// 2. ONLY IMPORT THE SLIDER (Remove ReactCompareSliderImage)
import { ReactCompareSlider } from "react-compare-slider";
import { Star } from "lucide-react";


export default function ProjectsShowcase() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const [activeTab, setActiveTab] = useState(0);
  const [cardHeight, setCardHeight] = useState("auto");

  const sliderRef = useRef(null);
  const reviewRef = useRef(null);

  const projectsData = data?.projects || {};
  const projects = projectsData?.list || [];
  const activeProject = projects[activeTab] || null;

  const beforeLabel = isRTL ? "قبل" : "Before";
  const afterLabel = isRTL ? "بعد" : "After";

  // Keep slider & review same height on desktop.
  // Uses ResizeObserver to avoid forced reflow (reading offsetHeight after style changes).
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCardHeight("auto");
      return;
    }

    let sliderH = 0;
    let reviewH = 0;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (entry.target === sliderRef.current) sliderH = h;
        if (entry.target === reviewRef.current) reviewH = h;
      }
      setCardHeight(`${Math.max(sliderH, reviewH)}px`);
    });

    if (sliderRef.current) observer.observe(sliderRef.current);
    if (reviewRef.current) observer.observe(reviewRef.current);

    return () => observer.disconnect();
  }, [activeTab]);

  if (!activeProject) return null;

  // Only use avatar if explicitly set in CMS data; otherwise show placeholder
  const avatarSrc = activeProject.review.avatar || null;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-10 md:py-24 bg-white text-center relative"
    >
      {/* ===== Titles ===== */}
      <p className="text-sm sm:text-base text-[#4A6E6D] font-semibold uppercase mb-2">
        {projectsData?.smallTitle || ""}
      </p>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-10 sm:mb-12 leading-snug">
        {projectsData?.mainTitle?.normal || ""}{" "}
        <span className="text-[#2D3247]">
          {projectsData?.mainTitle?.highlight || ""}
        </span>
      </h2>

      {/* ===== Tabs ===== */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 px-4">
        {projects.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 sm:px-5 py-2 rounded-full border text-sm sm:text-base transition ${
              idx === activeTab
                ? "bg-[#2D3247] text-white border-[#2D3247]"
                : "border-gray-300 text-gray-700 hover:border-[#2D3247]"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* ===== Content ===== */}
      <div
        className={`mx-auto w-full max-w-7xl px-4 sm:px-8 my-10 flex flex-col md:flex-row items-center justify-between gap-10 ${
          isRTL ? "md:flex-row-reverse" : ""
        }`}
        style={{ minHeight: cardHeight }}
      >
        {/* ===== SAFARI-SAFE Compare Slider ===== */}
        <div
          ref={sliderRef}
          className="flex-1 w-full rounded-2xl overflow-hidden shadow-lg"
          style={{ maxHeight: "420px" }}
        >
          <ReactCompareSlider
            position={50}
            itemOne={
              <Image
                src={activeProject.before}
                alt={beforeLabel}
                width={728}
                height={420}
                sizes="(max-width: 768px) 100vw, 48vw"
                className="w-full object-cover"
                style={{ height: "420px" }}
              />
            }
            itemTwo={
              <Image
                src={activeProject.after}
                alt={afterLabel}
                width={728}
                height={420}
                sizes="(max-width: 768px) 100vw, 48vw"
                className="w-full object-cover"
                style={{ height: "420px" }}
              />
            }
            style={{ width: "100%", height: "420px" }}
          />
        </div>

        {/* ===== Review Card ===== */}
        <div
          ref={reviewRef}
          className={`flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md flex flex-col justify-between ${isRTL ? "text-right" : "text-left"}`}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* 4. OPTIMIZED AVATAR IMAGE */}
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={activeProject.review.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#2D3247] text-white flex items-center justify-center text-lg font-bold select-none">
                  {activeProject.review.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}

              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {activeProject.review.name}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {activeProject.review.location}
                </p>
                <div className="flex text-yellow-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-sm sm:text-base leading-relaxed tracking-wide">
              {activeProject.review.text}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Pagination Dots ===== */}
      <div className="flex justify-center gap-1 mt-6 sm:mt-8">
        {projects.map((project, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            aria-label={`Show project: ${project.title}`}
            className="p-2 flex items-center justify-center"
          >
            <span className={`block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition ${
              idx === activeTab
                ? "bg-[#5E7E7D] scale-110"
                : "bg-gray-300 hover:bg-gray-400"
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
}