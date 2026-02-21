"use client";

import { useEffect, useState } from "react";
import { ProductDetails } from "@/app/components/app/ProductDetail";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { FloatingCartButton } from "@/app/components/FloatingCartButton";
import Script from "next/script";

export default function ProductPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const id = pathname.split("/").pop();

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

  // Tabby Point 3: Initialize the snippet once the product is loaded
  useEffect(() => {
    if (product && typeof window !== "undefined" && window.TabbyPromo) {
      new window.TabbyPromo({
        selector: '#tabby-promo-snippet', // Ensure this ID exists in ProductDetails component
        currency: 'SAR',
        price: product.price,
        installmentsCount: 4,
        lang: locale,
        publicKey: 'pk_test_YOUR_ACTUAL_TEST_KEY', // Replace with your Tabby Public Test Key
        merchantCode: 'atlantis' // Usually provided by Tabby
      });
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
      
      {/* Tabby Point 3: The snippet container */}
      <div id="tabby-promo-snippet"></div>

      <FloatingCartButton />
    </>
  );
}