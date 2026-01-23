"use client";

import "../globals.css";
import { useState } from "react";
import AdminSidebar from "./global/AdminSidebar";
import { LocaleProvider, useLocale } from "@/app/components/LocaleProvider";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  return (
    <LocaleProvider>
      <AdminShell>{children}</AdminShell>
    </LocaleProvider>
  );
}

function AdminShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { locale } = useLocale();

  const otherLocale = locale === "ar" ? "en" : "ar";
  const newPath = pathname.replace(/^\/(en|ar)/, `/${otherLocale}`);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={locale === "ar" ? "font-arabic" : "font-sans"}>
        <div className="flex h-screen">
          <AdminSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            locale={locale}
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
