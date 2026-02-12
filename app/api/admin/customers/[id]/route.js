import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// 1. GET Customer by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          // Optional: include specific fields from orders to avoid heavy data load
          select: {
            id: true,
            total: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
          }
        },
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Fetch Customer Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 2. DELETE Customer
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Check if customer exists first
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    /**
     * NOTE: In MongoDB, if you have orders linked to this customer, 
     * those orders will now have a 'null' customerId if you don't delete them.
     * If you want to delete orders too, use:
     * await prisma.order.deleteMany({ where: { customerId: id } });
     */

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete Customer Error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}