"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "@/app/components/LocaleProvider";

const FAQS = {
  en: {
    label: "FAQ",
    heading: "Let us Help you",
    items: [
      {
        question: "What design services do you offer?",
        answer: (
          <>
            <p className="mb-2">We can offer a wide range of design services, including:</p>
            <ol className="list-decimal list-inside space-y-1 mb-3">
              <li><b>Space Planning:</b> Creating an effective space layout, taking into account customer requirements and available space.</li>
              <li><b>Concept Development:</b> Working with the client to develop a design concept that suits their style, needs, and budget.</li>
              <li><b>3D Shots:</b> Creating visual renderings of the design concept.</li>
              <li><b>Virtual Reality Simulation (VR):</b> Allows you to enter your design and experience it as if it were already built — helping you make necessary changes before starting construction.</li>
              <li><b>Shop Drawings:</b> Preparation of detailed technical drawings showing exact dimensions, materials, and construction details.</li>
            </ol>
            <p><b>Bill of Quantities (BOQ):</b> Preparing a detailed list of all materials, labor, and other costs involved in the project.</p>
          </>
        ),
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
    label: "أسئلة شائعة",
    heading: "دعنا نساعدك",
    items: [
      {
        question: "ما هي الخدمات التصميمية التي تقدمها؟",
        answer: (
          <>
            <p className="mb-2">نقدم مجموعة واسعة من خدمات التصميم، تشمل:</p>
            <ol className="list-decimal list-inside space-y-1 mb-3">
              <li><b>تخطيط الفراغات:</b> إنشاء تخطيط فعّال للمساحة مع مراعاة متطلبات العميل والمساحة المتاحة.</li>
              <li><b>تطوير المفهوم التصميمي:</b> العمل مع العميل لتطوير مفهوم تصميمي يناسب أسلوبه واحتياجاته وميزانيته.</li>
              <li><b>التصوير ثلاثي الأبعاد:</b> إنشاء تصورات مرئية للمفهوم التصميمي.</li>
              <li><b>محاكاة الواقع الافتراضي (VR):</b> تتيح لك الدخول إلى تصميمك وتجربته كما لو كان مبنيًا فعلًا، مما يساعدك على إجراء التعديلات اللازمة قبل البدء في التنفيذ.</li>
              <li><b>رسومات التنفيذ:</b> إعداد رسومات تقنية تفصيلية توضح الأبعاد الدقيقة والمواد وتفاصيل البناء.</li>
            </ol>
            <p><b>جدول الكميات (BOQ):</b> إعداد قائمة تفصيلية بجميع المواد والعمالة والتكاليف الأخرى المتعلقة بالمشروع.</p>
          </>
        ),
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

export default function FaqSection() {
  const { locale } = useLocale();
  const [openIndex, setOpenIndex] = useState(0);

  const faq = FAQS[locale] || FAQS.en;
  const isRTL = locale === "ar";

  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full py-12 sm:py-16 px-4 sm:px-8 md:px-16 flex flex-col items-center"
    >
      <div className="text-center mb-10">
        <p className="text-sm font-semibold text-[#5E7E7D] mb-2">{faq.label}</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">{faq.heading}</h2>
      </div>

      <div className="w-full max-w-7xl bg-white rounded-xl shadow-sm overflow-hidden">
        {faq.items.map((item, index) => (
          <div key={index} className="border-b border-gray-200">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left px-5 sm:px-8 py-4 sm:py-5 text-gray-900 font-medium focus:outline-none"
            >
              <span>{item.question}</span>
              {openIndex === index ? (
                <ChevronUp className="text-gray-500 shrink-0" size={20} />
              ) : (
                <ChevronDown className="text-gray-500 shrink-0" size={20} />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <div className="px-5 sm:px-8 py-4 bg-[#6D94942B] text-gray-700 text-sm sm:text-base leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
