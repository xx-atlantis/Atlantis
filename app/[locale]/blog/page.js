"use client";

import React from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider"; // ⬅ import CMS context
import BlogSection from "@/app/components/app/BlogSection";
import LoadingScreen from "@/app/components/Loading";

export default function BlogPage() {
  const { locale } = useLocale();
  const { data, loading, error } = usePageContent(); // ⬅ shared API-based content

  if (loading) return <LoadingScreen />;
  if (error) return <p className="text-red-600 text-center py-10">{error}</p>;

  const isRTL = locale === "ar";

  const blogData = data?.blog?.section; // ⬅ safely access blog content
  const pageTitle =
    blogData?.mainTitle || (isRTL ? "مدونة التصميم" : "Design Blog");

  const heroImage = blogData?.heroImage;

  return (
    <div>
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="relative min-h-[75vh] md:min-h-[90vh] overflow-hidden mx-4 sm:mx-8 md:mx-16 my-6 sm:my-10 md:my-12 rounded-lg flex items-center justify-center"
      >
        {/* ===== Background Image ===== */}
        <Image
          src={heroImage}
          alt="Interior design background"
          fill
          className="object-cover object-center"
          priority
        />

        {/* ===== Overlay Card ===== */}
        <div
          className={`relative z-10 max-w-2xs md:max-w-md p-5 sm:p-8 md:p-10 flex flex-col justify-center text-center`}
        >
          <h1 className="text-white text-lg sm:text-xl md:text-4xl font-semibold leading-snug mb-6">
            {pageTitle}
          </h1>
        </div>

        <div className="absolute inset-0 bg-black/30 z-0" />
      </section>

      {/* ===== Blog Section from CMS ===== */}
      <BlogSection />
    </div>
  );
}
