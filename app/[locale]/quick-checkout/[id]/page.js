"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";

export default function QuickCheckout() {
  const { id } = useParams();
  const { locale } = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!id || !locale) return;

    async function go() {
      try {
        const res = await fetch(`/api/shop/product/${id}?locale=${locale}`);
        const json = await res.json();
        const product = json.data;

        if (!product) {
          router.replace(`/${locale}/shop`);
          return;
        }

        const cartItem = [
          {
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
          },
        ];

        localStorage.setItem("cart", JSON.stringify(cartItem));
        router.replace(`/${locale}/checkout`);
      } catch {
        router.replace(`/${locale}/shop`);
      }
    }

    go();
  }, [id, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#2D3247] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#2D3247] font-semibold text-lg">Preparing your order…</p>
        <p className="text-gray-400 text-sm">You'll be redirected to checkout shortly.</p>
      </div>
    </div>
  );
}
