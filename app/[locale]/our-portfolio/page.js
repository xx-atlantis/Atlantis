"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb";

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

      {/* Gradient Overlay - Slightly darkened at the bottom for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300" />

      {/* Title - Removed md:items-center to keep text at the bottom. Added p-6 md:p-8 for better spacing. */}
      <div className="absolute inset-0 flex items-end justify-center p-6 md:p-8">
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

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">{isRTL ? "جارٍ التحميل..." : "Loading..."}</div>;
  if (error) return <div className="min-h-[60vh] flex items-center justify-center text-red-500">{isRTL ? "حدث خطأ أثناء تحميل المحتوى" : "Error loading content"}</div>;

  const portfolioData = data?.ourPortfolio;
  if (!portfolioData || !portfolioData.items?.length) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">{isRTL ? "لا توجد مشاريع متاحة" : "No portfolio data available"}</div>;
  }

  const handleClick = (item) => {
    const slugOrId = item.id || item.slug;
    router.push(`/${locale}/our-portfolio/${slugOrId}`);
  };

  /* =====================================================
     Render — uniform grid, all images same height in rows
  ===================================================== */
  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="px-4 md:px-16 py-10 lg:py-20"
    >
      <div className="mb-6">
        <Breadcrumb
          isRTL={isRTL}
          items={[
            { label: isRTL ? "الرئيسية" : "Home", href: `/${locale}` },
            { label: isRTL ? "أعمالنا" : "Portfolio" },
          ]}
        />
      </div>
      <div className="container mx-auto text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
          {portfolioData.mainTitle}
        </h2>
        <p className="mt-3 md:mt-4 text-sm md:text-lg text-gray-600">
          {portfolioData.subtitle}
        </p>
      </div>

      <div className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {portfolioData.items.map((item) => (
          <ImageCard
            key={item.id || item.slug}
            item={item}
            height="h-[220px] md:h-[280px]"
            onClick={() => handleClick(item)}
          />
        ))}
      </div>
    </section>
  );
};

export default PortfolioGrid;