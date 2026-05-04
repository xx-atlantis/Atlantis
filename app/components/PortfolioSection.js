"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale } from "@/app/components/LocaleProvider";

// Dummy Data mimicking the layout in your screenshots
const projects = [
  {
    id: 1,
    title: { en: "Modern Living Room", ar: "غرفة معيشة عصرية" },
    category: { en: "Modern Living Room", ar: "غرفة المعيشة العصرية" },
    image: "/portfolio/1.jpg",
    size: "large",
    productsCount: 12,
  },
  {
    id: 2,
    title: { en: "Serene Bedroom", ar: "غرفة نوم هادئة" },
    category: { en: "Serene Bedroom", ar: "غرفة النوم الهادئة" },
    image: "/portfolio/2.jpg",
    size: "tall",
    productsCount: 8,
  },
  {
    id: 3,
    title: { en: "Contemporary Majlis", ar: "مجلس عربي معاصر" },
    category: { en: "Contemporary Majlis", ar: "المجلس العربي المعاصر" },
    image: "/portfolio/3.jpg",
    size: "normal",
    productsCount: 5,
  },
  {
    id: 4,
    title: { en: "Coffee Corner", ar: "ركن القهوة" },
    category: { en: "Coffee Corner", ar: "ركن القهوة" },
    image: "/portfolio/4.jpg",
    size: "normal",
    productsCount: 3,
  },
  {
    id: 5,
    type: "promo",
    title: { en: "Design Gift", ar: "هدية التصميم" },
    discount: "50% OFF",
    code: "GIVE2025",
    desc: { en: "Give the gift of great design this season", ar: "امنح هدية التصميم الرائع هذا الموسم" },
    size: "normal",
  },
  {
    id: 6,
    title: { en: "Luxury Dining", ar: "غرفة طعام فاخرة" },
    category: { en: "Luxury Dining", ar: "غرفة الطعام الفاخرة" },
    image: "/portfolio/5.jpg",
    size: "wide",
    productsCount: 24,
  },
  {
    id: 7,
    title: { en: "Villa Entrance", ar: "مدخل الفيلا" },
    category: { en: "Villa Entrance", ar: "مدخل الفيلا" },
    image: "/portfolio/6.jpg",
    size: "normal",
    productsCount: 4,
  },
];

export default function PortfolioSection() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <section className="py-16 bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-serif text-[#2D3247] mb-2">
              {isRTL ? "معرض أعمالنا" : "Our Portfolio"}
            </h2>
            <p className="text-gray-500 max-w-xl">
              {isRTL 
                ? "اكتشف أحدث مشاريع التصميم الداخلي التي قمنا بتنفيذها في جميع أنحاء المملكة."
                : "Explore our latest interior design projects executed across the Kingdom."}
            </p>
          </div>
          <Link 
            href={`/${locale}/portfolio`}
            className="hidden md:inline-flex items-center text-[#5E7E7D] font-medium hover:underline"
          >
            {isRTL ? "شاهد كل المشاريع" : "View All Projects"}
            <span className={`text-xl ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}>→</span>
          </Link>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[280px]">
          
          {projects.map((item) => (
            <PortfolioCard key={item.id} item={item} isRTL={isRTL} />
          ))}

        </div>
        
        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link 
            href={`/${locale}/portfolio`}
            className="inline-block px-6 py-3 bg-gray-100 text-[#2D3247] font-medium rounded-md hover:bg-gray-200 transition"
          >
            {isRTL ? "شاهد كل المشاريع" : "View All Projects"}
          </Link>
        </div>

      </div>
    </section>
  );
}

// ------------------------------------
// Individual Card Component
// ------------------------------------
function PortfolioCard({ item, isRTL }) {
  // Determine Grid Spans based on "size" prop
  const sizeClasses = {
    normal: "col-span-1 row-span-1",
    wide:   "col-span-1 md:col-span-2 row-span-1",
    tall:   "col-span-1 row-span-2",
    large:  "col-span-1 md:col-span-2 row-span-2",
  };

  const spanClass = sizeClasses[item.size] || sizeClasses.normal;

  const lang = isRTL ? "ar" : "en";

  // -------------------------
  // Render Promo Card (The Blue Box)
  // -------------------------
  if (item.type === "promo") {
    return (
      <div className={`relative bg-[#2D3247] text-white p-6 flex flex-col justify-center items-center text-center rounded-sm overflow-hidden group ${spanClass}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]"></div> {/* Gold Top Border */}

        <div className="mb-4">
            <span className="inline-block p-2 bg-white/10 rounded-full">
                🎁
            </span>
        </div>
        <h3 className="text-sm uppercase tracking-widest text-[#D4AF37] font-semibold mb-1">
            {item.title?.[lang] ?? item.title}
        </h3>
        <div className="text-4xl font-bold mb-2 font-serif">{item.discount}</div>
        <div className="text-xs text-gray-300 mb-4">{item.desc?.[lang] ?? item.desc}</div>
        
        <div className="bg-white/10 px-4 py-2 rounded border border-white/20 text-sm tracking-wider font-mono">
           CODE: <span className="text-white font-bold">{item.code}</span>
        </div>
      </div>
    );
  }

  // -------------------------
  // Render Project Image Card
  // -------------------------
  return (
    <div className={`relative group overflow-hidden rounded-sm bg-gray-100 ${spanClass}`}>
      {/* Background Image */}
      <Image
        src={item.image}
        alt={item.title?.[lang] ?? item.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Dark Gradient Overlay (Always visible at bottom for text readability) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        
        {/* Top Badges (Optional: "New", "Trending") */}
        <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-2 group-hover:translate-y-0">
             <span className="bg-white/90 text-[#2D3247] text-[10px] font-bold px-2 py-1 uppercase tracking-wide rounded-sm backdrop-blur-sm">
                {isRTL ? "مشروع جديد" : "New Project"}
             </span>
        </div>

        {/* Bottom Text */}
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white text-lg font-bold leading-tight mb-0.5">
            {item.title?.[lang] ?? item.title}
          </h3>
          <p className="text-gray-300 text-xs mb-3 font-light">
            {item.category?.[lang] ?? item.category}
          </p>
          
          <div className="flex items-center justify-between border-t border-white/20 pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="text-xs text-white font-medium">
               {item.productsCount} {isRTL ? "منتج مستخدم" : "Products"}
             </span>
             
             {/* Bookmark Icon Button */}
             <button className="h-8 w-8 rounded-full bg-white text-[#2D3247] flex items-center justify-center hover:bg-[#5E7E7D] hover:text-white transition-colors shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}