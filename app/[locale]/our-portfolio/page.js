"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";

/* =====================================================
   Reusable Image Card with Hover Overlay
===================================================== */
const ImageCard = ({ item, onClick, height }) => {
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
        <p className="text-white text-lg md:text-xl font-semibold text-center transform md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
          {item.title}
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

  // ✅ USE SLUG (preferred), fallback to id
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
          height="h-[420px]"
          onClick={() => handleClick(items[0])}
        />
      );
    }

    // 🔹 2 IMAGES
    if (count === 2) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              height="h-[320px]"
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      );
    }

    // 🔹 3–5 IMAGES
    return (
      <div
        className={`flex flex-col md:flex-row gap-6 ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Big Image */}
        <div className="w-full md:w-1/2">
          <ImageCard
            item={items[0]}
            height="h-[420px]"
            onClick={() => handleClick(items[0])}
          />
        </div>

        {/* Small Images */}
        <div
          className={`w-full md:w-1/2 grid gap-6 ${
            count === 3 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {items.slice(1).map((item) => (
            <ImageCard
              key={item.id}
              item={item}
              height="h-[200px]"
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
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          {portfolioData.mainTitle}
        </h2>
        <p className="mt-4 text-base md:text-lg text-gray-600">
          {portfolioData.subtitle}
        </p>
      </div>

      {sections.map((section, index) => (
        <div key={index} className="mt-14">
          {renderRow(section, index % 2 === 1)}
        </div>
      ))}
    </section>
  );
};

export default PortfolioGrid;
