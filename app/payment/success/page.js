import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, XCircle, Home, ShoppingBag, Loader2 } from "lucide-react";

export default async function PaymentSuccessPage({ searchParams }) {
  // Await params for Next.js 15+
  const params = await searchParams;
  
  // 1. DETECT PROVIDER & IDS
  // Tabby sends: payment_id
  // PayTabs sends: tranRef + respStatus
  // Tamara sends: paymentStatus (we pass our orderId as ?ref=)
  const paymentId = params.payment_id || params.tranRef;
  const dbOrderId = params.ref || params.orderId; // ref = Tamara, orderId = PayTabs/Tabby

  let isSuccess = false;
  let message = "Verifying payment...";
  let provider = "UNKNOWN";

  // Identify Provider
  if (params.payment_id) provider = "TABBY";
  else if (params.tranRef) provider = "PAYTABS";
  else if (params.ref || params.paymentStatus) provider = "TAMARA";

  if (!dbOrderId) {
    return <ErrorState message="Missing payment information." />;
  }

  try {
    // 2. VERIFY PAYMENT BASED ON PROVIDER
    let verified = false;

    if (provider === "TABBY") {
      // --- TABBY VERIFICATION ---
      const res = await fetch(`https://api.tabby.ai/api/v2/payments/${paymentId}`, {
        headers: { "Authorization": `Bearer ${process.env.TABBY_SECRET_KEY}` }
      });
      const data = await res.json();
      if (res.ok && ["AUTHORIZED", "CAPTURED", "CLOSED"].includes(data.status)) {
        verified = true;
      }

    } else if (provider === "PAYTABS") {
      // --- PAYTABS VERIFICATION ---
      // 1. Trust redirect param if present
      if (params.respStatus === "A") {
        verified = true;
      }

      // 2. Check DB — callback may have already processed and marked PAID
      if (!verified) {
        const preCheck = await prisma.order.findUnique({
          where: { id: dbOrderId },
          select: { paymentStatus: true },
        });
        if (preCheck?.paymentStatus === "PAID") {
          verified = true;
        }
      }

      // 3. Query PayTabs API directly using tran_ref (handles race condition
      //    where callback hasn't arrived yet but payment is confirmed)
      if (!verified && paymentId && process.env.PAYTABS_SERVER_KEY && process.env.PAYTABS_PROFILE_ID) {
        try {
          const ptEndpoint = process.env.PAYTABS_ENDPOINT || "https://secure.paytabs.sa";
          const queryRes = await fetch(`${ptEndpoint}/payment/query`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": process.env.PAYTABS_SERVER_KEY,
            },
            body: JSON.stringify({
              profile_id: process.env.PAYTABS_PROFILE_ID,
              tran_ref: paymentId,
            }),
          });
          const ptData = await queryRes.json();
          if (ptData?.payment_result?.response_status === "A") {
            verified = true;
          }
        } catch (ptErr) {
          console.warn("PayTabs query fallback failed:", ptErr.message);
        }
      }
      
    } else if (provider === "TAMARA") {
      // --- TAMARA VERIFICATION ---
      // Tamara's orderId (their ID) comes from the redirect params
      const tamaraOrderId = params.orderId;
      if (tamaraOrderId && process.env.TAMARA_API_TOKEN) {
        const verifyRes = await fetch(`${process.env.TAMARA_API_URL}/orders/${tamaraOrderId}`, {
          headers: {
            "Authorization": `Bearer ${process.env.TAMARA_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        const tamaraData = await verifyRes.json();
        if (["approved", "authorised", "fully_captured"].includes(tamaraData.status)) {
          verified = true;
        }
      } else if (params.paymentStatus === "approved") {
        // Fallback: trust redirect param if API token not configured
        verified = true;
      }
    }

    // 3. UPDATE DATABASE (If Verified)
    if (verified) {
      isSuccess = true;
      
      const order = await prisma.order.findUnique({ where: { id: dbOrderId } });

      if (order && order.paymentStatus !== "PAID") {
        await prisma.order.update({
          where: { id: dbOrderId },
          data: {
            paymentStatus: "PAID",
            paymentMethod: provider,
            paymentId: paymentId || params.orderId || null,
            orderStatus: "PROCESSING"
          }
        });
        console.log(`✅ Order ${dbOrderId} PAID via ${provider}`);
      }
    } else {
      message = "Payment verification failed. Status not confirmed.";
    }

  } catch (error) {
    console.error("Payment Verification Error:", error);
    message = "Internal Server Error during verification.";
  }

  // 4. RENDER UI
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className={`p-4 rounded-full mb-6 ${isSuccess ? "bg-green-100" : "bg-red-100"}`}>
        {isSuccess ? <CheckCircle className="w-16 h-16 text-green-600" /> : <XCircle className="w-16 h-16 text-red-600" />}
      </div>

      <h1 className="text-3xl font-bold mb-2">
        {isSuccess ? "Payment Successful" : "Verification Failed"}
      </h1>

      <p className="text-gray-600 max-w-md mb-8">
        {isSuccess
          ? `Thank you! Your payment via ${provider === 'UNKNOWN' ? 'Secure Payment' : provider} was successful.`
          : message}
      </p>

      <div className="flex gap-4">
        <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2">
          <Home size={18} /> Return Home
        </Link>
        {isSuccess && (
          <Link href="/orders" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
            <ShoppingBag size={18} /> My Orders
          </Link>
        )}
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <XCircle className="w-16 h-16 text-red-600 mb-4" />
      <h1 className="text-2xl font-bold">Error</h1>
      <p className="text-gray-600 mb-6">{message}</p>
      <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-lg">Return Home</Link>
    </div>
  );
}