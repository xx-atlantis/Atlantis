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
  const [collections, setCollections] = useState([]);
  const [servicePackages, setServicePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, colRes, pkgRes] = await Promise.all([
          fetch(`/api/shop/product?locale=${locale}&shopOnly=true`).then((r) => r.json()),
          fetch("/api/collections").then((r) => r.json()),
          fetch(`/api/content?page=packages&locale=${locale}`).then((r) => r.json()),
        ]);
        if (prodRes.success) setProducts(prodRes.data);
        else setError(prodRes.error || "Failed to load products");
        setCollections(colRes.data || []);

        // Filter packages that have showInShop enabled
        const pkgList = pkgRes?.packages?.list || [];
        setServicePackages(pkgList.filter((p) => p.showInShop === true));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [locale]);

  const navigateToProduct = (id) => {
    router.push(`/${locale}/shop/${id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-white">
      <ShopPage
        products={products}
        collections={collections}
        servicePackages={servicePackages}
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
