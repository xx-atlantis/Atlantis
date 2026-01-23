"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

import PortfolioSection from "@/app/components/app/PortfolioSection";
import ProjectsShowcase from "@/app/components/app/ProjectShowcase";
import LoadingScreen from "@/app/components/Loading";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function PortfolioPage() {
  const { locale } = useLocale();
  const { data, loading, error } = usePageContent(); // ⬅ Shared CMS data context

  if (loading) return <LoadingScreen />; // Global loading
  if (error) return <p className="text-center text-red-600 py-10">{error}</p>;

  const isRTL = locale === "ar";

  const portfolio = data?.portfolio || {};
  const tabs = portfolio?.tabs || {};
  const sections = portfolio?.sections || {};

  const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();

const initialTab = searchParams.get("tab") || "modern";
const [activeTab, setActiveTab] = useState(initialTab);

const handleTabChange = (newTab) => {
  setActiveTab(newTab);

  const params = new URLSearchParams();
  params.set("tab", newTab);

  router.push(`${pathname}?${params.toString()}`, { scroll: false });
};

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="w-full py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* ===== Page Title ===== */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-10 text-gray-800">
          {portfolio?.title ||
            (isRTL ? "أنماط التصميم لدينا" : "Our Design Styles")}
        </h1>

        {/* ===== Tabs ===== */}
        <Tabs defaultValue={activeTab} className="w-full ">
          <TabsList className="flex flex-wrap justify-center gap-2 mb-10 bg-transparent">
            {Object.entries(tabs).map(([key, label]) => (
              <TabsTrigger
                key={key}
                value={key}
                onClick={() => handleTabChange(key)}
                className={`border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-100 transition
                  data-[state=active]:bg-[#6B7C73] data-[state=active]:text-white data-[state=active]:border-[#6B7C73]
                  ${
                    activeTab === key
                      ? "bg-[#6B7C73] text-white border-[#6B7C73]"
                      : ""
                  }`}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ===== Dynamic portfolio content ===== */}
          <PortfolioSection data={sections[activeTab]} />
        </Tabs>
      </div>

      {/* ===== Global Projects Showcase ===== */}
      <ProjectsShowcase />
    </section>
  );
}
