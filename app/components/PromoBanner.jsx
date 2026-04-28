"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useLocale } from "@/app/components/LocaleProvider";

export default function PromoBanner() {
  const { data } = usePageContent();
  const { locale } = useLocale();
  const [dismissed, setDismissed] = useState(true);

  const banner = data?.promoBanner;

  useEffect(() => {
    if (!banner?.isActive) return;
    const key = `promo_dismissed_${banner.textEn?.slice(0, 20)}`;
    const wasDismissed = sessionStorage.getItem(key);
    if (!wasDismissed) setDismissed(false);
  }, [banner]);

  if (!banner?.isActive || dismissed) return null;

  const text = locale === "ar" ? (banner.textAr || banner.textEn) : (banner.textEn || banner.textAr);
  if (!text) return null;

  const dismiss = () => {
    const key = `promo_dismissed_${banner.textEn?.slice(0, 20)}`;
    sessionStorage.setItem(key, "1");
    setDismissed(true);
  };

  const content = (
    <span className="font-medium text-sm">
      {text}
    </span>
  );

  return (
    <div
      className="relative flex items-center justify-center px-10 py-2.5 text-center"
      style={{ backgroundColor: banner.bgColor || "#2D3247", color: banner.textColor || "#ffffff" }}
    >
      {banner.link ? (
        <a href={banner.link} className="hover:underline">{content}</a>
      ) : content}

      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
