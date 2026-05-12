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
      className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        <img
          src={product.coverImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />

        {/* Out-of-stock dim */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/50 flex items-end justify-center pb-4">
            <span className="bg-white text-gray-500 text-xs font-semibold px-3 py-1 rounded-full border border-gray-200 shadow-sm">
              {isRTL ? "نفد المخزون" : "Out of Stock"}
            </span>
          </div>
        )}

        {/* Category chip — top */}
        {product.category?.[locale] && (
          <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"}`}>
            <span className="bg-white/90 backdrop-blur-sm text-[#2D3247] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
              {product.category[locale]}
            </span>
          </div>
        )}

        {/* Hover action bar — slides up from bottom */}
        <div
          className="absolute inset-x-0 bottom-0 flex translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
        >
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 bg-[#2D3247]/95 backdrop-blur-sm text-white py-3.5 text-xs font-bold tracking-wide inline-flex items-center justify-center gap-2 hover:bg-[#2D3247] transition-colors disabled:opacity-40 disabled:cursor-not-allowed leading-none"
          >
            <ShoppingBag size={13} className="shrink-0" />
            <span className="leading-none">{isRTL ? "أضف للسلة" : "Add to Bag"}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(product.id); }}
            className="bg-white/95 backdrop-blur-sm text-[#2D3247] px-4 py-3.5 flex items-center justify-center hover:bg-white transition-colors border-s border-gray-100"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-4 flex flex-col gap-0.5">
        {product.material && (
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-0.5">
            {product.material}
          </p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#2D3247] transition-colors">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-bold text-[#2D3247]">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
};
