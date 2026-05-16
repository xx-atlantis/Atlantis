"use client";
import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Minus,
    Plus,
    Heart,
    ShieldCheck,
    Truck,
    SaudiRiyal,
    Star,
    Send,
    Loader2,
    ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "../../../lib/utils";
import { ProductSkeleton } from "../ProductSkeleton";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCart } from "@/app/context/CartContext";
import Breadcrumb from "@/app/components/Breadcrumb";

export const ProductDetails = ({ product, onBack, loading }) => {
    const { locale } = useLocale();
    const isRTL = locale === "ar";

    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewName, setReviewName] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [reviewDone, setReviewDone] = useState(false);

    // Related products state
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (!product?.id) return;
        setReviewsLoading(true);
        fetch(`/api/shop/product/${product.id}/reviews`)
            .then((r) => r.json())
            .then(({ data }) => setReviews(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setReviewsLoading(false));
    }, [product?.id]);

    useEffect(() => {
        if (!product?.categoryId || !product?.id) return;
        fetch(`/api/shop/product?locale=${locale}&categoryId=${product.categoryId}&limit=5`)
            .then((r) => r.json())
            .then(({ data }) => {
                if (Array.isArray(data)) {
                    setRelated(data.filter((p) => p.id !== product.id).slice(0, 4));
                }
            })
            .catch(() => {});
    }, [product?.categoryId, product?.id, locale]);

    const submitReview = async () => {
        if (!reviewName.trim() || !reviewComment.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/shop/product/${product.id}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: reviewName, rating: reviewRating, comment: reviewComment }),
            });
            const json = await res.json();
            if (json.success) {
                setReviewDone(true);
                setReviews((prev) => [{ name: reviewName, rating: reviewRating, comment: reviewComment, createdAt: new Date().toISOString() }, ...prev]);
                setReviewName(""); setReviewComment(""); setReviewRating(5);
            }
        } catch {}
        setSubmitting(false);
    };

    // ==========================================
    // TABBY PROMO SNIPPET INITIALIZATION (Product Page)
    // ==========================================
    useEffect(() => {
      if (!loading && product && typeof window !== "undefined" && window.TabbyPromo) {
        try {
          const totalPrice = product.price * quantity;
          
          // Clear any existing instance before creating a new one to prevent duplicates
          const promoContainer = document.getElementById('TabbyPromoProduct');
          if (promoContainer) promoContainer.innerHTML = '';

          new window.TabbyPromo({
            selector: '#TabbyPromoProduct',
            currency: 'SAR',
            price: totalPrice.toFixed(2), // Total price updates dynamically based on quantity
            installmentsCount: 4,
            lang: locale === "ar" ? "ar" : "en",
            source: 'product', // Let Tabby know this is on the product page
            publicKey: process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY,
            merchantCode: process.env.NEXT_PUBLIC_TABBY_MERCHANT_CODE || 'ACI'
          });
        } catch (err) {
          console.error("Tabby Promo Error (Product):", err);
        }
      }
    }, [loading, product, quantity, locale]);


    if (loading || !product) return <ProductSkeleton />;

    const productVariant =
        typeof product.variant === "object" && product.variant !== null
            ? product.variant
            : { label: "", value: "" };

    const displayImages = product.coverImage
        ? [product.coverImage, ...(product.images || []).filter(img => img !== product.coverImage)]
        : (product.images || []);

    return (
        <div
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            dir={isRTL ? "rtl" : "ltr"}
        >
            <div className="mb-6 space-y-3">
                <Breadcrumb
                    isRTL={isRTL}
                    items={[
                        { label: isRTL ? "الرئيسية" : "Home", href: `/${locale}` },
                        { label: isRTL ? "المتجر" : "Shop", href: `/${locale}/shop` },
                        { label: product.name },
                    ]}
                />
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className={cn("hover:bg-transparent hover:text-[#2D3247] p-0", {
                        "pl-0": !isRTL,
                        "pr-0": isRTL,
                    })}
                >
                    <ArrowLeft className="h-4 w-4 mx-2" />
                    {locale === "ar" ? "رجوع" : "Back"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <img
                            src={displayImages[selectedImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {displayImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={cn(
                                    "aspect-square rounded-lg overflow-hidden border transition-all",
                                    selectedImage === idx
                                        ? "border-gray-400"
                                        : "border-transparent opacity-70 hover:opacity-100"
                                )}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col py-2">
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="text-[#2D3247] bg-blue-50 hover:bg-blue-100">
                            {product.category?.[locale]}
                        </Badge>

                        {product.inStock ? (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                {locale === "ar" ? "متوفر" : "In Stock"}
                            </div>
                        ) : (
                            <Badge variant="destructive">
                                {locale === "ar" ? "غير متوفر" : "Out of Stock"}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-3xl font-bold text-[#2D3247] flex items-center">
                            <SaudiRiyal size={22} className="mr-1" />
                            {product.price.toLocaleString()}
                        </span>

                        <Separator orientation="vertical" className="h-6" />
                        <span className="text-sm text-gray-500 italic">
                            {locale === "ar" ? "لا توجد مراجعات" : "No reviews"}
                        </span>
                    </div>

                    {/* ========================================== */}
                    {/* TABBY PROMO DIV CONTAINER (Product Page) */}
                    {/* ========================================== */}
                    <div id="TabbyPromoProduct" className="w-full mb-6 bg-white rounded-md border border-gray-100 overflow-hidden shadow-sm"></div>

                    <div
                        className="text-gray-600 mb-8 leading-relaxed text-lg tiptap-content"
                        dangerouslySetInnerHTML={{
                            __html: product.short_description || "",
                        }}
                    />

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 bg-gray-50 p-6 rounded-lg">
                        <div>
                            <span className="text-sm text-gray-500">
                                {locale === "ar" ? "الخامة" : "Material"}
                            </span>
                            {(() => {
                                const arr = product.variant?.materials;
                                const mats = Array.isArray(arr) && arr.length > 0
                                    ? arr
                                    : (product.material || "").split(",").map((m) => m.trim()).filter(Boolean);
                                return mats.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {mats.map((m) => (
                                            <span key={m} className="text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                ) : <div className="font-medium">-</div>;
                            })()}
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                {locale === "ar" ? "الأحجام" : "Size"}
                            </span>
                            {(() => {
                                const sizes = Array.isArray(product.variant?.sizes) ? product.variant.sizes : [];
                                return sizes.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {sizes.map((s) => (
                                            <span key={s} className="text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                ) : <div className="font-medium">-</div>;
                            })()}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="flex items-center border border-gray-200 rounded-md">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Minus />
                            </Button>

                            <span className="w-12 text-center font-medium">{quantity}</span>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus />
                            </Button>
                        </div>

                        <Button
                            size="lg"
                            className="flex-1 text-base h-12 bg-[#2D3247] hover:bg-[#3c415a]"
                            onClick={() =>
                                addToCart(
                                    {
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.coverImage,
                                        coverImage: product.coverImage,
                                        category: product.category,
                                        material: product.material,
                                        short_description: product.short_description,
                                        variant: productVariant,
                                    },
                                    quantity,
                                    true 
                                )
                            }
                        >
                            {locale === "ar" ? "أضف إلى السلة" : "Add to Cart"} •{" "}
                            <SaudiRiyal className="inline-block mb-1" size={18} />{" "}
                            {product.price * quantity}
                        </Button>

                        <Button variant="outline" size="icon" className="h-12 w-12">
                            <Heart />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-[#2D3247]" />
                            {locale === "ar"
                                ? "شحن سريع داخل المملكة"
                                : "Fast delivery across KSA"}
                        </div>

                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-[#2D3247]" />
                            {locale === "ar" ? "ضمان سنتين" : "2 Year Warranty"}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Customer Reviews ===== */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {isRTL ? "تقييمات العملاء" : "Customer Reviews"}
                    {reviews.length > 0 && (
                        <span className="ml-2 text-base font-normal text-gray-500">({reviews.length})</span>
                    )}
                </h2>

                {reviewsLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 py-4"><Loader2 size={18} className="animate-spin" />{isRTL ? "جارٍ التحميل…" : "Loading…"}</div>
                ) : reviews.length === 0 ? (
                    <p className="text-gray-400 py-4">{isRTL ? "لا توجد تقييمات بعد." : "No reviews yet. Be the first!"}</p>
                ) : (
                    <div className="space-y-4 mb-8">
                        {reviews.map((r, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-gray-800">{r.name}</span>
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, s) => (
                                            <Star key={s} size={14} fill={s < (r.rating || 5) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">{r.comment}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Review form */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-gray-800">
                        {isRTL ? "أضف تقييمك" : "Write a Review"}
                    </h3>
                    {reviewDone ? (
                        <p className="text-emerald-600 font-medium">{isRTL ? "شكراً على تقييمك!" : "Thank you for your review!"}</p>
                    ) : (
                        <>
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">{isRTL ? "اسمك" : "Your Name"}</label>
                                <input
                                    value={reviewName}
                                    onChange={(e) => setReviewName(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247]"
                                    placeholder={isRTL ? "الاسم" : "Name"}
                                    dir={isRTL ? "rtl" : "ltr"}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">{isRTL ? "التقييم" : "Rating"}</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button key={s} onClick={() => setReviewRating(s)} className="text-yellow-400">
                                            <Star size={24} fill={s <= reviewRating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 mb-1 block">{isRTL ? "تعليقك" : "Your Comment"}</label>
                                <textarea
                                    rows={3}
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247] resize-none"
                                    placeholder={isRTL ? "شاركنا تجربتك…" : "Share your experience…"}
                                    dir={isRTL ? "rtl" : "ltr"}
                                />
                            </div>
                            <button
                                onClick={submitReview}
                                disabled={submitting || !reviewName.trim() || !reviewComment.trim()}
                                className="flex items-center gap-2 bg-[#2D3247] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3c415a] disabled:opacity-50 transition"
                            >
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                {isRTL ? "إرسال" : "Submit Review"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ===== Explore More Products ===== */}
            {related.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {isRTL ? "منتجات مشابهة" : "Explore More Products"}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {related.map((p) => (
                            <a
                                key={p.id}
                                href={`/${locale}/shop/${p.id}`}
                                className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={p.coverImage}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium text-gray-800 line-clamp-2">{p.name}</p>
                                    <p className="text-sm font-bold text-[#2D3247] mt-1 flex items-center gap-0.5">
                                        <SaudiRiyal size={14} />{p.price.toLocaleString()}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};