"use client";
import React from "react";
import { useLocale } from "@/app/components/LocaleProvider";
import { Mail, Phone } from "lucide-react";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function TermsAndCondition() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const content = data?.termsandconditions;

  if (!content) return null; // prevents crashing while data loads

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-14 sm:py-20 px-4 sm:px-8 md:px-24 bg-white text-gray-800"
    >
      {/* ===== Page Title ===== */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-12 text-gray-900">
        {content.title}
      </h1>

      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        {content.sections?.map((section, i) => (
          <div key={i}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3">
              {section.heading}
            </h2>

            {section.description && (
              <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed mb-4">
                {section.description}
              </p>
            )}

            {section.list && (
              <ul className="list-disc list-inside text-sm sm:text-base text-[#9CA3AF] space-y-1 mb-4">
                {section.list.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}

            {section.subsections?.map((sub, j) => (
              <div key={j} className="mb-5">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {sub.title}
                </h3>
                <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
                  {sub.text}
                </p>
              </div>
            ))}
          </div>
        ))}

        {/* ===== Security Section ===== */}
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3">
            {content.security.heading}
          </h2>
          <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
            {content.security.description}
          </p>
        </div>

        {/* ===== Contact Section ===== */}
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3">
            {content.contact.heading}
          </h2>

          <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed mb-4">
            {content.contact.description}
          </p>

          <div className="space-y-2">
            <p className="font-semibold text-gray-900">
              {content.contact.team}
            </p>

            <div className="flex items-center gap-2 text-sm sm:text-base text-[#9CA3AF]">
              <Mail className="w-4 h-4 text-[#6D9494]" />
              <a
                href={`mailto:${content.contact.email}`}
                className="hover:underline"
              >
                {content.contact.email}
              </a>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base text-[#9CA3AF]">
              <Phone className="w-4 h-4 text-[#6D9494]" />
              <span>{content.contact.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
