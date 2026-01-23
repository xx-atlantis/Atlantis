import { notFound } from "next/navigation";
import { LocaleProvider } from "@/app/components/LocaleProvider";
import "../globals.css";
import ClientLayout from "@/app/components/ClientsLayout";
import { CartProvider } from "@/app/context/CartContext";
import { CustomerAuthProvider } from "../context/CustomerAuthProvider";

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
