"use client";
import React, { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SidebarFilters } from "./SidebarFilter";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ShopSkeleton } from "../ShopSkeleton";

export const ShopPage = ({
  products,
  onProductClick,
  loading,
  error,
  content,
}) => {
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

  // -------------------------------------------------
  // FILTER LOGIC (FIXED)
  // -------------------------------------------------
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // CATEGORY FILTER — FIXED (use category.en)
    if (filters.category.length > 0) {
      result = result.filter(
        (p) => p.category?.en && filters.category.includes(p.category.en)
      );
    }

    // PRICE RANGE FILTER
    result = result.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    // MATERIAL FILTER
    if (filters.material.length > 0) {
      result = result.filter(
        (p) => p.material && filters.material.includes(p.material)
      );
    }

    // COLOR FILTER
    if (filters.color.length > 0) {
      result = result.filter((p) => p.color && filters.color.includes(p.color));
    }

    // IN-STOCK FILTER
    if (filters.inStock) {
      result = result.filter((p) => p.inStock === true);
    }

    // SORTING
    switch (filters.sort) {
      case "price-low-high":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        break;
    }

    return result;
  }, [products, filters]);

  // -------------------------------------------------
  // LOADING / CMS CHECKS
  // -------------------------------------------------
  if (loading) return <ShopSkeleton />;

  if (!content)
    return (
      <div className="text-center py-20 text-red-500 font-semibold">
        CMS content missing for shop page
      </div>
    );

  // -------------------------------------------------
  // UI OUTPUT
  // -------------------------------------------------
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {content.pageTitle}
          </h1>
          <p className="text-gray-500 text-lg">{content.pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* MOBILE FILTER BUTTON */}
          <Button
            variant="outline"
            className="lg:hidden gap-2"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={16} />
            {content.mobile.openFilters}
          </Button>

          {/* SORT DROPDOWN */}
          <div className="relative">
            <select
              className="h-10 w-[180px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              value={filters.sort}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sort: e.target.value }))
              }
            >
              <option value="newest">{content.sorting.options.newest}</option>
              <option value="price-low-high">
                {content.sorting.options.priceLowHigh}
              </option>
              <option value="price-high-low">
                {content.sorting.options.priceHighLow}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR FILTERS */}
        <SidebarFilters
          content={content.filters}
          filters={filters}
          setFilters={setFilters}
          isMobileOpen={isMobileFiltersOpen}
          closeMobile={() => setIsMobileFiltersOpen(false)}
        />

        {/* PRODUCT GRID */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.emptyState.title}
              </h3>
              <p className="text-gray-500 mt-1 mb-6 max-w-sm">
                {content.emptyState.description}
              </p>

              <Button
                variant="secondary"
                onClick={() =>
                  setFilters({
                    category: [],
                    minPrice: 0,
                    maxPrice: 50000,
                    material: [],
                    color: [],
                    inStock: false,
                    sort: "newest",
                  })
                }
              >
                {content.emptyState.clearFiltersBtn}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={onProductClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
