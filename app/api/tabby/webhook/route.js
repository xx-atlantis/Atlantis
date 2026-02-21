import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const tabbyKey = process.env.TABBY_SECRET_KEY;
    
    const paymentId = body.id;
    const status = body.status; // Lowercase 'authorized' from webhook
    const orderId = body.order?.reference_id;

    if (!paymentId || !orderId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // POINT 11: Implement Retrieve + Capture logic
    if (status === "authorized") {
      
      // 1. Retrieve the payment status via GET to verify (Expect UPPERCASE 'AUTHORIZED')
      const retrieveRes = await fetch(`https://api.tabby.ai/api/v2/payments/${paymentId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${tabbyKey}` }
      });
      const retrieveData = await retrieveRes.json();

      if (retrieveData.status === "AUTHORIZED") {
         // 2. Trigger Capture request to actually claim the funds
         const captureRes = await fetch(`https://api.tabby.ai/api/v2/payments/${paymentId}/captures`, {
           method: "POST",
           headers: {
             "Authorization": `Bearer ${tabbyKey}`,
             "Content-Type": "application/json"
           },
           body: JSON.stringify({ amount: retrieveData.amount }) 
         });

         if (captureRes.ok) {
            // 3. Update DB to 'paid' only after successful capture
            await prisma.order.update({
               where: { id: orderId },
               data: { paymentStatus: 'paid', tabbyPaymentId: paymentId }
            });
            return NextResponse.json({ success: true, message: "Captured" });
         }
      }
    } 

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Tabby Webhook Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}