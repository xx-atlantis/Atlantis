"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function OrderFailedContent() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const isRTL = locale === "ar";
  
  // Tabby might pass an error message or we use a default
  const tabbyMessage = searchParams.get("message");

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 bg-gray-50/50">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-lg w-full text-center animate-in zoom-in duration-500">
        
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} strokeWidth={2.5} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {isRTL ? "عذراً، لم تكتمل عملية الدفع" : "Payment Incomplete"}
        </h1>
        
        {/* Approved Tabby Rejection/Cancellation Message */}
        <p className="text-gray-600 mb-8 leading-relaxed font-medium">
          {tabbyMessage || (isRTL 
            ? "لم نتمكن من الموافقة على طلبك للتقسيط. يرجى اختيار طريقة دفع أخرى لإتمام طلبك." 
            : "We were unable to approve your installment request. Please choose another payment method to complete your order.")}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Fix: Send them back to checkout to try again */}
          <Link 
            href={`/${locale}/checkout`}
            className="flex-1 bg-[#2D3247] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1e2231] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#2D3247]/20"
          >
            <RefreshCcw size={18} />
            {isRTL ? "حاول مرة أخرى" : "Try Again"}
          </Link>
          
          <Link 
            href={`/${locale}`}
            className="flex-1 bg-white text-gray-600 border-2 border-gray-100 py-3.5 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={18} />
            {isRTL ? "الرئيسية" : "Home"}
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center">Loading...</div>}>
      <OrderFailedContent />
    </Suspense>
  );
}