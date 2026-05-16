"use client";

import { useState } from "react";
import { X, ShoppingBag, ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCountryCurrency } from "@/app/context/CountryCurrencyContext";

export function QuickViewModal({ product, onClose, onViewFull }) {
  const { addToCart } = useCart();
  const { locale } = useLocale();
  const { formatPrice } = useCountryCurrency();
  const isRTL = locale === "ar";

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const allImages = [product.coverImage, ...(product.images || [])].filter(Boolean);
  const sizes = product.variant?.sizes || [];
  const needsSize = sizes.length > 0;

  const prevImage = () => setSelectedImage((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextImage = () => setSelectedImage((i) => (i === allImages.length - 1 ? 0 : i + 1));

  const handleAdd = () => {
    if (!product.inStock) return;
    if (needsSize && !selectedSize) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        coverImage: product.coverImage,
        images: product.images,
        short_description: product.short_description,
        material: product.material,
        variant: { ...product.variant, selectedSize },
        category: product.category,
        categoryLabel: product.category?.[locale] || "",
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="bg-white w-full sm:max-w-3xl lg:max-w-4xl rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-2xl max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Image Panel ── */}
        <div className="relative w-full sm:w-[45%] shrink-0 bg-[#F5F3EF]">
          <div className="aspect-square relative overflow-hidden">
            <img
              src={allImages[selectedImage] || "/placeholder.jpg"}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Prev/Next arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition`}
                >
                  <ChevronLeft size={16} className={isRTL ? "rotate-180" : ""} />
                </button>
                <button
                  onClick={nextImage}
                  className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition`}
                >
                  <ChevronRight size={16} className={isRTL ? "rotate-180" : ""} />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`rounded-full transition-all ${selectedImage === i ? "w-5 h-1.5 bg-[#2D3247]" : "w-1.5 h-1.5 bg-white/60"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? "border-[#2D3247] shadow-md"
                      : "border-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info Panel ── */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-6 flex flex-col gap-4 flex-1">

            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {product.category?.[locale] && (
                  <p className="text-xs font-bold uppercase tracking-widest text-[#C9A96E] mb-1">
                    {product.category[locale]}
                  </p>
                )}
                <h2 className="text-lg font-bold text-[#2D3247] leading-snug">
                  {product.name}
                </h2>
                {(() => {
                  const arr = product.variant?.materials;
                  const mats = Array.isArray(arr) && arr.length > 0
                    ? arr
                    : (product.material || "").split(",").map((m) => m.trim()).filter(Boolean);
                  return mats.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mats.map((m) => (
                        <span key={m} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wide font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition shrink-0 mt-0.5"
              >
                <X size={15} />
              </button>
            </div>

            {/* Price */}
            <div>
              <p className="text-2xl font-bold text-[#2D3247]">
                {formatPrice(product.price)}
              </p>
              {!product.inStock && (
                <span className="text-xs font-semibold text-red-500 mt-1 inline-block">
                  {isRTL ? "نفد المخزون" : "Out of Stock"}
                </span>
              )}
            </div>

            {/* Size selector */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {isRTL ? "المقاس" : "Size"}
                  </p>
                  {selectedSize && (
                    <span className="text-xs text-[#2D3247] font-semibold">{selectedSize}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                      className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                        selectedSize === s
                          ? "bg-[#2D3247] text-white border-[#2D3247] shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#2D3247] hover:text-[#2D3247]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {needsSize && !selectedSize && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {isRTL ? "الرجاء اختيار المقاس" : "Please select a size"}
                  </p>
                )}
              </div>
            )}

            {/* Short description */}
            {product.short_description && (
              <div
                className="text-sm text-gray-600 leading-relaxed line-clamp-4 [&_*]:text-sm [&_p]:my-0 [&_ul]:my-0"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}
          </div>

          {/* Actions footer */}
          <div className="p-6 pt-0 flex flex-col gap-3">
            <button
              onClick={handleAdd}
              disabled={!product.inStock || (needsSize && !selectedSize)}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-[#C9A96E] hover:bg-[#b8955c] text-white"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
              {added
                ? (isRTL ? "تمت الإضافة!" : "Added to Cart!")
                : (isRTL ? "أضف إلى السلة" : "Add to Cart")}
            </button>

            <button
              onClick={onViewFull}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-[#2D3247] font-semibold text-sm hover:bg-gray-50 transition"
            >
              {isRTL ? "عرض التفاصيل الكاملة" : "View Full Details"}
              <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
