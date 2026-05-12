"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/app/components/LocaleProvider";
import { Tag, Calendar, ArrowRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function CouponBadge({ code, isRTL }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 border-2 border-dashed border-[#2D3247]/40 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold text-[#2D3247] hover:border-[#2D3247] hover:bg-[#2D3247]/5 transition"
    >
      <Tag size={13} />
      {code}
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="opacity-50" />}
    </button>
  );
}

export default function PromotionsPage() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then(({ data }) => setPromotions(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const t = (en, ar) => (isRTL ? ar : en);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#2D3247] text-white px-4 sm:px-8 md:px-10 py-14 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest font-semibold text-white/60 mb-3">
            {t("Limited Time Offers", "عروض لفترة محدودة")}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            {t("Exclusive Promotions", "العروض الحصرية")}
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto">
            {t(
              "Discover our latest deals and special offers on premium interior design products.",
              "اكتشف أحدث صفقاتنا وعروضنا الخاصة على منتجات التصميم الداخلي الفاخرة."
            )}
          </p>
        </div>
      </div>

      {/* Promotions grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-12 md:py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse aspect-[4/3]" />
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-[#F5F3EF] flex items-center justify-center mx-auto mb-4">
              <Tag size={24} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-500">
              {t("No active promotions right now.", "لا توجد عروض نشطة في الوقت الحالي.")}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {t("Check back soon for exclusive deals.", "تفقد مجدداً قريباً للحصول على صفقات حصرية.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => {
              const title = isRTL ? promo.titleAr : promo.titleEn;
              const desc = isRTL ? promo.descAr : promo.descEn;
              const badge = isRTL ? promo.badgeAr : promo.badgeEn;
              const expired = promo.validUntil && new Date(promo.validUntil) < new Date();

              return (
                <div
                  key={promo.id}
                  className={`group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${expired ? "opacity-60" : ""}`}
                >
                  {/* Image */}
                  <div className="relative bg-[#F5F3EF] aspect-[16/9] overflow-hidden">
                    {promo.image ? (
                      <Image
                        src={promo.image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Tag size={40} className="text-gray-200" />
                      </div>
                    )}
                    {badge && (
                      <div className="absolute top-3 start-3">
                        <span className="bg-[#2D3247] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          {badge}
                        </span>
                      </div>
                    )}
                    {expired && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                          {t("Expired", "منتهي")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{title}</h3>
                    {desc && <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{desc}</p>}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {promo.couponCode && !expired && (
                        <CouponBadge code={promo.couponCode} isRTL={isRTL} />
                      )}
                      {promo.validUntil && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Calendar size={11} />
                          {t("Valid until", "صالح حتى")} {new Date(promo.validUntil).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>

                    {promo.link && !expired && (
                      <Link
                        href={promo.link}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2D3247] hover:underline mt-1"
                      >
                        {t("Shop Now", "تسوق الآن")}
                        <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
