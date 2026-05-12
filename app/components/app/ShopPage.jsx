"use client";

import React, { useState, useMemo, useRef } from "react";
import { SlidersHorizontal, ChevronDown, X, Check, LayoutGrid } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ShopSkeleton } from "../ShopSkeleton";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCountryCurrency } from "@/app/context/CountryCurrencyContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/* ── Advanced filters sheet (price, material, color, stock) ── */
function FiltersSheet({ open, onClose, filters, setFilters, products, isRTL }) {
  const locale = useLocale().locale;

  const materials = useMemo(() => {
    const s = new Set();
    products.forEach((p) => { if (p.material) s.add(p.material); });
    return [...s];
  }, [products]);

  const colors = useMemo(() => {
    const s = new Set();
    products.forEach((p) => { if (p.color) s.add(p.color); });
    return [...s];
  }, [products]);

  const toggle = (key, val) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter((x) => x !== val) : [...prev[key], val],
    }));

  const activeCount =
    filters.material.length +
    filters.color.length +
    (filters.inStock ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 50000 ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side={isRTL ? "right" : "left"} className="w-[320px] sm:w-[380px] overflow-y-auto p-0">
        <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b bg-white">
            <h2 className="font-bold text-gray-900 text-base">
              {isRTL ? "تصفية" : "Filters"}
              {activeCount > 0 && (
                <span className="ms-2 bg-[#2D3247] text-white text-xs rounded-full px-2 py-0.5">{activeCount}</span>
              )}
            </h2>
            {activeCount > 0 && (
              <button
                onClick={() => setFilters((p) => ({ ...p, material: [], color: [], inStock: false, minPrice: 0, maxPrice: 50000 }))}
                className="text-xs text-[#2D3247] underline font-medium"
              >
                {isRTL ? "مسح الكل" : "Clear all"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-[#F8F6F2]">
            {/* Price Range */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                {isRTL ? "نطاق السعر" : "Price Range"}
              </p>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((p) => ({ ...p, minPrice: Number(e.target.value) }))}
                  className="h-10 bg-white text-center text-sm"
                  placeholder="Min"
                />
                <span className="text-gray-400 shrink-0">—</span>
                <Input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
                  className="h-10 bg-white text-center text-sm"
                  placeholder="Max"
                />
              </div>
            </div>

            <Separator />

            {/* Material */}
            {materials.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  {isRTL ? "المادة" : "Material"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {materials.map((m) => {
                    const sel = filters.material.includes(m);
                    return (
                      <button
                        key={m}
                        onClick={() => toggle("material", m)}
                        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition ${
                          sel ? "bg-[#2D3247] text-white border-[#2D3247]" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {sel && <Check size={11} />}
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color */}
            {colors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  {isRTL ? "اللون" : "Color"}
                </p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => {
                    const sel = filters.color.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggle("color", c)}
                        title={c}
                        className={`w-8 h-8 rounded-full border-2 transition ${sel ? "border-[#2D3247] scale-110" : "border-transparent hover:border-gray-300"}`}
                        style={{ backgroundColor: c.toLowerCase() }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* In Stock */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {isRTL ? "متوفر فقط" : "In Stock Only"}
              </p>
              <button
                onClick={() => setFilters((p) => ({ ...p, inStock: !p.inStock }))}
                className={`w-11 h-6 rounded-full relative transition-colors ${filters.inStock ? "bg-[#2D3247]" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 start-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.inStock ? "translate-x-5 rtl:-translate-x-5" : ""}`} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-white">
            <button
              onClick={onClose}
              className="w-full bg-[#2D3247] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1e2231] transition"
            >
              {isRTL ? "عرض النتائج" : "Show Results"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Main ShopPage ─────────────────────────────────────── */
export const ShopPage = ({ products, onProductClick, loading, error, content }) => {
  const { locale } = useLocale();
  const { country, formatPrice } = useCountryCurrency();
  const isRTL = locale === "ar";
  const filterBarRef = useRef(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filters, setFilters] = useState({
    material: [],
    color: [],
    inStock: false,
    minPrice: 0,
    maxPrice: 50000,
    sort: "newest",
  });

  /* Derive categories from actual products */
  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.category?.en) map.set(p.category.en, p.category[locale] || p.category.en);
    });
    return Array.from(map.entries()).map(([en, label]) => ({ en, label }));
  }, [products, locale]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "all")
      result = result.filter((p) => p.category?.en === activeCategory);

    result = result.filter((p) => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    if (filters.material.length)
      result = result.filter((p) => p.material && filters.material.includes(p.material));

    if (filters.color.length)
      result = result.filter((p) => p.color && filters.color.includes(p.color));

    if (filters.inStock) result = result.filter((p) => p.inStock === true);

    if (filters.sort === "price-low-high") result.sort((a, b) => a.price - b.price);
    else if (filters.sort === "price-high-low") result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, activeCategory, filters]);

  const advancedActiveCount =
    filters.material.length + filters.color.length + (filters.inStock ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 50000 ? 1 : 0);

  if (loading) return <ShopSkeleton />;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#F8F6F2]">

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2D3247 0%, #3d4560 50%, #2a3855 100%)",
          minHeight: "340px",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -end-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-0 start-1/3 w-64 h-64 rounded-full bg-white/3" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 md:px-14 py-16 md:py-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4">
              {isRTL ? "متجرنا" : "Our Store"}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
              {content?.heroTitle || (isRTL ? "مجموعتنا\nالحصرية" : "Our Exclusive\nCollection")}
            </h1>
            <p className="mt-4 text-white/60 text-base md:text-lg max-w-md leading-relaxed">
              {content?.heroSubtitle || (isRTL
                ? "اكتشف أفضل المنتجات المختارة بعناية لمنزلك"
                : "Curated furniture & décor for your perfect space")}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8 md:gap-12 text-white">
            <div>
              <p className="text-3xl font-bold">{products.length}</p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">
                {isRTL ? "منتج" : "Products"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">{categories.length}</p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">
                {isRTL ? "فئة" : "Categories"}
              </p>
            </div>
            {country && (
              <div>
                <p className="text-3xl font-bold">{country.flag}</p>
                <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">
                  {country.currency}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Category + Filter Bar ── */}
      <div
        ref={filterBarRef}
        className="bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-10 md:px-14">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-3">

            {/* "All" pill */}
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-shrink-0 text-sm font-semibold px-5 py-2 rounded-full transition whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-[#2D3247] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {isRTL ? "الكل" : "All"}
              <span className="ms-1.5 text-[11px] opacity-60">({products.length})</span>
            </button>

            {/* Category pills */}
            {categories.map(({ en, label }) => {
              const count = products.filter((p) => p.category?.en === en).length;
              return (
                <button
                  key={en}
                  onClick={() => setActiveCategory(en)}
                  className={`flex-shrink-0 text-sm font-semibold px-5 py-2 rounded-full transition whitespace-nowrap ${
                    activeCategory === en
                      ? "bg-[#2D3247] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {label}
                  <span className="ms-1.5 text-[11px] opacity-60">({count})</span>
                </button>
              );
            })}

            {/* Spacer */}
            <div className="flex-1 min-w-4" />

            {/* Divider */}
            <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

            {/* Advanced filters button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className={`flex-shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition whitespace-nowrap ${
                advancedActiveCount > 0
                  ? "bg-[#2D3247] text-white border-[#2D3247]"
                  : "text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
              }`}
            >
              <SlidersHorizontal size={14} />
              {isRTL ? "فلاتر" : "Filters"}
              {advancedActiveCount > 0 && (
                <span className="bg-white text-[#2D3247] text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {advancedActiveCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative flex-shrink-0">
              <select
                value={filters.sort}
                onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
                className="appearance-none text-sm font-semibold text-gray-600 bg-transparent border-0 pe-6 py-2 cursor-pointer focus:outline-none hover:text-gray-900"
              >
                <option value="newest">{isRTL ? "الأحدث" : "Newest"}</option>
                <option value="price-low-high">{isRTL ? "السعر: من الأقل" : "Price: Low to High"}</option>
                <option value="price-high-low">{isRTL ? "السعر: من الأعلى" : "Price: High to Low"}</option>
              </select>
              <ChevronDown size={13} className="absolute end-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Active filter tags ── */}
      {(activeCategory !== "all" || advancedActiveCount > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-10 md:px-14 pt-4 flex flex-wrap gap-2">
          {activeCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 bg-white text-sm text-gray-700 border border-gray-200 rounded-full px-3 py-1 shadow-sm">
              {categories.find((c) => c.en === activeCategory)?.label || activeCategory}
              <button onClick={() => setActiveCategory("all")} className="hover:text-red-500 transition">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.material.map((m) => (
            <span key={m} className="inline-flex items-center gap-1.5 bg-white text-sm text-gray-700 border border-gray-200 rounded-full px-3 py-1 shadow-sm">
              {m}
              <button onClick={() => setFilters((p) => ({ ...p, material: p.material.filter((x) => x !== m) }))} className="hover:text-red-500 transition">
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            onClick={() => { setActiveCategory("all"); setFilters((p) => ({ ...p, material: [], color: [], inStock: false, minPrice: 0, maxPrice: 50000 })); }}
            className="text-xs text-gray-400 underline hover:text-gray-700 transition"
          >
            {isRTL ? "مسح الكل" : "Clear all"}
          </button>
        </div>
      )}

      {/* ── Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-10 md:px-14 py-8 md:py-10">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-5">
              <LayoutGrid size={28} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isRTL ? "لا توجد منتجات" : "No products found"}
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              {isRTL ? "جرب تعديل الفلاتر أو اختر فئة مختلفة" : "Try adjusting your filters or browse a different category"}
            </p>
            <button
              onClick={() => { setActiveCategory("all"); setFilters({ material: [], color: [], inStock: false, minPrice: 0, maxPrice: 50000, sort: "newest" }); }}
              className="bg-[#2D3247] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#1e2231] transition"
            >
              {isRTL ? "مسح الفلاتر" : "Clear Filters"}
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">
              {isRTL
                ? `${filteredProducts.length} منتج`
                : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={onProductClick} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Advanced filters sheet */}
      <FiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        products={products}
        isRTL={isRTL}
      />
    </div>
  );
};
