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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "../../../lib/utils";
import { ProductSkeleton } from "../ProductSkeleton";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCart } from "@/app/context/CartContext";

export const ProductDetails = ({ product, onBack, loading }) => {
    const { locale } = useLocale();
    const isRTL = locale === "ar";

    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

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
            publicKey: 'YOUR_TABBY_PUBLIC_KEY', // <-- IMPORTANT: Replace with your actual Public Key
            merchantCode: 'ACI'
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

    const displayImages = product.images?.length > 0 ? product.images : [product.coverImage];

    return (
        <div
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            dir={isRTL ? "rtl" : "ltr"}
        >
            <Button
                variant="ghost"
                onClick={onBack}
                className={cn("mb-6 hover:bg-transparent hover:text-[#2D3247]", {
                    "pl-0": !isRTL,
                    "pr-0": isRTL,
                })}
            >
                <ArrowLeft className="h-4 w-4 mx-2" />
                {locale === "ar" ? "رجوع" : "Back"}
            </Button>

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
                            <div className="font-medium">{product.material || "-"}</div>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                {productVariant.label || (locale === "ar" ? "خيار" : "Option")}
                            </span>
                            <div className="font-medium">{productVariant.value || "-"}</div>
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
        </div>
    );
};