// app/payment/result/page.js
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Home } from "lucide-react";
import { Suspense } from "react";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  
  // PayTabs sends generic info back in the URL. 
  // For security, we rely on the Webhook (Callback) to update the DB, 
  // but we can check the 'respStatus' here for a UI message.
  // respStatus: "A" = Authorized (Success), anything else is failed/cancelled.
  const status = searchParams.get("respStatus");
  const isSuccess = status === "A";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className={`p-4 rounded-full mb-6 ${isSuccess ? "bg-green-100" : "bg-red-100"}`}>
        {isSuccess ? (
          <CheckCircle className="w-16 h-16 text-green-600" />
        ) : (
          <XCircle className="w-16 h-16 text-red-600" />
        )}
      </div>

      <h1 className="text-3xl font-bold mb-2">
        {isSuccess ? "Payment Successful" : "Payment Failed or Cancelled"}
      </h1>

      <p className="text-gray-600 max-w-md mb-8">
        {isSuccess
          ? "Thank you for your order! We have received your payment and will start processing your request immediately."
          : "The payment could not be processed. Please try again or contact support if the issue persists."}
      </p>

      <div className="flex gap-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          <Home size={18} />
          Return to Home
        </Link>
        
        {!isSuccess && (
          <Link 
            href="/checkout" 
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Try Again
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading result...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}