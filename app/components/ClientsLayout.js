"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { PageContentProvider } from "@/app/context/PageContentProvider";
import WhatsAppFloatingIcon from "./WhatsApp";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const parts = pathname.split("/");

  const locale = parts[1] || "en";

  // Determine page slug
  let page;
  if (parts[2] === "start-a-project") {
    page = parts[3] || "start-a-project";
  } else {
    page = parts[2] || "home";
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
    <PageContentProvider page={page} locale={locale}>
      {!hideLayout && <Header />}
      
      {children}
      
      {/* WhatsApp Icon logic: Hidden on restricted routes, same as Header/Footer */}
      {!hideLayout && (
        <WhatsAppFloatingIcon
          phoneNumber="966595742424" 
          message={locale === "ar" ? "مرحباً، لدي استفسار بخصوص مشروعي." : "Hello, I have a query regarding my project."} 
        />
      )}
      
      {!hideLayout && <Footer />}
    </PageContentProvider>
  );
}