"use client";

import { useEffect, useState } from "react";
import { ProductDetails } from "@/app/components/app/ProductDetail";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { FloatingCartButton } from "@/app/components/FloatingCartButton";
import Script from "next/script"; // <-- IMPORTANT IMPORT

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

  return (
    <>
      {/* Load Tabby Script so ProductDetails can use it */}
      <Script src="https://checkout.tabby.ai/tabby-promo.js" strategy="lazyOnload" />
      
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