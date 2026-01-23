"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function StartProjectTypePage() {
  const router = useRouter();
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  // 🔥 CMS Data
  const content = data?.startproject;
console.log("start a project page 1" , content);
  const kinds = content?.kinds || [];

  const handleSelectType = (type) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("start_project_selected_type_v1", type);
    }

    router.push(`/${locale}/start-a-project/${type}`);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-4 sm:mx-8 md:mx-16 my-6 sm:my-10"
    >
      <div className="max-w-8xl mx-auto">
        {/* TITLE */}
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 text-center">
          {content?.mainTitle || "Start a new project"}
        </h1>

        {/* SUBTITLE */}
        <p className="text-gray-600 text-sm sm:text-base mb-8 text-center">
          {content?.subtitle ||
            "Choose the type of space you want us to work on."}
        </p>

        {/* GRID LIST */}
        <div className="grid gap-6 sm:grid-cols-3">
          {kinds.map((item) => (
            <button
              key={item.name}
              onClick={() => handleSelectType(item.name)}
              className="group bg-white rounded-2xl border border-gray-200 hover:border-primary-theme shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col text-left"
            >
              {item.image && (
                <div className="h-32 sm:h-36 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-1">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-3 text-sm font-medium text-primary-theme group-hover:underline">
                  {locale === "ar" ? "متابعة" : "Continue"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
