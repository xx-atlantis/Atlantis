import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Apply/Validate a coupon code
export async function POST(req) {
  try {
    const body = await req.json();
    const { code, customerId, orderTotal } = body;

    // Validate required fields
    if (!code || !orderTotal) {
      return NextResponse.json(
        { error: "Coupon code and order total are required" },
        { status: 400 }
      );
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        orders: customerId
          ? {
              where: { customerId },
              select: { id: true },
            }
          : false,
      },
    });

    // Check if coupon exists
    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code", valid: false },
        { status: 404 }
      );
    }

    // Validation checks
    const now = new Date();
    const validationErrors = [];

    // Check if active
    if (!coupon.isActive) {
      validationErrors.push("This coupon is currently inactive");
    }

    // Check if started
    if (new Date(coupon.startDate) > now) {
      validationErrors.push("This coupon is not yet active");
    }

    // Check if expired
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      validationErrors.push("This coupon has expired");
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      validationErrors.push("This coupon has reached its usage limit");
    }

    // Check per-customer usage limit
    if (customerId && coupon.usageLimitPerCustomer) {
      const customerUsageCount = coupon.orders?.length || 0;
      if (customerUsageCount >= coupon.usageLimitPerCustomer) {
        validationErrors.push("You have already used this coupon the maximum number of times");
      }
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      validationErrors.push(
        `Minimum order value of SAR ${coupon.minOrderValue.toFixed(2)} required`
      );
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          error: validationErrors.join(". "),
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
      
      // Apply max discount cap if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "FIXED") {
      discountAmount = coupon.discountValue;
      
      // Don't allow discount to exceed order total
      if (discountAmount > orderTotal) {
        discountAmount = orderTotal;
      }
    }

    // Calculate final total
    const finalTotal = Math.max(0, orderTotal - discountAmount);

    // Return success response
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: {
        amount: parseFloat(discountAmount.toFixed(2)),
        percentage: coupon.discountType === "PERCENTAGE" ? coupon.discountValue : null,
      },
      orderSummary: {
        subtotal: parseFloat(orderTotal.toFixed(2)),
        discount: parseFloat(discountAmount.toFixed(2)),
        total: parseFloat(finalTotal.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon", valid: false },
      { status: 500 }
    );
  }
}