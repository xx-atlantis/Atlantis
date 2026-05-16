"use client";

import React, { useState, useMemo } from "react";
import {
  SlidersHorizontal, ChevronDown, X, Check,
  LayoutGrid, Layers, Search, Grid3X3, Grid2X2,
  ArrowRight, CheckCircle2,
} from "lucide-react";
import { ProductCard } from "./ProductCard";
import { QuickViewModal } from "./QuickViewModal";
import { ShopSkeleton } from "../ShopSkeleton";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCountryCurrency } from "@/app/context/CountryCurrencyContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/* ──────────────────────────────────────────────────────────────
   FilterSection — collapsible panel used in both sidebar & sheet
────────────────────────────────────────────────────────────── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      {title && (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full mb-3 group"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 group-hover:text-gray-600 transition">
            {title}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
      {open && children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   SidebarFilters — desktop persistent left sidebar
────────────────────────────────────────────────────────────── */
function SidebarFilters({
  products,
  filters,
  setFilters,
  categories,
  activeCategory,
  setActiveCategory,
  isRTL,
  locale,
}) {
  const materials = useMemo(() => {
    const s = new Set();
    products.forEach((p) => {
      const arr = p.variant?.materials;
      if (Array.isArray(arr) && arr.length > 0) {
        arr.forEach((m) => s.add(m));
      } else if (p.material) {
        p.material.split(",").forEach((m) => { const t = m.trim(); if (t) s.add(t); });
      }
    });
    return [...s];
  }, [products]);

  const colors = useMemo(() => {
    const s = new Set();
    products.forEach((p) => { if (p.color) s.add(p.color); });
    return [...s];
  }, [products]);

  const allSizes = useMemo(() => {
    const s = new Set();
    products.forEach((p) => {
      (p.variant?.sizes || []).forEach((sz) => s.add(sz));
    });
    return [...s];
  }, [products]);

  const activeCount =
    filters.material.length +
    filters.color.length +
    filters.sizes.length +
    (filters.inStock ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 50000 ? 1 : 0);

  const toggle = (key, val) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter((x) => x !== val)
        : [...prev[key], val],
    }));

  const clearAll = () => {
    setFilters((p) => ({
      ...p,
      material: [],
      color: [],
      sizes: [],
      inStock: false,
      minPrice: 0,
      maxPrice: 50000,
    }));
    setActiveCategory("all");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-1 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[#2D3247]" />
          <span className="text-sm font-bold text-[#2D3247]">
            {isRTL ? "تصفية" : "Filters"}
          </span>
          {activeCount > 0 && (
            <span className="bg-[#C9A96E] text-white text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center leading-none">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-[11px] text-gray-400 hover:text-red-500 font-medium transition"
          >
            {isRTL ? "مسح الكل" : "Clear all"}
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title={isRTL ? "الفئات" : "Category"}>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => setActiveCategory("all")}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                activeCategory === "all"
                  ? "border-[#2D3247] bg-[#2D3247]"
                  : "border-gray-300 hover:border-gray-500"
              }`}
            >
              {activeCategory === "all" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span className={`text-sm transition ${activeCategory === "all" ? "font-semibold text-[#2D3247]" : "text-gray-600 group-hover:text-gray-900"}`}>
              {isRTL ? "جميع المنتجات" : "All Products"}
            </span>
            <span className="text-xs text-gray-400 ms-auto">{products.length}</span>
          </label>

          {categories.map(({ en, label }) => {
            const count = products.filter((p) => p.category?.en === en).length;
            const active = activeCategory === en;
            return (
              <label key={en} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setActiveCategory(en)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                    active
                      ? "border-[#2D3247] bg-[#2D3247]"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={`text-sm transition flex-1 min-w-0 ${active ? "font-semibold text-[#2D3247]" : "text-gray-600 group-hover:text-gray-900"}`}>
                  {label}
                </span>
                <span className="text-xs text-gray-400 shrink-0">{count}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title={isRTL ? "نطاق السعر" : "Price Range"}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice || ""}
            onChange={(e) => setFilters((p) => ({ ...p, minPrice: Number(e.target.value) || 0 }))}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm text-center focus:ring-1 focus:ring-[#2D3247] focus:border-[#2D3247] outline-none bg-gray-50"
            placeholder={isRTL ? "من" : "Min"}
          />
          <span className="text-gray-400 shrink-0 text-sm">—</span>
          <input
            type="number"
            value={filters.maxPrice >= 50000 ? "" : filters.maxPrice}
            onChange={(e) => setFilters((p) => ({ ...p, maxPrice: Number(e.target.value) || 50000 }))}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm text-center focus:ring-1 focus:ring-[#2D3247] focus:border-[#2D3247] outline-none bg-gray-50"
            placeholder={isRTL ? "إلى" : "Max"}
          />
        </div>
      </FilterSection>

      {/* Sizes */}
      {allSizes.length > 0 && (
        <FilterSection title={isRTL ? "المقاسات" : "Size"}>
          <div className="flex flex-wrap gap-2">
            {[...allSizes].map((sz) => {
              const sel = filters.sizes.includes(sz);
              return (
                <button
                  key={sz}
                  onClick={() => toggle("sizes", sz)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-semibold transition-all ${
                    sel
                      ? "bg-[#2D3247] text-white border-[#2D3247] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#2D3247] hover:text-[#2D3247]"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Material */}
      {materials.length > 0 && (
        <FilterSection title={isRTL ? "المادة" : "Material"}>
          <div className="space-y-2">
            {materials.map((m) => {
              const sel = filters.material.includes(m);
              return (
                <label key={m} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggle("material", m)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition shrink-0 ${
                      sel ? "bg-[#2D3247] border-[#2D3247]" : "border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {sel && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`text-sm transition ${sel ? "font-semibold text-[#2D3247]" : "text-gray-600 group-hover:text-gray-900"}`}>
                    {m}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Color */}
      {colors.length > 0 && (
        <FilterSection title={isRTL ? "اللون" : "Color"}>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const sel = filters.color.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggle("color", c)}
                  title={c}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    sel
                      ? "border-[#2D3247] scale-110 shadow-md"
                      : "border-transparent hover:border-gray-400 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.toLowerCase() }}
                />
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* In Stock */}
      <FilterSection title="">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {isRTL ? "متوفر فقط" : "In Stock Only"}
          </span>
          <button
            onClick={() => setFilters((p) => ({ ...p, inStock: !p.inStock }))}
            className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${filters.inStock ? "bg-[#2D3247]" : "bg-gray-200"}`}
          >
            <span
              className={`absolute top-1 start-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                filters.inStock ? "translate-x-5 rtl:-translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </FilterSection>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MobileFiltersSheet — slide-in sheet for mobile
────────────────────────────────────────────────────────────── */
function MobileFiltersSheet({ open, onClose, filters, setFilters, products, categories, activeCategory, setActiveCategory, isRTL, locale }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side={isRTL ? "right" : "left"} className="w-[300px] sm:w-[340px] overflow-y-auto p-0">
        <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col h-full">
          <div className="px-5 py-4 border-b bg-white">
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-widest">
              {isRTL ? "تصفية المنتجات" : "Filter Products"}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-2">
            <SidebarFilters
              products={products}
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              isRTL={isRTL}
              locale={locale}
            />
          </div>
          <div className="px-5 py-4 border-t bg-white">
            <button
              onClick={onClose}
              className="w-full bg-[#2D3247] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1e2231] transition"
            >
              {isRTL ? "عرض النتائج" : "Show Results"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ──────────────────────────────────────────────────────────────
   CollectionsStrip
────────────────────────────────────────────────────────────── */
function CollectionsStrip({ collections, activeCollectionId, onSelect, isRTL, locale }) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="px-4 sm:px-6 py-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
          {isRTL ? "تسوق حسب المجموعة" : "Shop by Collection"}
        </p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {collections.map((col) => {
            const isActive = activeCollectionId === col.id;
            return (
              <button
                key={col.id}
                onClick={() => onSelect(isActive ? null : col.id)}
                className="shrink-0 group relative focus:outline-none"
                style={{ width: "140px" }}
              >
                <div
                  className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-[#C9A96E] ring-offset-2 shadow-lg"
                      : "hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {col.image ? (
                    <img
                      src={col.image}
                      alt={locale === "ar" ? col.nameAr : col.nameEn}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2D3247] to-[#3d4560]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {isActive && (
                    <div className="absolute top-2 end-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                      <Check size={11} className="text-[#C9A96E]" />
                    </div>
                  )}
                  <p className="absolute bottom-0 inset-x-0 px-2 pb-2.5 text-white text-xs font-bold text-center leading-tight">
                    {locale === "ar" ? col.nameAr : col.nameEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   ServicePackagesSection — packages with showInShop=true
────────────────────────────────────────────────────────────── */
function ServicePackagesSection({ packages, isRTL, locale }) {
  if (!packages || packages.length === 0) return null;

  return (
    <div className="bg-[#2D3247] px-4 sm:px-6 py-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E] mb-1">
              {isRTL ? "خدماتنا" : "Design Services"}
            </p>
            <h2 className="text-xl font-bold text-white">
              {isRTL ? "باقات التصميم المتاحة" : "Available Design Packages"}
            </h2>
          </div>
        </div>

        <div className={`grid gap-4 ${
          packages.length === 1
            ? "grid-cols-1 max-w-sm"
            : packages.length === 2
            ? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {packages.map((pkg, i) => (
            <ServicePackageCard key={i} pkg={pkg} isRTL={isRTL} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicePackageCard({ pkg, isRTL, locale }) {
  const price = parseFloat(String(pkg.price || "0").replace(/[^0-9.]/g, "")) || 0;
  const includedFeatures = (pkg.features || []).filter((f) => f.included);

  return (
    <div className={`relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg ${
      pkg.recommended ? "ring-2 ring-[#C9A96E]" : ""
    }`}>
      {pkg.recommended && (
        <div className="bg-[#C9A96E] text-white text-[10px] font-bold uppercase tracking-widest text-center py-1.5 px-4">
          {isRTL ? "الأكثر طلباً" : "Most Popular"}
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A96E] mb-1">
            {pkg.type}
          </p>
          <h3 className="text-lg font-bold text-[#2D3247]">{pkg.title}</h3>
        </div>

        {/* Price */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#2D3247]">{price.toLocaleString()}</span>
            <span className="text-sm font-semibold text-gray-400">SAR</span>
          </div>
          {pkg.perRoom && (
            <p className="text-xs text-gray-400 mt-0.5">{pkg.perRoom}</p>
          )}
        </div>

        {/* Features */}
        {includedFeatures.length > 0 && (
          <ul className="space-y-2 flex-1">
            {includedFeatures.slice(0, 5).map((f, fi) => (
              <li key={fi} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{f.text}</span>
              </li>
            ))}
            {includedFeatures.length > 5 && (
              <li className="text-xs text-gray-400 ps-[23px]">
                +{includedFeatures.length - 5} {isRTL ? "ميزة إضافية" : "more features"}
              </li>
            )}
          </ul>
        )}

        {/* CTA */}
        <a
          href={`/${locale}/start-a-project`}
          className="mt-auto flex items-center justify-center gap-2 bg-[#2D3247] hover:bg-[#1e2231] text-white font-bold py-3 rounded-xl text-sm transition"
        >
          {isRTL ? "ابدأ مشروعك" : "Get Started"}
          <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
        </a>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main ShopPage
────────────────────────────────────────────────────────────── */
export const ShopPage = ({ products, collections = [], servicePackages = [], onProductClick, loading, error, content }) => {
  const { locale } = useLocale();
  const { country, formatPrice } = useCountryCurrency();
  const isRTL = locale === "ar";

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [gridCols, setGridCols] = useState(3); // desktop grid columns
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    material: [],
    color: [],
    sizes: [],
    inStock: false,
    minPrice: 0,
    maxPrice: 50000,
    sort: "newest",
  });

  /* Derive categories from products */
  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.category?.en) map.set(p.category.en, p.category[locale] || p.category.en);
    });
    return Array.from(map.entries()).map(([en, label]) => ({ en, label }));
  }, [products, locale]);

  /* Filtered + sorted products */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCollectionId) {
      const col = collections.find((c) => c.id === activeCollectionId);
      if (col) result = result.filter((p) => col.productIds.includes(p.id));
    }

    if (activeCategory !== "all")
      result = result.filter((p) => p.category?.en === activeCategory);

    if (search.trim())
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );

    result = result.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    if (filters.material.length)
      result = result.filter((p) => {
        const arr = p.variant?.materials;
        const productMats = Array.isArray(arr) && arr.length > 0
          ? arr
          : (p.material || "").split(",").map((m) => m.trim()).filter(Boolean);
        return productMats.some((m) => filters.material.includes(m));
      });

    if (filters.color.length)
      result = result.filter((p) => p.color && filters.color.includes(p.color));

    if (filters.sizes.length)
      result = result.filter((p) =>
        p.variant?.sizes?.some((s) => filters.sizes.includes(s))
      );

    if (filters.inStock) result = result.filter((p) => p.inStock === true);

    if (filters.sort === "price-low-high") result.sort((a, b) => a.price - b.price);
    else if (filters.sort === "price-high-low") result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, activeCategory, activeCollectionId, search, filters, collections]);

  const sidebarActiveCount =
    filters.material.length +
    filters.color.length +
    filters.sizes.length +
    (filters.inStock ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 50000 ? 1 : 0);

  const clearAll = () => {
    setActiveCategory("all");
    setActiveCollectionId(null);
    setSearch("");
    setFilters({ material: [], color: [], sizes: [], inStock: false, minPrice: 0, maxPrice: 50000, sort: "newest" });
  };

  if (loading) return <ShopSkeleton />;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#FAFAFA]">

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2D3247 0%, #3a4060 60%, #2a3855 100%)", minHeight: "280px" }}
      >
        <div className="absolute -top-16 -end-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-0 start-1/4 w-48 h-48 rounded-full bg-[#C9A96E]/10" />

        <div className="relative z-10 px-4 sm:px-10 md:px-14 py-12 md:py-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-[1600px] mx-auto">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">
              {isRTL ? "متجرنا" : "Our Store"}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1]">
              {content?.heroTitle || (isRTL ? "مجموعتنا الحصرية" : "Our Exclusive\nCollection")}
            </h1>
            <p className="mt-3 text-white/55 text-sm md:text-base max-w-sm leading-relaxed">
              {content?.heroSubtitle || (isRTL ? "اكتشف أفضل المنتجات المختارة بعناية لمنزلك" : "Curated furniture & décor for your perfect space")}
            </p>
          </div>

          <div className="flex gap-8 md:gap-12 text-white shrink-0">
            <div>
              <p className="text-3xl font-bold">{products.length}</p>
              <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{isRTL ? "منتج" : "Products"}</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{categories.length}</p>
              <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{isRTL ? "فئة" : "Categories"}</p>
            </div>
            {country && (
              <div>
                <p className="text-3xl font-bold">{country.flag}</p>
                <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{country.currency}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Collections Strip ── */}
      <CollectionsStrip
        collections={collections}
        activeCollectionId={activeCollectionId}
        onSelect={(id) => { setActiveCollectionId(id); setActiveCategory("all"); }}
        isRTL={isRTL}
        locale={locale}
      />

      {/* ── Service Packages (showInShop=true) ── */}
      <ServicePackagesSection packages={servicePackages} isRTL={isRTL} locale={locale} />

      {/* ── Main layout: sidebar + content ── */}
      <div className="max-w-[1600px] mx-auto flex">

        {/* Left Sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col w-[240px] xl:w-[260px] shrink-0 border-e border-gray-100 bg-white sticky top-0 self-start h-screen overflow-y-auto px-5 py-6">
          <SidebarFilters
            products={products}
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={(cat) => { setActiveCategory(cat); setActiveCollectionId(null); }}
            isRTL={isRTL}
            locale={locale}
          />
        </aside>

        {/* Right content */}
        <div className="flex-1 min-w-0">

          {/* ── Top bar ── */}
          <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3">

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRTL ? "بحث..." : "Search products..."}
                className="w-full ps-8 pe-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#2D3247] focus:border-[#2D3247] outline-none transition"
              />
            </div>

            {/* Mobile category scroll */}
            <div className="lg:hidden flex-1 overflow-x-auto no-scrollbar flex gap-2">
              <button
                onClick={() => { setActiveCategory("all"); setActiveCollectionId(null); }}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                  activeCategory === "all"
                    ? "bg-[#2D3247] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isRTL ? "الكل" : "All"}
              </button>
              {categories.map(({ en, label }) => (
                <button
                  key={en}
                  onClick={() => { setActiveCategory(en); setActiveCollectionId(null); }}
                  className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    activeCategory === en
                      ? "bg-[#2D3247] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ms-auto shrink-0">
              {/* Mobile filters button */}
              <button
                onClick={() => setFiltersOpen(true)}
                className={`lg:hidden flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition whitespace-nowrap ${
                  sidebarActiveCount > 0
                    ? "bg-[#2D3247] text-white border-[#2D3247]"
                    : "text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                <SlidersHorizontal size={13} />
                {isRTL ? "فلاتر" : "Filters"}
                {sidebarActiveCount > 0 && (
                  <span className="bg-white text-[#2D3247] w-4 h-4 rounded-full text-[10px] font-bold inline-flex items-center justify-center">
                    {sidebarActiveCount}
                  </span>
                )}
              </button>

              {/* Grid cols toggle — desktop */}
              <div className="hidden lg:flex items-center gap-1 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-1.5 rounded-lg transition ${gridCols === 3 ? "bg-[#2D3247] text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-1.5 rounded-lg transition ${gridCols === 4 ? "bg-[#2D3247] text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Grid2X2 size={14} />
                </button>
              </div>

              {/* Divider */}
              <div className="h-5 w-px bg-gray-200" />

              {/* Sort */}
              <div className="relative flex items-center shrink-0">
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
                  className="appearance-none text-xs font-bold text-gray-600 bg-transparent border-0 pe-5 py-2 cursor-pointer focus:outline-none hover:text-gray-900 whitespace-nowrap"
                >
                  <option value="newest">{isRTL ? "الأحدث" : "Newest"}</option>
                  <option value="price-low-high">{isRTL ? "السعر: تصاعدي" : "Price: Low → High"}</option>
                  <option value="price-high-low">{isRTL ? "السعر: تنازلي" : "Price: High → Low"}</option>
                </select>
                <ChevronDown size={12} className="absolute end-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Active filter tags ── */}
          {(activeCollectionId || activeCategory !== "all" || sidebarActiveCount > 0 || search) && (
            <div className="px-4 sm:px-6 pt-3 pb-1 flex flex-wrap gap-2">
              {activeCollectionId && (
                <Tag
                  icon={<Layers size={10} />}
                  label={(() => { const col = collections.find((c) => c.id === activeCollectionId); return locale === "ar" ? col?.nameAr : col?.nameEn; })()}
                  onRemove={() => setActiveCollectionId(null)}
                  gold
                />
              )}
              {activeCategory !== "all" && (
                <Tag label={categories.find((c) => c.en === activeCategory)?.label} onRemove={() => setActiveCategory("all")} />
              )}
              {search && (
                <Tag label={`"${search}"`} onRemove={() => setSearch("")} />
              )}
              {filters.sizes.map((s) => (
                <Tag key={s} label={s} onRemove={() => setFilters((p) => ({ ...p, sizes: p.sizes.filter((x) => x !== s) }))} />
              ))}
              {filters.material.map((m) => (
                <Tag key={m} label={m} onRemove={() => setFilters((p) => ({ ...p, material: p.material.filter((x) => x !== m) }))} />
              ))}
              {(filters.minPrice > 0 || filters.maxPrice < 50000) && (
                <Tag label={`${filters.minPrice} – ${filters.maxPrice}`} onRemove={() => setFilters((p) => ({ ...p, minPrice: 0, maxPrice: 50000 }))} />
              )}
              <button onClick={clearAll} className="text-[11px] text-gray-400 hover:text-red-500 transition underline self-center">
                {isRTL ? "مسح الكل" : "Clear all"}
              </button>
            </div>
          )}

          {/* ── Product Grid ── */}
          <div className="px-4 sm:px-6 py-6">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4">
                  <LayoutGrid size={24} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {isRTL ? "لا توجد منتجات" : "No products found"}
                </h3>
                <p className="text-gray-400 text-sm mb-5 max-w-xs">
                  {isRTL ? "جرب تعديل الفلاتر أو البحث باستخدام كلمة مختلفة" : "Try adjusting your filters or searching with a different term"}
                </p>
                <button
                  onClick={clearAll}
                  className="bg-[#2D3247] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#1e2231] transition"
                >
                  {isRTL ? "مسح الفلاتر" : "Clear Filters"}
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-5 font-medium">
                  {isRTL
                    ? `${filteredProducts.length} منتج`
                    : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
                </p>
                <div
                  className={`grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 ${
                    gridCols === 3
                      ? "lg:grid-cols-3 xl:grid-cols-3"
                      : "lg:grid-cols-4 xl:grid-cols-4"
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={onProductClick}
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filters Sheet ── */}
      <MobileFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        products={products}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={(cat) => { setActiveCategory(cat); setActiveCollectionId(null); }}
        isRTL={isRTL}
        locale={locale}
      />

      {/* ── Quick View Modal ── */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onViewFull={() => { onProductClick(quickViewProduct.id); setQuickViewProduct(null); }}
        />
      )}
    </div>
  );
};

/* small tag chip helper */
function Tag({ label, onRemove, icon, gold }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1 shadow-sm ${
        gold
          ? "bg-[#C9A96E] text-white"
          : "bg-white text-gray-700 border border-gray-200"
      }`}
    >
      {icon}
      <span className="leading-none">{label}</span>
      <button onClick={onRemove} className="hover:opacity-60 transition">
        <X size={11} />
      </button>
    </span>
  );
}
