"use client";

import React, { useState } from "react";
import { ShoppingBag, Eye, Heart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCountryCurrency } from "@/app/context/CountryCurrencyContext";

export const ProductCard = ({ product, onClick, onQuickView }) => {
  const { addToCart } = useCart();
  const { locale } = useLocale();
  const { formatPrice } = useCountryCurrency();
  const isRTL = locale === "ar";
  const [wishlisted, setWishlisted] = useState(false);

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

  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const sizes = product.variant?.sizes || [];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      onClick={() => onClick(product.id)}
      className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl shadow-sm border border-gray-100/80"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-[#F5F3EF] aspect-square">
        {product.coverImage ? (
          <img
            src={product.coverImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D3247]/10 to-[#C9A96E]/10" />
        )}

        {/* Out-of-stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/55 flex items-center justify-center">
            <span className="bg-white text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              {isRTL ? "نفد المخزون" : "Out of Stock"}
            </span>
          </div>
        )}

        {/* Category badge */}
        {product.category?.[locale] && (
          <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"}`}>
            <span className="bg-white/90 backdrop-blur-sm text-[#2D3247] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
              {product.category[locale]}
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${wishlisted ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"}`}
        >
          <Heart
            size={14}
            className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>

        {/* Quick View — slides up from bottom */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleQuickView}
            className="w-full bg-white/95 backdrop-blur-sm text-[#2D3247] py-3 text-xs font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-white transition-colors border-t border-gray-100"
          >
            <Eye size={13} />
            {isRTL ? "عرض سريع" : "Quick View"}
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        {product.material && (
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#C9A96E]/80">
            {product.material}
          </p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#2D3247] transition-colors">
          {product.name}
        </h3>

        {/* Size chips */}
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {sizes.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[10px] border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md font-medium"
              >
                {s}
              </span>
            ))}
            {sizes.length > 3 && (
              <span className="text-[10px] text-gray-400 px-0.5 self-center">
                +{sizes.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <p className="text-base font-bold text-[#2D3247]">
            {formatPrice(product.price)}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="inline-flex items-center gap-1.5 bg-[#2D3247] hover:bg-[#1e2231] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <ShoppingBag size={12} />
            <span>{isRTL ? "أضف" : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
