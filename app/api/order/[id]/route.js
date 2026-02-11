import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ============================================================
   GET → Fetch Single Order
============================================================ */
export async function GET(req, { params }) {
  try {
    const id = params.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Get Order Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/* ============================================================
   PATCH → Update Order (Admin Only Usually)
============================================================ */
export async function PATCH(req, { params }) {
  try {
    const id = params.id;
    const body = await req.json();

    const {
      orderStatus, // optional
      paymentStatus, // optional
      paymentMethod, // optional
      address, // optional
    } = body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        paymentMethod: paymentMethod || undefined,
        address: address || undefined,
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Update Order Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}

/* ============================================================
   DELETE → Remove Order
============================================================ */
export async function DELETE(req, { params }) {
  try {
    const id = params.id;

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
