"use client";

import "../../globals.css";
import { useEffect, useState } from "react";
import AdminSidebar from "./global/AdminSidebar";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { locale, messages } = useLocale();

  // ✅ Persist locale across page loads

  const pathname = usePathname();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const isRTL = locale === "ar";
  const newPath = pathname.replace(/^\/(en|ar)/, `/${otherLocale}`);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={locale === "ar" ? "font-arabic" : "font-sans"}>
        <div className="flex h-screen">
          <AdminSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            locale={locale}
            setMenuOpen={setMenuOpen}
            newPath={newPath}
          />
          <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
