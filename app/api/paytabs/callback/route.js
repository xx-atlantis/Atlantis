import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerEmailNotification } from "@/lib/emailService";

export async function POST(req) {
  try {
    // 1. Parse Data
    const contentType = req.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        try { data[key] = JSON.parse(value); } catch { data[key] = value; }
      });
    }

    const orderId      = data.cart_id;
    const transactionId = data.tran_ref;

    // payment_result is a nested object — this is where PayTabs puts the status
    const paymentResult = data.payment_result || {};
    const responseStatus = paymentResult.response_status; // "A" = Approved

    console.log("🔹 PayTabs Callback:", {
      cart_id: orderId,
      tran_ref: transactionId,
      response_status: responseStatus,
    });

    const isSuccess = responseStatus === "A";

    // 2. Update Database + send emails
    if (isSuccess && orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (order && order.paymentStatus !== "PAID") {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            paymentMethod: "PAYTABS",
            paymentId:     transactionId || null,
            orderStatus:   "PROCESSING",
          },
        });
        console.log(`✅ Order ${orderId} PAID via PayTabs (${transactionId})`);

        const emailVariables = {
          customerName:  updatedOrder.customerName  || "Valued Customer",
          customerEmail: updatedOrder.customerEmail || "Not Provided",
          customerPhone: updatedOrder.customerPhone || "Not Provided",
          address:       updatedOrder.address       || "Not Provided",
          orderId:       updatedOrder.id.slice(-8).toUpperCase(),
          orderType:     updatedOrder.orderType     || "Standard",
          paymentMethod: "PayTabs",
          subtotal:      parseFloat(updatedOrder.subtotal || 0).toFixed(2),
          vat:           parseFloat(updatedOrder.vat      || 0).toFixed(2),
          totalAmount:   parseFloat(updatedOrder.total    || 0).toFixed(2),
        };

        if (updatedOrder.customerEmail) {
          await triggerEmailNotification("NEW_ORDER_CUSTOMER", updatedOrder.customerEmail, emailVariables);
        }
        const adminEmail = process.env.ADMIN_EMAIL || "admin@atlantis.sa";
        await triggerEmailNotification("NEW_ORDER_ADMIN", adminEmail, emailVariables);

      } else if (!order) {
        console.warn(`⚠️ Order ${orderId} not found in DB`);
      } else {
        console.log(`ℹ️ Order ${orderId} already PAID — skipping`);
      }
    } else {
      console.warn(`⚠️ PayTabs payment not successful — response_status: ${responseStatus}, cart_id: ${orderId}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ PayTabs Callback Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
