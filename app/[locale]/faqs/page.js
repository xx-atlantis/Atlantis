"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

const FALLBACK = {
  en: {
    smallTitle: "FAQ",
    mainTitle: "Let us Help you",
    items: [
      {
        question: "What design services do you offer?",
        answer: "We offer space planning, concept development, 3D visualization, VR simulation, shop drawings, and bill of quantities (BOQ) to cover every stage of your interior design project.",
      },
      {
        question: "Who are the team I can rely on with this project?",
        answer: "Our team consists of professional interior designers, architects, and 3D visualization experts with years of experience in residential and commercial design projects.",
      },
      {
        question: "When will we work on my project?",
        answer: "We start your project immediately after confirmation of details and payment. Our team will stay in touch to share updates throughout the process.",
      },
      {
        question: "How long will it take to complete my project? What if I'm in a hurry?",
        answer: "Project duration depends on size and complexity. Typically, small projects take 2–4 weeks, while larger ones may take longer. For urgent cases, we offer fast-track design services with dedicated resources.",
      },
    ],
  },
  ar: {
    smallTitle: "أسئلة شائعة",
    mainTitle: "دعنا نساعدك",
    items: [
      {
        question: "ما هي الخدمات التصميمية التي تقدمها؟",
        answer: "نقدم خدمات تخطيط الفراغات، وتطوير المفهوم التصميمي، والتصور ثلاثي الأبعاد، ومحاكاة الواقع الافتراضي، ورسومات التنفيذ، وجدول الكميات (BOQ) لتغطية كل مراحل مشروع التصميم الداخلي.",
      },
      {
        question: "من هو الفريق الذي يمكنني الاعتماد عليه في هذا المشروع؟",
        answer: "يتكون فريقنا من مصممين داخليين محترفين ومعماريين وخبراء في التصور ثلاثي الأبعاد، يمتلكون سنوات من الخبرة في مشاريع التصميم السكني والتجاري.",
      },
      {
        question: "متى ستبدأون العمل على مشروعي؟",
        answer: "نبدأ العمل على مشروعك فور تأكيد التفاصيل وإتمام الدفع. سيبقى فريقنا على تواصل معك لمشاركة آخر المستجدات طوال مراحل المشروع.",
      },
      {
        question: "كم من الوقت سيستغرق إتمام مشروعي؟ ماذا لو كنت في عجلة من أمري؟",
        answer: "تعتمد مدة المشروع على حجمه وتعقيده. عادةً تستغرق المشاريع الصغيرة من أسبوعين إلى أربعة أسابيع، بينما قد تستغرق المشاريع الكبيرة وقتًا أطول. في حالات الاستعجال، نقدم خدمات تصميم سريعة بموارد مخصصة.",
      },
    ],
  },
};

export default function FAQ() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const faqData = data?.faq || FALLBACK[locale] || FALLBACK.en;
  const faqs = faqData?.items || [];

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-14 sm:py-20 px-4 sm:px-8 md:px-16 bg-white flex flex-col items-center"
    >
      <p className="text-xs sm:text-sm text-[#6D9494] uppercase tracking-wide font-semibold mb-2">
        {faqData?.smallTitle}
      </p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
        {faqData?.mainTitle}
      </h2>

      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {faqs.map((item, index) => (
          <div key={index} className="border-b last:border-b-0">
            <button
              onClick={() => toggleFAQ(index)}
              className={`w-full flex justify-between items-center px-5 sm:px-8 py-4 sm:py-5 ${isRTL ? "text-right" : "text-left"} transition-all duration-200 bg-white`}
            >
              <span className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
                {item?.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 shrink-0 transform transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden bg-gray-100 ${
                openIndex === index ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <div className="px-5 sm:px-8 py-5 sm:py-6 text-gray-700 text-sm sm:text-base leading-relaxed bg-[#8aadad2b]">
                {item?.answer?.includes("<br>") ? (
                  <div dangerouslySetInnerHTML={{ __html: item.answer }} />
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
