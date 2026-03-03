import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// 1. IMPORT YOUR EMAIL SERVICE
import { triggerEmailNotification } from "@/lib/emailService";

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Tamara usually sends 'order_id' (their ID), 'order_reference_id' (your DB ID), and 'event_type'
    const tamaraOrderId = body.order_id; 
    const orderId = body.order_reference_id;
    const eventType = body.event_type; 

    if (!tamaraOrderId || !orderId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    console.log(`🔹 Tamara Webhook Received for Order: ${orderId} | Event: ${eventType}`);

    // We only want to trigger the success logic if the order is approved/authorized
    if (eventType === "order_approved" || eventType === "order_authorised") {
      
      // OPTIONAL BUT RECOMMENDED: Verify the status directly with Tamara's API for extra security
      const verifyRes = await fetch(`${process.env.TAMARA_API_URL}/orders/${tamaraOrderId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.TAMARA_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      });
      
      const tamaraData = await verifyRes.json();

      // Tamara statuses are usually 'approved', 'authorised', or 'fully_captured'
      if (tamaraData.status === "approved" || tamaraData.status === "authorised" || tamaraData.status === "fully_captured") {
        
        // 1. Update Database
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { 
            paymentStatus: "PAID", 
            paymentMethod: "TAMARA",
            paymentId: tamaraOrderId // Store Tamara's transaction ID
          }
        });

        // ==========================================
        // 🔥 2. TRIGGER EMAIL NOTIFICATIONS HERE 🔥
        // ==========================================
        const emailVariables = {
          customerName: updatedOrder.customerName || 'Valued Customer',
          customerEmail: updatedOrder.customerEmail || 'Not Provided',
          customerPhone: updatedOrder.customerPhone || 'Not Provided',
          address: updatedOrder.address || 'Not Provided',
          orderId: updatedOrder.id.slice(-8).toUpperCase(),
          orderType: updatedOrder.orderType || 'Standard',
          paymentMethod: 'Tamara',
          subtotal: parseFloat(updatedOrder.subtotal || 0).toFixed(2),
          vat: parseFloat(updatedOrder.vat || 0).toFixed(2),
          totalAmount: parseFloat(updatedOrder.total || 0).toFixed(2),
        };

        // Notify Customer
        if (updatedOrder.customerEmail) {
          await triggerEmailNotification('NEW_ORDER_CUSTOMER', updatedOrder.customerEmail, emailVariables);
        }

        // Notify Admin
        await triggerEmailNotification('NEW_ORDER_ADMIN', 'admin@atlantis.sa', emailVariables);

        console.log(`✅ Order ${orderId} PAID via Tamara (${tamaraOrderId}) - Emails Sent`);
      }
    }

    // Always return 200 to acknowledge receipt of the webhook, otherwise Tamara will keep retrying
    return NextResponse.json({ success: true, message: "Webhook processed" }, { status: 200 });

  } catch (err) {
    console.error("❌ Tamara Webhook Error:", err);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}