"use client";
import React, { useState, useMemo } from "react";
import { SlidersHorizontal, LayoutGrid } from "lucide-react";
import { SidebarFilters } from "./SidebarFilter";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ShopSkeleton } from "../ShopSkeleton";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCountryCurrency } from "@/app/context/CountryCurrencyContext";

export const ShopPage = ({ products, onProductClick, loading, error, content }) => {
  const { locale } = useLocale();
  const { country } = useCountryCurrency();
  const isRTL = locale === "ar";

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    minPrice: 0,
    maxPrice: 50000,
    material: [],
    color: [],
    inStock: false,
    sort: "newest",
  });

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.category.length > 0)
      result = result.filter((p) => p.category?.en && filters.category.includes(p.category.en));

    result = result.filter((p) => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    if (filters.material.length > 0)
      result = result.filter((p) => p.material && filters.material.includes(p.material));

    if (filters.color.length > 0)
      result = result.filter((p) => p.color && filters.color.includes(p.color));

    if (filters.inStock) result = result.filter((p) => p.inStock === true);

    switch (filters.sort) {
      case "price-low-high": result.sort((a, b) => a.price - b.price); break;
      case "price-high-low": result.sort((a, b) => b.price - a.price); break;
    }

    return result;
  }, [products, filters]);

  if (loading) return <ShopSkeleton />;
  if (!content) return <div className="text-center py-20 text-red-500 font-semibold">CMS content missing</div>;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="w-full bg-white min-h-screen">

      {/* ── Shop Hero Banner ── */}
      <div className="bg-[#F5F3EF] border-b border-gray-100 px-4 sm:px-8 md:px-10 py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
            {isRTL ? "متجرنا" : "Our Store"}
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2D3247] leading-tight max-w-xl">
            {content.pageTitle}
          </h1>
          {content.pageSubtitle && (
            <p className="mt-3 text-gray-500 text-base max-w-lg">{content.pageSubtitle}</p>
          )}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <LayoutGrid size={14} />
            <span>{filteredProducts.length} {isRTL ? "منتج" : "products"}</span>
            {country && (
              <>
                <span>·</span>
                <span>{country.flag} {country.currency}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-10 py-8">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden gap-2 text-sm border-gray-200"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={14} />
            {content.mobile?.openFilters || (isRTL ? "الفلاتر" : "Filters")}
          </Button>

          <div className="flex items-center gap-3 ms-auto">
            <span className="text-sm text-gray-400 hidden sm:inline">
              {isRTL ? "ترتيب حسب" : "Sort by"}
            </span>
            <select
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2D3247]/30 cursor-pointer"
              value={filters.sort}
              onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
            >
              <option value="newest">{content.sorting?.options?.newest || (isRTL ? "الأحدث" : "Newest")}</option>
              <option value="price-low-high">{content.sorting?.options?.priceLowHigh || (isRTL ? "السعر: منخفض إلى مرتفع" : "Price: Low to High")}</option>
              <option value="price-high-low">{content.sorting?.options?.priceHighLow || (isRTL ? "السعر: مرتفع إلى منخفض" : "Price: High to Low")}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <SidebarFilters
            content={content.filters}
            filters={filters}
            setFilters={setFilters}
            isMobileOpen={isMobileFiltersOpen}
            closeMobile={() => setIsMobileFiltersOpen(false)}
          />

          {/* Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-[#F5F3EF]/40">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <LayoutGrid size={24} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {content.emptyState?.title || (isRTL ? "لا توجد منتجات" : "No products found")}
                </h3>
                <p className="text-gray-400 mt-1 mb-6 max-w-sm text-sm">
                  {content.emptyState?.description || (isRTL ? "حاول تعديل الفلاتر" : "Try adjusting your filters")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ category: [], minPrice: 0, maxPrice: 50000, material: [], color: [], inStock: false, sort: "newest" })}
                >
                  {content.emptyState?.clearFiltersBtn || (isRTL ? "مسح الفلاتر" : "Clear Filters")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onClick={onProductClick} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
