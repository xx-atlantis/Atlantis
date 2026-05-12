"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { PageContentProvider } from "@/app/context/PageContentProvider";
import WhatsAppFloatingIcon from "./WhatsApp";
import PromoBanner from "./PromoBanner";
import TopBar from "./TopBar";
import { CountryCurrencyProvider } from "@/app/context/CountryCurrencyContext";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const parts = pathname.split("/");

  const locale = parts[1] || "en";

  // Determine page slug
  let page;
  if (parts[2] === "start-a-project") {
    page = (parts[3] || "start-a-project").toLowerCase();
  } else {
    page = (parts[2] || "home").toLowerCase();
  }

  const cleanPath = "/" + (parts[2] || "");
  const restrictedRoutes = [
    "/login",
    "/auth",
    "/signup",
    "/unauthorized",
    "/403",
  ];
  const hideLayout = restrictedRoutes.some((r) => cleanPath.startsWith(r));

  // Admin and Profile routes where CMS and WhatsApp are skipped
  const skipCMS =
    cleanPath.startsWith("/admin") ||
    cleanPath.startsWith("/auth/login") ||
    cleanPath.startsWith("/auth/signup") ||
    cleanPath.startsWith("/en/profile");

  if (skipCMS) {
    return <>{children}</>;
  }

  return (
    <CountryCurrencyProvider>
    <PageContentProvider page={page} locale={locale}>
      {!hideLayout && <PromoBanner />}
      {!hideLayout && (
        <div className="sticky top-0 z-50">
          <TopBar />
          <Header />
        </div>
      )}

      <main>{children}</main>
      
      {/* WhatsApp Icon logic: Hidden on restricted routes, same as Header/Footer */}
      {!hideLayout && (
        <WhatsAppFloatingIcon
          phoneNumber="966537878794" 
          message={locale === "ar" ? "مرحباً، لدي استفسار بخصوص مشروعي." : "Hello, I have a query regarding my project."} 
        />
      )}
      
      {!hideLayout && <Footer />}
    </PageContentProvider>
    </CountryCurrencyProvider>
  );
}