"use client";
import React, { useRef, useState } from "react";
import { useLocale } from "@/app/components/LocaleProvider";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import { usePageContent } from "@/app/context/PageContentProvider";
import Link from "next/link";

export default function VirtualTour() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  // 1. Setup State and Ref for video control
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const content = data?.virtualtour;

  if (!content) return null;

  // 2. Fallback Logic: Use local file if CMS URL is empty
  const videoSource = content.videoUrl || "/videos/virtual-tour.mp4";

  // 3. Play/Pause Handler
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-10 px-4 sm:px-8 md:px-16 bg-white text-center"
    >
      {/* ===== Section Header ===== */}
      <p className="text-xs sm:text-sm text-[#6D9494] uppercase tracking-wide font-semibold mb-2">
        {content.smallTitle}
      </p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        {content.mainTitle}
      </h2>
      <p className="text-sm sm:text-base text-[#6D9494] max-w-2xl mx-auto mb-10">
        {content.description}
      </p>

      {/* ===== Video Section (FIXED) ===== */}
      <div 
        className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-md group cursor-pointer"
        onClick={handlePlayPause}
      >
        <video
          ref={videoRef}
          src={videoSource}
          poster={content.thumbnail}
          controls={false} // Turn off native controls so our button works best
          className="w-full h-[50vh] sm:h-[60vh] object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Play Button Overlay - Disappears when playing */}
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-500 ${
            isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <button className="text-white transform transition hover:scale-110">
            <PlayCircle size={80} className="drop-shadow-lg" />
          </button>
        </div>
      </div>

      {/* ===== Bottom Text ===== */}
      <p className="mt-10 text-xs sm:text-sm md:text-base text-[#6D9494] max-w-3xl mx-auto leading-relaxed uppercase tracking-wide">
        {content.bottomText}
      </p>

      {/* ===== Timeline Section ===== */}
      <div className="relative mt-20 max-w-6xl mx-auto">
        <div className="flex flex-col">
          {content.steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-10 ${
                index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
              }`}
            >
              {/* Step Card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 w-full sm:w-[45%] text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#6D9494] text-white flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector Dot */}
              <div className="hidden sm:flex flex-col items-center relative">
                <div className="w-6 h-6 rounded-full border-4 border-[#6D9494] z-10 flex items-center justify-center bg-white">
                  <div className="w-3 h-3 rounded-full bg-[#6D9494]"></div>
                </div>
                {index !== content.steps.length - 1 && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 h-[200px] w-1 bg-[#FECC66]"></div>
                )}
              </div>

              <div className="hidden sm:block w-[45%]" />
            </div>
          ))}
        </div>

        <div className="w-full flex justify-center mt-10">
          <Link href={`/${locale}/start-a-project`} className="bg-[#363B53] px-6 py-2.5 rounded-xl text-white hover:bg-[#2D3247] transition text-sm sm:text-base">
            {content.consultButton}
          </Link>
        </div>
      </div>

      {/* ===== Features Section ===== */}
      <div className="mt-20 max-w-6xl mx-auto">
        <p className="text-xs sm:text-sm text-[#6D9494] uppercase tracking-wide font-semibold mb-2">
          {content.features.smallTitle}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {content.features.mainTitle}
        </h2>
        <p className="text-sm sm:text-base text-[#6D9494] max-w-2xl mx-auto mb-10">
          {content.features.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.features.items.map((f, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col items-start text-left">
                <div className="mb-4 text-blue-800">
                  <Image
                    src={f.icon}
                    alt={f.title}
                    width={50}
                    height={50}
                    className="opacity-90"
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {f.title}
                </h4>
                <p className="text-sm text-gray-600">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Our Projects Section ===== */}
      <div className="mt-20 max-w-6xl mx-auto text-center">
        <p className="text-xs sm:text-sm text-[#6D9494] uppercase tracking-wide font-semibold mb-2">
          {content.projects.smallTitle}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          {content.projects.mainTitle}
        </h2>

        <div className="w-full flex justify-center mt-10">
          <Link href={`/${locale}/start-a-project`} className="bg-[#363B53] px-6 py-2.5 rounded-xl text-white hover:bg-[#2D3247] transition text-sm sm:text-base">
            {content.projects.button}
          </Link>
        </div>
      </div>
    </section>
  );
}