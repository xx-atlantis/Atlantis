"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, MapPin } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";

const reviewsData = [
  {
    name: "Ashwaq Bander",
    location: "Riyadh, Saudi Arabia",
    title: "The Best Design Experience in KSA",
    text: "Atlantis is the best interior design company I have worked with in Saudi Arabia. Their designs are innovative, prices are excellent, and choosing them was absolutely the right decision. Ms. Baraa, Ms. Reema, and Mr. Ahmed were outstanding. I am very grateful for this experience and hope to collaborate again.",
  },
  {
    name: "Nouf Al-Johaini",
    location: "Jeddah, Saudi Arabia",
    title: "Creative, Smooth, and Budget-Friendly",
    text: "Atlantis exceeded my expectations. Their creative ideas and budget-friendly approach made everything smooth from the start. Engineer Reema, Engineer Ahmed, and Engineer Omnia were very cooperative. I loved the result and definitely plan to work with them again.",
  },
  {
    name: "Amal Alahmari",
    location: "Riyadh, Saudi Arabia",
    title: "Amazing Experience with Atlantis",
    text: "My experience with Atlantis was amazing. Their designs are refined and very affordable. Special thanks to Engineer Reema, Engineer Abdullah, and Ms. Noor for all their efforts. The team’s professionalism and attention to every detail was clear. I look forward to working with them on future projects.",
  },
  {
    name: "Fahad Alkhalifa",
    location: "Riyadh, Saudi Arabia",
    title: "Elegant Designs, Beyond Expectations",
    text: "From start to finish, working with Atlantis was excellent. Their interior designs are elegant, prices are reasonable, and everything went seamlessly. The final result was beyond my expectations.",
  },
  {
    name: "Khalid AlAhmary",
    location: "Riyadh, Saudi Arabia",
    title: "Atlantis – My First Choice for Design",
    text: "My experience with Atlantis was outstanding in every aspect. They were committed to deadlines, flexible with feedback, and delivered high-quality designs. Their prices are among the most competitive in the market — sometimes up to ten times lower for the same space compared to others. I also value their transparent pricing system based on square meters, which ensures full clarity.",
  },
  {
    name: "Abdullah Khalid",
    location: "Jeddah, Saudi Arabia",
    title: "Enjoyable Experience with Atlantis",
    text: "I would like to thank the company for the outstanding services they provided. Their professionalism and commitment were impressive. It was a great experience, and I highly recommend dealing with them.",
  },
];

export default function CustomerReviews() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === reviewsData.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviewsData.length - 1 : prev - 1));
  };

  return (
    <section 
      dir={isRTL ? "rtl" : "ltr"} 
      className="py-16 bg-gray-50 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Section Header */}
        <h2 className="text-sm font-bold text-[#5E7E7D] uppercase tracking-wider mb-2">
          {isRTL ? "آراء العملاء" : "Testimonials"}
        </h2>
        <h3 className="text-3xl md:text-4xl font-bold text-[#2D3247] mb-12">
          {isRTL ? "ماذا يقول عملاؤنا" : "What Our Clients Say"}
        </h3>

        {/* Carousel Container */}
        <div 
          className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 min-h-[350px] flex flex-col justify-center items-center transition-all"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Decorative Quote Icon */}
          <div className="absolute top-6 left-8 opacity-10">
            <Quote size={60} className="text-[#2D3247] transform -scale-x-100" />
          </div>

          {/* Review Content */}
          <div className="relative z-10 w-full animate-fadeIn">
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>

            {/* Title */}
            <h4 className="text-xl md:text-2xl font-bold text-[#2D3247] mb-4">
              {reviewsData[currentIndex].title}
            </h4>

            {/* Text */}
            <p className="text-gray-600 text-base md:text-lg leading-relaxed italic mb-8 max-w-2xl mx-auto">
              "{reviewsData[currentIndex].text}"
            </p>

            {/* Divider */}
            <div className="w-16 h-1 bg-[#5E7E7D] mx-auto rounded-full mb-6"></div>

            {/* Reviewer Info */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-gray-900 text-lg">
                {reviewsData[currentIndex].name}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin size={14} />
                <span>{reviewsData[currentIndex].location}</span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons (Absolute) */}
          <button
            onClick={prevSlide}
            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-[#2D3247] hover:text-white transition shadow-sm ${
                isRTL ? "-right-4 md:-right-6" : "-left-4 md:-left-6"
            }`}
            aria-label="Previous Review"
          >
            {isRTL ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>

          <button
            onClick={nextSlide}
            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-[#2D3247] hover:text-white transition shadow-sm ${
                isRTL ? "-left-4 md:-left-6" : "-right-4 md:-right-6"
            }`}
            aria-label="Next Review"
          >
            {isRTL ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

        {/* Dots Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {reviewsData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? "w-8 bg-[#2D3247]" 
                  : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}