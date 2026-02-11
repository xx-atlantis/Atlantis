"use client";

import { Globe } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const AdminSidebar = ({ collapsed, setCollapsed, locale, toggleLocale, setMenuOpen, newPath }) => {
  const [pages] = useState([
    {
      id: 1,
      slug: "/admin",
      languages: {
        en: { title: "Home" },
        ar: { title: "الصفحة الرئيسية" },
      },
    },
    {
      id: 2,
      slug: "/admin/about-us",
      languages: {
        en: { title: "About Us" },
        ar: { title: "من نحن" },
      },
    },
    {
      id: 3,
      slug: "/admin/contact-us",
      languages: {
        en: { title: "Contact Us" },
        ar: { title: "اتصل بنا" },
      },
    },
    {
      id: 4,
      slug: "/admin/portfolio",
      languages: {
        en: { title: "Portfolio" },
        ar: { title: "اتصل بنا" },
      },
    },
    {
      id: 5,
      slug: "/admin/blog",
      languages: {
        en: { title: "Blog" },
        ar: { title: "اتصل بنا" },
      },
    },
  ]);

  const [selectedPageId, setSelectedPageId] = useState(pages[0].id);

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-72"
      } border-r border-border bg-white flex flex-col transition-all duration-200`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Top header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-800">
            {locale === "ar" ? "لوحة التحكم" : "CMS Admin"}
          </h1>
        )}
        <Link
              href={newPath}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100 transition"
            >
              <Globe size={16} />
              <span>{locale === "ar" ? "English" : "العربية"}</span>
            </Link>
      </div>

      {/* Pages list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {pages.map((page) => {
            const label =
              locale === "ar"
                ? page.languages.ar.title
                : page.languages.en.title;

            const isActive = selectedPageId === page.id;

            return (
              <Link
                key={page.id}
                href={`/${locale}/${page.slug}`}
                onClick={() => setSelectedPageId(page.id)}
                className={`block p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                }`}
              >
                <div className="font-medium text-sm">{label}</div>
                <div
                  className={`text-xs ${
                    isActive ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {page.slug.replace("/admin", "") || "/"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom locale switcher */}
      {/* <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <button
            onClick={toggleLocale}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {locale === "en" ? "عربي" : "English"}
          </button>
        )}
      </div> */}
    </div>
  );
};

export default AdminSidebar;
