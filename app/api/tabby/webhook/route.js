import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const tabbyKey = process.env.TABBY_SECRET_KEY || "";
    
    const paymentId = body.id;
    const status = body.status; // Webhook sends 'authorized' in lowercase
    const orderId = body.order?.reference_id;

    if (!paymentId || !orderId) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // POINT 10 & 11 FIX: Verify and Capture Flow
    if (status === "authorized" || status === "AUTHORIZED") {
      
      // 1. Retrieve payment to verify it's actually authorized
      const retrieveRes = await fetch(`https://api.tabby.ai/api/v2/payments/${paymentId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${tabbyKey}` }
      });
      const retrieveData = await retrieveRes.json();

      // 2. If valid, capture the payment
      if (retrieveData.status === "AUTHORIZED") {
         const captureRes = await fetch(`https://api.tabby.ai/api/v1/payments/${paymentId}/captures`, {
           method: "POST",
           headers: {
             "Authorization": `Bearer ${tabbyKey}`,
             "Content-Type": "application/json"
           },
           body: JSON.stringify({ amount: retrieveData.amount }) // Capture full amount
         });

         const captureData = await captureRes.json();

         // 3. Update Order in your Database to 'paid'
         await prisma.order.update({
            where: { id: orderId },
            data: { 
                paymentStatus: 'paid', 
                paymentId: paymentId 
            }
         });

         return NextResponse.json({ success: true, message: "Payment Captured" });
      }
    } 
    // Handle Rejections or Expirations from Webhook
    else if (status === "rejected" || status === "REJECTED" || status === "expired") {
         await prisma.order.update({
            where: { id: orderId },
            data: { 
                paymentStatus: 'failed', 
                paymentId: paymentId 
            }
         });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Tabby Webhook Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}