import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// GET: Fetch all coupons
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST: Create a new coupon
export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      minOrderValue, 
      maxDiscount, 
      startDate, 
      endDate, 
      usageLimit, 
      usageLimitPerCustomer,
      isActive 
    } = body;

    const newCoupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit,
        usageLimitPerCustomer,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}