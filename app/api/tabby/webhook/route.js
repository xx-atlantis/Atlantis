import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// 1. IMPORT YOUR EMAIL SERVICE
import { triggerEmailNotification } from "@/lib/emailService";

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
            // 3. Update DB to 'PAID' only after successful capture
            const updatedOrder = await prisma.order.update({
               where: { id: orderId },
               data: {
                 paymentStatus: 'PAID',
                 paymentMethod: 'TABBY',
                 paymentId: paymentId,
                 orderStatus: 'PROCESSING',
               }
            });

            const emailVariables = {
              customerName: updatedOrder.customerName || 'Valued Customer',
              customerEmail: updatedOrder.customerEmail || 'Not Provided',
              customerPhone: updatedOrder.customerPhone || 'Not Provided',
              address: updatedOrder.address || 'Not Provided',
              orderId: updatedOrder.id.slice(-8).toUpperCase(),
              orderType: updatedOrder.orderType || 'Standard',
              paymentMethod: 'Tabby',
              subtotal: parseFloat(updatedOrder.subtotal || 0).toFixed(2),
              vat: parseFloat(updatedOrder.vat || 0).toFixed(2),
              totalAmount: parseFloat(updatedOrder.total || 0).toFixed(2),
            };

            if (updatedOrder.customerEmail) {
              await triggerEmailNotification('NEW_ORDER_CUSTOMER', updatedOrder.customerEmail, emailVariables);
            }
            await triggerEmailNotification('NEW_ORDER_ADMIN', 'admin@atlantis.sa', emailVariables);

            return NextResponse.json({ success: true, message: "Captured and Emails Sent" });
         } else {
            console.error(`Tabby capture failed for order ${orderId}`);
         }
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Tabby Webhook Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}