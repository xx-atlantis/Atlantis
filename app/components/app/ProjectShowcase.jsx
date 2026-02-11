"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { Star } from "lucide-react";

// Fallback map in case JSON data is missing the avatar field
const FALLBACK_AVATARS = {
  "Ashwaq Bander": "/avatars/ashwaq-bander.webp",
  "Nouf Al-Johaini": "/avatars/nouf-al-johaini.webp",
  "Amal Alahmari": "/avatars/amal-alahmari.webp",
  "Osama Bukhari": "/avatars/osama-bukhari.webp",
};

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

  // Keep slider & review same height on desktop
  useEffect(() => {
    const resizeHandler = () => {
      if (window.innerWidth < 768) {
        setCardHeight("auto");
        return;
      }

      if (sliderRef.current && reviewRef.current) {
        setCardHeight(
          `${Math.max(
            sliderRef.current.offsetHeight,
            reviewRef.current.offsetHeight
          )}px`
        );
      }
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [activeTab]);

  if (!activeProject) return null;

  // Determine the avatar source:
  // 1. Try the JSON data
  // 2. If missing, try the FALLBACK_AVATARS map
  const avatarSrc =
    activeProject.review.avatar || FALLBACK_AVATARS[activeProject.review.name];

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-10 md:py-24 bg-white text-center relative"
    >
      {/* ===== Titles ===== */}
      <p className="text-sm text-[#5E7E7D] font-semibold uppercase mb-2">
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
                ? "bg-[#5E7E7D] text-white border-[#5E7E7D]"
                : "border-gray-300 text-gray-700 hover:border-[#5E7E7D]"
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
        >
          <ReactCompareSlider
            position={50}
            itemOne={
              <ReactCompareSliderImage
                src={activeProject.before}
                alt={beforeLabel}
              />
            }
            itemTwo={
              <ReactCompareSliderImage
                src={activeProject.after}
                alt={afterLabel}
              />
            }
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* ===== Review Card ===== */}
        <div
          ref={reviewRef}
          className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md text-left flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* --- AVATAR LOGIC --- */}
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={activeProject.review.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200" />
              )}

              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {activeProject.review.name}
                </h4>
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
      <div className="flex justify-center gap-2 mt-6 sm:mt-8">
        {projects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition ${
              idx === activeTab
                ? "bg-[#5E7E7D] scale-110"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}