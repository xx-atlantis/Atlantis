import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ============================================================
   POST → Create a New Order
============================================================ */
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      customerId,
      customerEmail,
      customerName,
      customerPhone,
      address,
      orderType,
      items,
      packageDetails,
      projectSteps,
      subtotal,
      shipping,
      vat,
      total,
      paymentMethod,
      // --- New Fields from Frontend ---
      paymentPlan, // "full" or "deposit"
      depositPaid, // true or false
    } = body;

    // Calculate remaining balance if it's a deposit
    // If paymentPlan is "deposit", the 'total' sent from frontend is only the 25/40/50%
    // We should store what is still owed for admin clarity.
    let remainingBalance = 0;
    if (orderType === "package" && paymentPlan === "deposit") {
      const fullPrice = Number(packageDetails?.price?.replace(/\D/g, "")) || 0;
      const fullVat = fullPrice * 0.15;
      const fullTotal = fullPrice + fullVat;
      remainingBalance = fullTotal - total; 
    }

    const newOrder = await prisma.order.create({
      data: {
        customerId: customerId || null,
        customerEmail,
        customerName,
        customerPhone,
        address,

        orderType,
        subtotal,
        shipping,
        vat,
        total, // This is the amount the user is paying NOW
        paymentMethod,
        
        // --- Store Payment Plan Status ---
        paymentPlan: paymentPlan || "full",
        depositPaid: depositPaid || false,
        remainingBalance: remainingBalance,

        // Package → store JSON
        packageDetails: orderType === "package" ? packageDetails : undefined,
        projectSteps: orderType === "package" ? projectSteps : undefined,

        // Shop items → create related OrderItem records
        items:
          orderType === "shop" && items
            ? {
                create: items.map((item) => ({
                  productId: item.productId,
                  name: item.name,
                  coverImage: item.coverImage,
                  price: item.price,
                  quantity: item.quantity,
                  variant: item.variant || null,
                  material: item.material || null,
                })),
              }
            : undefined,
      },
      include: { items: true },
    });

    return NextResponse.json(
      { 
        success: true, 
        orderId: newOrder.id, 
        order: newOrder 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Order Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}

/* ============================================================
   GET → List All Orders (Admin)
============================================================ */
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}