"use client";

import React from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function ContactUs() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const contact = data?.contactus;
  const form = contact?.form || {};

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-[75vh] md:min-h-[90vh] overflow-hidden mx-4 sm:mx-8 md:mx-16 my-6 sm:my-10 md:my-12 rounded-lg flex items-center justify-center"
    >
      {/* ===== Background Image ===== */}
      <Image
        src={contact?.heroImage || "/hero.jpg"}
        alt="Interior design background"
        fill
        className="object-cover object-center"
        priority
      />

      {/* ===== Overlay Card ===== */}
      <div
        className={`absolute z-10 bg-white/95 shadow-2xl rounded-2xl 
          ${isRTL ? "sm:right-10 md:right-16" : "sm:right-10 md:right-16"}
          max-w-2xs md:max-w-md p-5 sm:p-8 md:p-10 flex flex-col justify-center backdrop-blur-sm`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
          <img
            src="/logo.png"
            alt="Atlantis Logo"
            width={45}
            height={45}
            className="sm:w-[50px] md:w-[55px]"
          />
          <span className="font-semibold text-gray-700 text-sm sm:text-base md:text-lg">
            {contact?.brand || "Atlantis"}
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-center text-lg sm:text-xl md:text-2xl font-semibold leading-snug text-gray-900 mb-6">
          {contact?.mainTitle}
        </h1>

        {/* ===== Form ===== */}
        <form className="space-y-3 sm:space-y-4">
          <input
            type="text"
            placeholder={form?.name}
            className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-[#2D3247]/40 focus:outline-none text-sm sm:text-base"
          />
          <input
            type="email"
            placeholder={form?.email}
            className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-[#2D3247]/40 focus:outline-none text-sm sm:text-base"
          />
          <input
            type="text"
            placeholder={form?.subject}
            className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-[#2D3247]/40 focus:outline-none text-sm sm:text-base"
          />
          <textarea
            rows="4"
            placeholder={form?.message}
            className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-[#2D3247]/40 focus:outline-none resize-none text-sm sm:text-base"
          ></textarea>

          <button
            type="submit"
            className="bg-[#2D3247] text-white w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-[#1e2231] transition"
          >
            {form?.button}
          </button>
        </form>
      </div>

      <div className="absolute inset-0 bg-black/20 z-0"></div>
    </section>
  );
}
