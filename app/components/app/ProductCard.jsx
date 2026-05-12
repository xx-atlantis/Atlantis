"use client";
import React from "react";
import { ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCountryCurrency } from "@/app/context/CountryCurrencyContext";

export const ProductCard = ({ product, onClick }) => {
  const { addToCart } = useCart();
  const { locale } = useLocale();
  const { formatPrice } = useCountryCurrency();
  const isRTL = locale === "ar";

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        coverImage: product.coverImage,
        images: product.images,
        short_description: product.short_description,
        material: product.material,
        variant: product.variant,
        category: product.category,
        categoryLabel: product.category?.[locale] || "",
      },
      1
    );
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      onClick={() => onClick(product.id)}
      className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-[#F5F3EF] aspect-[4/5]">
        <img
          src={product.coverImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category chip */}
        {product.category?.[locale] && (
          <div className="absolute top-3 start-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
              {product.category[locale]}
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-white text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              {isRTL ? "نفد المخزون" : "Out of Stock"}
            </span>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute bottom-0 start-0 end-0 flex translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 bg-[#2D3247] text-white py-3 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#1e2231] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={14} />
            {isRTL ? "أضف إلى السلة" : "Add to Bag"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(product.id); }}
            className="bg-white text-gray-700 px-4 py-3 text-xs font-semibold flex items-center justify-center hover:bg-gray-50 transition-colors border-s border-gray-100"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        {product.material && (
          <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
            {product.material}
          </p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#2D3247] transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-base font-bold text-[#2D3247]">
            {formatPrice(product.price)}
          </span>
          {product.sku && (
            <span className="text-[10px] text-gray-300 font-mono">{product.sku}</span>
          )}
        </div>
      </div>
    </div>
  );
};
