"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { HowItWorksSVG } from "@/app/components/icons/StepIcons";

export default function HowItWorks() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const how = data?.howitworks || {};
  const steps = how?.steps || [];

  // Support "First part ||accent part" in CMS mainTitle for the colored split
  const rawTitle = how.mainTitle || "";
  const titleSplit = rawTitle.includes("||") ? rawTitle.split("||").map((s) => s.trim()) : null;
  const titleMain = titleSplit ? titleSplit[0] : rawTitle;
  const titleAccent = titleSplit ? titleSplit[1] : null;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-white overflow-hidden"
    >
      {/* ── Desktop: pixel-perfect Figma SVG ── */}
      <div className="hidden md:block w-full max-w-[1120px] mx-auto px-6 py-12">
        <HowItWorksSVG className="w-full h-auto" />
      </div>

      {/* ── Mobile: CMS-driven stacked layout ── */}
      <div className="md:hidden py-12 px-6">
        {/* Title */}
        <div className="text-center mb-10">
          <p className="text-sm text-[#6D9494] font-semibold tracking-widest uppercase mb-3">
            {how.smallTitle}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 leading-snug max-w-sm mx-auto">
            {titleMain}
            {titleAccent && (
              <>
                {" "}
                <span style={{ color: "#363b53" }}>{titleAccent}</span>
              </>
            )}
          </h2>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-10 max-w-lg mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6D9494] text-white flex items-center justify-center font-bold text-lg">
                {i + 1}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
