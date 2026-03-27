import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerEmailNotification } from "@/lib/emailService";

export async function POST(req) {
  try {
    const { paymentId, orderId } = await req.json();

    if (!paymentId || !orderId) {
      return NextResponse.json({ success: false, error: "Missing IDs" }, { status: 400 });
    }

    // 1. Check if already paid (idempotency)
    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    if (existing.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    // 2. Verify with Tabby
    const res = await fetch(`https://api.tabby.ai/api/v2/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${process.env.TABBY_SECRET_KEY}` },
    });
    const data = await res.json();

    const isVerified = ["AUTHORIZED", "CAPTURED", "CLOSED"].includes(data.status);
    if (!isVerified) {
      return NextResponse.json({ success: false, error: "Payment not confirmed by Tabby" });
    }

    // 3. Update DB
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "TABBY",
        paymentId: paymentId,
        orderStatus: "PROCESSING",
      },
    });

    // 4. Send emails
    const emailVariables = {
      customerName: updatedOrder.customerName || "Valued Customer",
      customerEmail: updatedOrder.customerEmail || "Not Provided",
      customerPhone: updatedOrder.customerPhone || "Not Provided",
      address: updatedOrder.address || "Not Provided",
      orderId: updatedOrder.id.slice(-8).toUpperCase(),
      orderType: updatedOrder.orderType || "Standard",
      paymentMethod: "Tabby",
      subtotal: parseFloat(updatedOrder.subtotal || 0).toFixed(2),
      vat: parseFloat(updatedOrder.vat || 0).toFixed(2),
      totalAmount: parseFloat(updatedOrder.total || 0).toFixed(2),
    };

    if (updatedOrder.customerEmail) {
      await triggerEmailNotification("NEW_ORDER_CUSTOMER", updatedOrder.customerEmail, emailVariables);
    }
    await triggerEmailNotification("NEW_ORDER_ADMIN", "admin@atlantis.sa", emailVariables);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Tabby verify-payment error:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
