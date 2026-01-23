"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShopPage } from "../../components/app/ShopPage";
import { CartDrawer } from "../../components/app/CartDrawer";
import { FloatingCartButton } from "@/app/components/FloatingCartButton";

import { usePageContent } from "@/app/context/PageContentProvider";
import { useLocale } from "@/app/components/LocaleProvider";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

const Shop = () => {
  const { data } = usePageContent();
  const shopContent = data?.shop; 

  const { locale } = useLocale();
  const isRTL = locale === "ar"; // <--- 1. Detect Direction
  const router = useRouter();

  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    toggleCart,
  } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch(`/api/shop/product?locale=${locale}`);
        const json = await res.json();
        if (json.success) setProducts(json.data);
        else setError(json.error || "Failed to load products");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [locale]);

  const navigateToProduct = (id) => {
    router.push(`/${locale}/shop/${id}`);
    window.scrollTo(0, 0);
  };

  return (
    // <--- 2. Added 'dir' here so the whole page (including scrollbars/text) respects language
    <div 
      dir={isRTL ? "rtl" : "ltr"} 
      className="flex flex-col min-h-screen bg-gray-50 text-gray-900"
    >
      <main className="grow">
        
        {/* ========================================= */}
        {/* START: STYLED HERO SECTION (RTL SUPPORT)  */}
        {/* ========================================= */}
        <section className="relative min-h-[30vh] md:min-h-[50vh] overflow-hidden mx-4 sm:mx-8 md:mx-16 my-6 sm:my-10 md:my-12 rounded-lg flex items-center justify-center">
          
          <Image
            src={shopContent?.heroImage || "/shop-banner.jpg"}
            alt="Shop Background"
            fill
            className="object-cover object-center"
            priority
          />

          {/* 3. Floating Card Position Logic */}
          <div
            className={`absolute z-10 bg-white/95 shadow-2xl rounded-2xl 
                max-w-2xs md:max-w-md
                p-5 sm:p-8 md:p-10 flex flex-col justify-center 
                backdrop-blur-sm
                /* If Arabic: align right. If English: align left. */
                ${isRTL ? "sm:right-10 md:right-16 text-right items-end" : "sm:left-10 md:left-16 text-left items-start"}
            `}
          >
            {/* Logo + Brand Name */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <img src="/logo.png" alt="Logo" width={40} height={40} /> 
              <span className="font-semibold text-gray-700 text-sm sm:text-base md:text-lg">
                {shopContent?.brand || "Atlantis"}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-bold text-gray-900 text-xl sm:text-2xl md:text-3xl leading-tight">
              {shopContent?.heroTitle || (isRTL ? "مجموعتنا الحصرية" : "Our Exclusive Collection")}
            </h1>
            
            {/* Subtitle */}
            <p className={`mt-2 text-gray-600 text-sm md:text-base ${isRTL ? "text-right" : "text-left"}`}>
              {shopContent?.heroSubtitle || (isRTL ? "اكتشف أفضل المنتجات المختارة بعناية لك." : "Discover premium products curated just for you.")}
            </p>
          </div>

          <div className="absolute inset-0 bg-black/20 z-0"></div>
        </section>
        {/* ========================================= */}
        {/* END: STYLED HERO SECTION                  */}
        {/* ========================================= */}

        <ShopPage
          products={products}
          loading={loading}
          error={error}
          onProductClick={navigateToProduct}
          content={shopContent}
          isRTL={isRTL} // Pass RTL prop down if ShopPage needs it for grid alignment
        />
      </main>

      <FloatingCartButton />
      <CartDrawer />
    </div>
  );
};

export default Shop;