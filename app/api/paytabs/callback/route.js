import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
// 1. IMPORT YOUR EMAIL SERVICE
import { triggerEmailNotification } from "@/lib/emailService";

export async function POST(req) {
  try {
    // 1. Parse Data (Handle Form Data vs JSON automatically)
    const contentType = req.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => (data[key] = value));
    }

    console.log("🔹 PayTabs Callback Received for Order:", data.cart_id);

    // 2. Validate Signature
    const serverKey = process.env.PAYTABS_SERVER_KEY;
    const requestSignature = data.signature;
    delete data.signature; 

    const sortedKeys = Object.keys(data).sort();
    const queryStr = sortedKeys.map((key) => data[key]).join("");
    
    const calculatedSignature = crypto
      .createHmac("sha256", serverKey)
      .update(queryStr)
      .digest("hex");

    if (calculatedSignature !== requestSignature) {
      console.error("❌ PayTabs Signature Mismatch!");
      return NextResponse.json({ message: "Invalid signature" }, { status: 200 });
    }

    // 3. Extract Status
    const isSuccess = data.respStatus === "A" || data.payment_result?.response_status === "A";
    const orderId = data.cart_id;
    const transactionId = data.tran_ref;

    // 4. Update Database AND Trigger Emails
    if (isSuccess) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (order && order.paymentStatus !== "PAID") {
        // Capture the updated order to ensure we have all data for the email
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            paymentMethod: "PAYTABS",
            paymentId: transactionId,
            orderStatus: "PROCESSING",
          },
        });
        console.log(`✅ Order ${orderId} PAID via PayTabs (${transactionId})`);

        // ==========================================
        // 🔥 TRIGGER EMAIL NOTIFICATIONS HERE 🔥
        // ==========================================
        const emailVariables = {
          customerName: updatedOrder.customerName || 'Valued Customer',
          customerEmail: updatedOrder.customerEmail || 'Not Provided', 
          customerPhone: updatedOrder.customerPhone || 'Not Provided', 
          address: updatedOrder.address || 'Not Provided',             
          orderId: updatedOrder.id.slice(-8).toUpperCase(),
          orderType: updatedOrder.orderType || 'Standard',
          paymentMethod: 'PayTabs',
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
      }
    } else {
      console.warn(`⚠️ PayTabs Payment Failed for Order ${orderId}`);
    }

    // 5. Respond OK
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ PayTabs Callback Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}