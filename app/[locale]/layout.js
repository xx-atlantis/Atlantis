import { notFound } from "next/navigation";
import { LocaleProvider } from "@/app/components/LocaleProvider";
import "../globals.css";
import ClientLayout from "@/app/components/ClientsLayout";
import { CartProvider } from "@/app/context/CartContext";
import { CustomerAuthProvider } from "../context/CustomerAuthProvider";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isAR = locale === "ar";
  return {
    openGraph: {
      locale: isAR ? "ar_SA" : "en_US",
      alternateLocale: isAR ? "en_US" : "ar_SA",
      title: isAR ? "أتلانتس للتصميم والديكور" : "Atlantis Design | Exterior & Interior Design",
      description: isAR
        ? "شركة متخصصة في التصميم الداخلي والخارجي في المملكة العربية السعودية"
        : "Premium exterior and interior design company in Saudi Arabia.",
    },
    twitter: {
      title: isAR ? "أتلانتس للتصميم والديكور" : "Atlantis Design | Exterior & Interior Design",
      description: isAR
        ? "شركة متخصصة في التصميم الداخلي والخارجي في المملكة العربية السعودية"
        : "Premium exterior and interior design company in Saudi Arabia.",
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <body className={isRTL ? "font-arabic" : "font-sans"}>
        <LocaleProvider locale={locale}>
          <CartProvider>
            <CustomerAuthProvider>
              <ClientLayout>{children}</ClientLayout>
            </CustomerAuthProvider>
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
