"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react"; // Removed 'X' import as it's no longer needed
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "../../../lib/utils";
import { useLocale } from "@/app/components/LocaleProvider";

// ENGLISH LISTS
const EN_CATEGORIES = ["Chairs", "Beds", "Comod", "Sofas", "Arm Chairs"];
const EN_MATERIALS = ["Wood", "Metal", "Fabric", "Glass", "Ceramic", "Leather"];
const EN_COLORS = ["Beige", "Black", "White", "Blue", "Green", "Gold"];

// ARABIC LISTS
const AR_CATEGORIES = [
  "الكراسي",
  "الأسِرّة",
  "الكومود",
  "الأرائك",
  "الكراسي بذراعين",
];
const AR_MATERIALS = ["خشب", "معدن", "قماش", "زجاج", "سيراميك", "جلد"];
const AR_COLORS = ["بيج", "أسود", "أبيض", "أزرق", "أخضر", "ذهبي"];

export const SidebarFilters = ({
  content,
  filters,
  setFilters,
  isMobileOpen,
  closeMobile,
}) => {
  const { locale } = useLocale();
  const isArabic = locale === "ar";

  // Use Arabic or English lists
  const CATEGORIES = isArabic ? AR_CATEGORIES : EN_CATEGORIES;
  const MATERIALS = isArabic ? AR_MATERIALS : EN_MATERIALS;
  const COLORS = isArabic ? AR_COLORS : EN_COLORS;

  const [expanded, setExpanded] = useState({
    category: true,
    price: true,
    material: false,
    color: false,
  });

  const toggleSection = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleArrayToggle = (key, value) => {
    setFilters((prev) => {
      const exists = prev[key].includes(value);
      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((x) => x !== value)
          : [...prev[key], value],
      };
    });
  };

  const FilterSection = ({ title, id, children }) => (
    <div className="py-5">
      <button
        className="flex w-full items-center justify-between text-base font-semibold text-gray-900 hover:text-[#2D3247] transition-colors"
        onClick={() => toggleSection(id)}
      >
        <span>{title}</span>
        {expanded[id] ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      {expanded[id] && (
        <div className="mt-5 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );

  const body = (
    <div className="flex flex-col h-full" dir={isArabic ? "rtl" : "ltr"}>
      
      {/* MOBILE HEADER - Duplicate X button removed! */}
      <div className="pb-4 pt-2 lg:hidden">
        <span className="font-bold text-xl text-gray-900">
          {content?.title || (isArabic ? "التصنيفات" : "Filters")}
        </span>
      </div>

      {/* CATEGORY */}
      <FilterSection title={content?.categories || (isArabic ? "الفئة" : "Category")} id="category">
        <div className="flex flex-col gap-3.5">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded border flex items-center justify-center transition-colors shadow-sm",
                    isSelected
                      ? "bg-[#2D3247] border-[#2D3247]"
                      : "border-gray-300 bg-white group-hover:border-gray-400"
                  )}
                >
                  {isSelected && <Check size={14} className="text-white" />}
                </div>

                <input
                  type="checkbox"
                  className="hidden"
                  onChange={() => handleArrayToggle("category", cat)}
                />

                <span
                  className={cn(
                    "text-sm transition-colors",
                    isSelected ? "font-medium text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                  )}
                >
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <Separator />

      {/* PRICE RANGE */}
      <FilterSection title={content?.priceRange || (isArabic ? "نطاق السعر" : "Price Range")} id="price">
        <div className="flex items-end gap-3">
          <div className="flex-1 grid gap-1.5">
            <span className="text-xs font-medium text-gray-500">
              {content?.min || (isArabic ? "الحد الأدنى" : "Min")}
            </span>
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice: Number(e.target.value),
                }))
              }
              className="h-10 text-center shadow-sm"
            />
          </div>

          {/* Centered Dash */}
          <div className="mb-5 h-[2px] w-4 shrink-0 bg-gray-300 rounded-full"></div>

          <div className="flex-1 grid gap-1.5">
            <span className="text-xs font-medium text-gray-500">
              {content?.max || (isArabic ? "الحد الأعلى" : "Max")}
            </span>
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: Number(e.target.value),
                }))
              }
              className="h-10 text-center shadow-sm"
            />
          </div>
        </div>
      </FilterSection>

      <Separator />

      {/* MATERIAL */}
      <FilterSection title={content?.material || (isArabic ? "المواد" : "Material")} id="material">
        <div className="flex flex-col gap-3.5">
          {MATERIALS.map((mat) => {
            const isSelected = filters.material.includes(mat);
            return (
              <label
                key={mat}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded border flex items-center justify-center transition-colors shadow-sm",
                    isSelected
                      ? "bg-[#2D3247] border-[#2D3247]"
                      : "border-gray-300 bg-white group-hover:border-gray-400"
                  )}
                >
                  {isSelected && <Check size={14} className="text-white" />}
                </div>

                <input
                  type="checkbox"
                  className="hidden"
                  onChange={() => handleArrayToggle("material", mat)}
                />

                <span
                  className={cn(
                    "text-sm transition-colors",
                    isSelected ? "font-medium text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                  )}
                >
                  {mat}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <Separator />

      {/* COLORS */}
      <FilterSection title={content?.color || (isArabic ? "اللون" : "Color")} id="color">
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color, idx) => {
            const isSelected = filters.color.includes(color);
            const isWhite = EN_COLORS[idx].toLowerCase() === "white";

            return (
              <button
                key={color}
                onClick={() => handleArrayToggle("color", color)}
                className={cn(
                  "h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center shadow-sm transition-all hover:scale-110",
                  isSelected && "ring-2 ring-offset-2 ring-[#2D3247]"
                )}
                style={{ backgroundColor: EN_COLORS[idx].toLowerCase() }}
                title={color}
              >
                {isSelected && (
                  <Check
                    size={14}
                    className={isWhite ? "text-black" : "text-white"}
                  />
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <Separator className="my-5" />

      {/* IN STOCK */}
      <div className="flex items-center justify-between pb-8">
        <span className="text-sm font-semibold text-gray-900">
          {content?.inStock || (isArabic ? "متوفر في المخزون فقط" : "In Stock Only")}
        </span>

        <button
          onClick={() =>
            setFilters((prev) => ({ ...prev, inStock: !prev.inStock }))
          }
          className={cn(
            "w-11 h-6 rounded-full relative transition-colors focus:outline-none shadow-inner",
            filters.inStock ? "bg-[#2D3247]" : "bg-gray-200"
          )}
        >
          <span
            className={cn(
              "absolute top-1 start-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
              filters.inStock ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0 pe-8">{body}</div>

      {/* Mobile */}
      <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
        <SheetContent side={isArabic ? "right" : "left"} className="w-[85vw] sm:w-[350px] overflow-y-auto p-6">
          {body}
        </SheetContent>
      </Sheet>
    </>
  );
};