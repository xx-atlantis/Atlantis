"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function FAQ() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const faqData = data?.faq; // whole FAQ block
  const faqs = faqData?.items || []; // FAQ list array

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqData) return null; // wait if provider hasn't loaded

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-14 sm:py-20 px-4 sm:px-8 md:px-16 bg-white flex flex-col items-center"
    >
      {/* ===== Header ===== */}
      <p className="text-xs sm:text-sm text-[#6D9494] uppercase tracking-wide font-semibold mb-2">
        {faqData?.smallTitle}
      </p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
        {faqData?.mainTitle}
      </h2>

      {/* ===== FAQ Container ===== */}
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {faqs.map((item, index) => (
          <div key={index} className="border-b last:border-b-0">
            {/* ===== Question Header ===== */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-5 sm:px-8 py-4 sm:py-5 text-left transition-all duration-200 bg-white"
            >
              <span className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
                {item?.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transform transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ===== Answer Section ===== */}
            <div
              className={`transition-all duration-300 overflow-hidden bg-gray-100 ${
                openIndex === index ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <div className="px-5 sm:px-8 py-5 sm:py-6 text-gray-700 text-sm sm:text-base leading-relaxed bg-[#8aadad2b]">
                {item?.answer?.includes("<br>") ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: item.answer,
                    }}
                  />
                ) : (
                  <p>{item?.answer}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
