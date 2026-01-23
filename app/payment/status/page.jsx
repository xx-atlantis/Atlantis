"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

// 1. Create a sub-component for the logic that uses search params
function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("checking");
  
  const respStatus = searchParams.get("respStatus");
  const tranRef = searchParams.get("tranRef");

  useEffect(() => {
    if (respStatus === "A") {
      setStatus("success");
    } else if (respStatus === "C") {
      setStatus("cancelled");
    } else if (respStatus === "D") {
      setStatus("declined");
    } else {
      setStatus("error");
    }
  }, [respStatus]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
      {status === "success" && (
        <>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. Your transaction reference is <span className="font-mono bg-gray-100 px-1 rounded">{tranRef}</span>.
          </p>
          <Link href="/profile" className="block w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
            View Order History
          </Link>
        </>
      )}

      {(status === "declined" || status === "error" || status === "cancelled") && (
        <>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment {status === "cancelled" ? "Cancelled" : "Failed"}</h2>
          <p className="text-gray-600 mb-6">Unfortunately, your payment was not completed.</p>
          <Link href="/checkout" className="block w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900">
            Try Again
          </Link>
        </>
      )}

      {status === "checking" && (
        <p className="text-gray-500 animate-pulse">Verifying payment status...</p>
      )}
    </div>
  );
}

// 2. Main Page Component wraps the content in Suspense
export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div className="text-center p-4">Loading payment details...</div>}>
        <PaymentStatusContent />
      </Suspense>
    </div>
  );
}