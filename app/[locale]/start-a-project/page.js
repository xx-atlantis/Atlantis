"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function StartProjectTypePage() {
  const router = useRouter();
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const content = data?.startproject;
  const kinds = content?.kinds || [];

  // ==========================================
  // FIX: Force Exact Sort Order (Room -> Apartment -> Villa)
  // ==========================================
  const sortedKinds = useMemo(() => {
    const sortOrder = ["room", "apartment", "villa"];
    
    return [...kinds].sort((a, b) => {
      // safely lowercase to match the sortOrder array exactly
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      
      const indexA = sortOrder.indexOf(nameA);
      const indexB = sortOrder.indexOf(nameB);

      // If both are in our sortOrder list, arrange them by index
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If A is in the list but B is not, A comes first
      if (indexA !== -1) return -1;
      // If B is in the list but A is not, B comes first
      if (indexB !== -1) return 1;
      
      return 0; // fallback if neither is in the list
    });
  }, [kinds]);

  const handleSelectType = (type) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("start_project_selected_type_v1", type);
    }
    router.push(`/${locale}/start-a-project/${type}`);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[80vh] flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* HEADER SECTION */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            {content?.mainTitle || "Start Your Interior Design Project"}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {content?.subtitle || "Choose the type of property you want to design."}
          </p>
        </div>

        {/* GRID LIST - Now using sortedKinds */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedKinds.map((item) => (
            <button
              key={item.name}
              onClick={() => handleSelectType(item.name)}
              className="group relative flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden text-start"
            >
              {/* IMAGE CONTAINER */}
              {item.image && (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                  {/* Subtle Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}

              {/* CONTENT */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-theme transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>

                {/* ACTION BUTTON */}
                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-primary-theme">
                  <span className="uppercase tracking-wider">
                    {locale === "ar" ? "متابعة" : "Continue"}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}