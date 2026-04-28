"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { PlayCircle } from "lucide-react";
import { useRef, useState } from "react";

export default function HowToGetStarted() {
  const { locale } = useLocale();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isRTL = locale === "ar";
  const videoSrc = isRTL ? "/final-arabic.mp4" : "/final-english-ver.mp4";

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full max-w-4xl mx-auto px-4 sm:px-8 md:px-16 py-6 sm:py-10 flex flex-col justify-center items-center bg-white text-center"
    >
      {/* ===== Heading ===== */}
      <h2 className="w-full md:w-xl text-2xl md:text-3xl text-center font-bold text-gray-900 mb-16">
        {isRTL ? "كيف تبدأ مع أتلانتس للتصميم والديكور" : "How to Get Started With Atlantis"}
      </h2>

      {/* ===== Styles Grid ===== */}
      <div className="max-w-3xl mx-auto">
        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-md group">
          
          <video
            ref={videoRef}
            id="homeVideo"
            src={videoSrc}
            controls
            preload="none"
            className="w-full h-[80vh] object-cover bg-black"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Only show the overlay button if video is NOT playing */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition z-10">
              <button
                onClick={handlePlayClick}
                className="text-white transform transition hover:scale-110"
                aria-label="Play video"
              >
                <PlayCircle
                  size={80}
                  className="opacity-90 hover:opacity-100 transition"
                />
              </button>
            </div>
          )}
          
        </div>
      </div>
    </section>
  );
}