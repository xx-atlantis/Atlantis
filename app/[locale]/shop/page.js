"use client";

import React, { useState, useEffect } from "react";
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
  const isRTL = locale === "ar";
  const router = useRouter();
  const { isCartOpen } = useCart();

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
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-white">
      <ShopPage
        products={products}
        loading={loading}
        error={error}
        onProductClick={navigateToProduct}
        content={shopContent}
      />
      <FloatingCartButton />
      <CartDrawer />
    </div>
  );
};

export default Shop;
