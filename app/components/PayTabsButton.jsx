"use client"; // Required for App Router

import { useState } from "react";

export default function PayTabsButton({ orderId }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!orderId) {
      alert("Error: Order ID is missing.");
      return;
    }

    setLoading(true);

    try {
      // Call our API route
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      if (data.redirectUrl) {
        // Redirect user to PayTabs secure page
        window.location.href = data.redirectUrl;
      } else {
        alert("Unexpected error: No redirect URL returned.");
      }

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        "Pay with Card / Mada"
      )}
    </button>
  );
}