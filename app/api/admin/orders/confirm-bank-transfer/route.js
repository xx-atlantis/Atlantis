import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// 1. IMPORT YOUR EMAIL SERVICE
import { triggerEmailNotification } from "@/lib/emailService";

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    // 1. Find the order to ensure it exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ success: false, error: "Order is already marked as PAID" }, { status: 400 });
    }

    // 2. Update the Database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        orderStatus: "PROCESSING", // Or whatever status means "Ready to work on" in your system
      }
    });

    console.log(`✅ Admin manually confirmed Bank Transfer for Order: ${orderId}`);

    // ==========================================
    // 🔥 3. TRIGGER EMAIL NOTIFICATIONS HERE 🔥
    // ==========================================
    const emailVariables = {
      customerName: updatedOrder.customerName || 'Valued Customer',
      customerEmail: updatedOrder.customerEmail || 'Not Provided',
      customerPhone: updatedOrder.customerPhone || 'Not Provided',
      address: updatedOrder.address || 'Not Provided',
      orderId: updatedOrder.id.slice(-8).toUpperCase(),
      orderType: updatedOrder.orderType || 'Standard',
      paymentMethod: updatedOrder.paymentMethod || 'Bank Transfer',
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

    // 4. Return success to the Admin Dashboard
    return NextResponse.json({ success: true, message: "Order confirmed and emails dispatched successfully!" }, { status: 200 });

  } catch (error) {
    console.error("❌ Manual Confirmation Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}