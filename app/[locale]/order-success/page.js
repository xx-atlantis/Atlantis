"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, Suspense } from "react";

function OrderSuccessContent() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("payment_id"); // Comes from Tabby
  const method = searchParams.get("method"); // Used if Bank Transfer
  const isRTL = locale === "ar";

  // Clear cart on success
  useEffect(() => {
    localStorage.removeItem("cart");
  }, []);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 bg-gray-50/50">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-lg w-full text-center animate-in zoom-in duration-500">
        
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {isRTL ? "تم تأكيد طلبك!" : "Order Confirmed!"}
        </h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          {isRTL 
            ? "شكراً لثقتك بنا. جاري معالجة طلبك وسنتواصل معك قريباً للبدء في مشروعك." 
            : "Thank you for your trust. Your order is being processed and we will contact you shortly."}
        </p>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-500">{isRTL ? "رقم الطلب:" : "Order ID:"}</span>
            <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{orderId || "N/A"}</span>
          </div>
          
          {paymentId && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">{isRTL ? "معرف الدفع:" : "Payment ID:"}</span>
              <span className="text-sm font-bold text-[#3EEDBF] truncate max-w-[150px]">{paymentId}</span>
            </div>
          )}

          {method === 'bank' && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-xl text-center font-medium leading-relaxed">
              {isRTL 
                ? "يرجى إرسال إيصال التحويل البنكي عبر الواتساب لتأكيد الطلب نهائياً." 
                : "Please send the bank transfer receipt via WhatsApp to finalize confirmation."}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* FIX: Tabby QA - Ensure this points to a valid page, like the homepage if you don't have a profile page yet */}
          <Link 
            href={`/${locale}`} 
            className="flex-1 bg-[#2D3247] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1e2231] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#2D3247]/20"
          >
            <ShoppingBag size={18} />
            {isRTL ? "طلباتي" : "My Orders"}
          </Link>
          
          <Link 
            href={`/${locale}`}
            className="flex-1 bg-white text-[#2D3247] border-2 border-gray-100 py-3.5 rounded-xl font-semibold hover:border-[#2D3247] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            {isRTL ? "الرئيسية" : "Home"}
            <ArrowRight size={18} className={isRTL ? "rotate-180" : ""} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}