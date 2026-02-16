import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// GET: Fetch a single coupon by ID
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 });
  }
}

// PATCH: Update a coupon
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Prepare dates if they are being updated
    const updateData = { ...body };
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE: Remove a coupon
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}