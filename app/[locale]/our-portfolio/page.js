"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";

/* =====================================================
   Reusable Image Card with Hover Overlay
===================================================== */
const ImageCard = ({ item, onClick, height }) => {
  // Grab the first 3 words for mobile view and add ellipsis if needed
  const titleWords = item.title ? item.title.split(" ") : [];
  const mobileTitle = titleWords.length > 3 
    ? titleWords.slice(0, 3).join(" ") + "..." 
    : item.title;

  return (
    <div
      className={`relative group cursor-pointer rounded-xl overflow-hidden shadow-lg ${height}`}
      onClick={onClick}
    >
      <Image
        src={item.cover}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300" />

      {/* Title */}
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-4">
        {/* OPTIMIZED: text-base on mobile, text-xl on desktop. Adjusted font weight for better mobile readability */}
        <p className="text-white text-base font-medium md:text-xl md:font-semibold text-center transform md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
          {/* Truncated title shown ONLY on mobile (hidden on medium screens and up) */}
          <span className="md:hidden">{mobileTitle}</span>
          
          {/* Full title shown ONLY on desktop (hidden on mobile, inline on medium screens and up) */}
          <span className="hidden md:inline">{item.title}</span>
        </p>
      </div>
    </div>
  );
};

const PortfolioGrid = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const { data, loading, error } = usePageContent();

  const isRTL = locale === "ar";

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading content</div>;

  const portfolioData = data?.ourPortfolio;
  if (!portfolioData || !portfolioData.items?.length) {
    return <div>No portfolio data available</div>;
  }

  /* =====================================================
     Utilities
  ===================================================== */
  const chunkItems = (items, size = 5) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  };

  const handleClick = (item) => {
    const slugOrId = item.id || item.slug;
    router.push(`/${locale}/our-portfolio/${slugOrId}`);
  };

  const sections = chunkItems(portfolioData.items);

  /* =====================================================
     Row Renderer (1 → 5 images)
  ===================================================== */
  const renderRow = (items, reverse) => {
    const count = items.length;

    // 🔹 1 IMAGE
    if (count === 1) {
      return (
        <ImageCard
          item={items[0]}
          height="h-[300px] md:h-[420px]" // OPTIMIZED: responsive height
          onClick={() => handleClick(items[0])}
        />
      );
    }

    // 🔹 2 IMAGES
    if (count === 2) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"> {/* OPTIMIZED: responsive gap */}
          {items.map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              height="h-[250px] md:h-[320px]" // OPTIMIZED: responsive height
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      );
    }

    // 🔹 3–5 IMAGES
    return (
      <div
        className={`flex flex-col md:flex-row gap-4 md:gap-6 ${ // OPTIMIZED: responsive gap
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Big Image */}
        <div className="w-full md:w-1/2">
          <ImageCard
            item={items[0]}
            height="h-[300px] md:h-[420px]" // OPTIMIZED: responsive height
            onClick={() => handleClick(items[0])}
          />
        </div>

        {/* Small Images */}
        <div
          className={`w-full md:w-1/2 grid gap-4 md:gap-6 ${ // OPTIMIZED: responsive gap
            count === 3 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {items.slice(1).map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              height="h-[180px] md:h-[200px]" // OPTIMIZED: responsive height
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      </div>
    );
  };

  /* =====================================================
     Render
  ===================================================== */
  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="px-4 md:px-16 py-10 lg:py-20"
    >
      <div className="container mx-auto text-center">
        {/* OPTIMIZED: Main titles scaled down on mobile */}
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
          {portfolioData.mainTitle}
        </h2>
        <p className="mt-3 md:mt-4 text-sm md:text-lg text-gray-600">
          {portfolioData.subtitle}
        </p>
      </div>

      {sections.map((section, index) => (
        <div key={index} className="mt-10 md:mt-14"> {/* OPTIMIZED: responsive top margin */}
          {renderRow(section, index % 2 === 1)}
        </div>
      ))}
    </section>
  );
};

export default PortfolioGrid;