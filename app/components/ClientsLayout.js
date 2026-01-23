"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { PageContentProvider } from "@/app/context/PageContentProvider";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const parts = pathname.split("/");

  const locale = parts[1] || "en";

  // Determine page slug
  let page;
  if (parts[2] === "start-a-project") {
    page = parts[3] || "start-a-project"; // <-- FIX
  } else {
    page = parts[2] || "home";
  }

  // restricted routes for hiding layout
  const cleanPath = "/" + (parts[2] || "");
  const restrictedRoutes = [
    "/login",
    "/auth",
    "/signup",
    "/unauthorized",
    "/403",
  ];
  const hideLayout = restrictedRoutes.some((r) => cleanPath.startsWith(r));

  // ===== Admin route should NOT use CMS at all =====
  const skipCMS =
    cleanPath.startsWith("/admin") ||
    cleanPath.startsWith("/auth/login") ||
    cleanPath.startsWith("/auth/signup") ||
    cleanPath.startsWith("/en/profile");

  if (skipCMS) {
    // ADMIN ROUTES: NO CMS, NO HEADER/FOOTER
    return <>{children}</>;
  }

  return (
    <PageContentProvider page={page} locale={locale}>
      {!hideLayout && <Header />}
      {children}
      {!hideLayout && <Footer />}
    </PageContentProvider>
  );
}
