"use client";

import { useEffect, useState } from "react";
import { ProductDetails } from "@/app/components/app/ProductDetail";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { FloatingCartButton } from "@/app/components/FloatingCartButton";
import Script from "next/script";

export default function ProductPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const id = pathname.split("/").pop();
  const buyNow = searchParams.get("buyNow") === "1";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/shop/product/${id}?locale=${locale}`);
        const json = await res.json();
        setProduct(json.data || null);
      } catch (error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, locale]);

  // Direct checkout: write product to cart in localStorage then redirect
  useEffect(() => {
    if (!product || !buyNow) return;
    const cartItem = [{
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.coverImage,
      coverImage: product.coverImage,
      category: product.category,
      material: product.material,
      short_description: product.short_description,
      variant: null,
      quantity: 1,
    }];
    localStorage.setItem("cart", JSON.stringify(cartItem));
    router.replace(`/${locale}/checkout`);
  }, [product, buyNow]);

  // Tabby Point 3: Initialize the snippet once the product is loaded
  useEffect(() => {
    if (product && typeof window !== "undefined" && window.TabbyPromo) {
      // Added a small delay to ensure ProductDetails has rendered the target div
      const timer = setTimeout(() => {
        new window.TabbyPromo({
          selector: '#tabby-promo-snippet', // IMPORTANT: Ensure this ID is used for the container inside your ProductDetails component
          currency: 'SAR',
          price: product.price,
          installmentsCount: 4,
          lang: locale,
          publicKey: process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY,
          merchantCode: process.env.NEXT_PUBLIC_TABBY_MERCHANT_CODE || 'ACI'
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [product, locale]);

  return (
    <>
      <Script 
        src="https://checkout.tabby.ai/tabby-promo.js" 
        strategy="afterInteractive" 
      />
      
      <ProductDetails
        product={product}
        loading={loading}
        onBack={() => router.push(`/${locale}/shop`)}
        onNavigateProduct={(pid) => router.push(`/${locale}/shop/${pid}`)}
      />
      <FloatingCartButton />
    </>
  );
}