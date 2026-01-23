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
    } = body;

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
        total,
        paymentMethod,

        // Package → store JSON
        packageDetails: orderType === "package" ? packageDetails : undefined,
        projectSteps: orderType === "package" ? projectSteps : undefined,

        // Shop items → create related OrderItem records
        items:
          orderType === "shop"
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

    // ✅ FIXED HERE: Added "orderId" to the response so the frontend can read it
    return NextResponse.json(
      { 
        success: true, 
        orderId: newOrder.id, // <--- This line is critical for PayTabs
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