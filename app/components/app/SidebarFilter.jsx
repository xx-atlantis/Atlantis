"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="py-4">
      <button
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-900 hover:text-[#2D3247]"
        onClick={() => toggleSection(id)}
      >
        <span>{title}</span>
        {expanded[id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded[id] && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );

  const body = (
    <div className="space-y-1" dir={isArabic ? "rtl" : "ltr"}>
      {/* MOBILE HEADER */}
      <div className="flex items-center justify-between pb-4 lg:hidden">
        <span className="font-bold text-lg">{content?.title}</span>
        <Button variant="ghost" size="icon" onClick={closeMobile}>
          <X size={20} />
        </Button>
      </div>

      {/* CATEGORY */}
      <FilterSection title={content?.categories} id="category">
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-[#2D3247] border-[#2D3247]"
                      : "border-gray-300 bg-white group-hover:border-gray-400"
                  )}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </div>

                <input
                  type="checkbox"
                  className="hidden"
                  onChange={() => handleArrayToggle("category", cat)}
                />

                <span
                  className={cn(
                    "text-sm",
                    isSelected ? "font-medium" : "text-gray-600"
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
      <FilterSection title={content?.priceRange} id="price">
        <div className="flex items-center gap-2">
          <div className="grid gap-1.5">
            <span className="text-xs text-gray-500">
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
              className="h-8 w-20"
            />
          </div>

          <div className="h-[1px] w-4 bg-gray-300 mt-5"></div>

          <div className="grid gap-1.5">
            <span className="text-xs text-gray-500">
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
              className="h-8 w-20"
            />
          </div>
        </div>
      </FilterSection>

      <Separator />

      {/* MATERIAL */}
      <FilterSection title={content?.material} id="material">
        <div className="space-y-2">
          {MATERIALS.map((mat) => {
            const isSelected = filters.material.includes(mat);
            return (
              <label
                key={mat}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-[#2D3247] border-[#2D3247]"
                      : "border-gray-300 bg-white group-hover:border-gray-400"
                  )}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </div>

                <input
                  type="checkbox"
                  className="hidden"
                  onChange={() => handleArrayToggle("material", mat)}
                />

                <span
                  className={cn(
                    "text-sm",
                    isSelected ? "font-medium" : "text-gray-600"
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
      <FilterSection title={content?.color} id="color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color, idx) => {
            const isSelected = filters.color.includes(color);
            const isWhite = EN_COLORS[idx].toLowerCase() === "white";

            return (
              <button
                key={color}
                onClick={() => handleArrayToggle("color", color)}
                className={cn(
                  "h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center shadow-sm transition-all hover:scale-105",
                  isSelected && "ring-2 ring-offset-2 ring-[#2D3247]"
                )}
                style={{ backgroundColor: EN_COLORS[idx].toLowerCase() }}
                title={color}
              >
                {isSelected && (
                  <Check
                    size={12}
                    className={isWhite ? "text-black" : "text-white"}
                  />
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <Separator className="my-4" />

      {/* INSTOCK */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-900">
          {content?.inStock}
        </span>

        <button
          onClick={() =>
            setFilters((prev) => ({ ...prev, inStock: !prev.inStock }))
          }
          className={cn(
            "w-9 h-5 rounded-full relative transition-colors",
            filters.inStock ? "bg-[#2D3247]" : "bg-gray-200"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
              filters.inStock ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0 pr-8">{body}</div>

      {/* Mobile */}
      <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          {body}
        </SheetContent>
      </Sheet>
    </>
  );
};
