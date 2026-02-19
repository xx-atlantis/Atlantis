import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// 1. IMPORT THE EMAIL SERVICE
import { triggerEmailNotification } from "@/lib/emailService"; // Adjust path if needed

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
      paymentPlan,
      depositPaid,
      couponId,
      discountTotal,
    } = body;

    let remainingBalance = 0;
    if (orderType === "package" && paymentPlan === "deposit") {
      const fullPrice = Number(packageDetails?.price?.replace(/\D/g, "")) || 0;
      const fullVat = fullPrice * 0.15;
      const fullTotal = fullPrice + fullVat;
      remainingBalance = fullTotal - total;
    }

    // ==========================================
    // 🔥 USE TRANSACTION - Both or Nothing
    // ==========================================
    const result = await prisma.$transaction(async (tx) => {
      // 1. Increment coupon usage (if coupon was used)
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // 2. Create the order
      const newOrder = await tx.order.create({
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
          paymentPlan: paymentPlan || "full",
          depositPaid: depositPaid || false,
          remainingBalance: remainingBalance,
          couponId: couponId || null,
          discountTotal: discountTotal || 0,
          packageDetails: orderType === "package" ? packageDetails : undefined,
          projectSteps: orderType === "package" ? projectSteps : undefined,
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

      return newOrder;
    });

// ==========================================
    // 🔥 STEP 4: TRIGGER EMAIL NOTIFICATIONS 🔥
    // ==========================================
    
    const emailVariables = {
      customerName: result.customerName || 'Valued Customer',
      customerEmail: result.customerEmail || 'Not Provided', // NEW
      customerPhone: result.customerPhone || 'Not Provided', // NEW
      address: result.address || 'Not Provided',             // NEW
      orderId: result.id.slice(-8).toUpperCase(),
      orderType: result.orderType || 'Standard',
      paymentMethod: result.paymentMethod || 'Credit Card',
      subtotal: parseFloat(result.subtotal || 0).toFixed(2),
      vat: parseFloat(result.vat || 0).toFixed(2),
      totalAmount: parseFloat(result.total || 0).toFixed(2),
    };

    if (result.customerEmail) {
      await triggerEmailNotification('NEW_ORDER_CUSTOMER', result.customerEmail, emailVariables);
    }

    await triggerEmailNotification('NEW_ORDER_ADMIN', 'admin@atlantis.sa', emailVariables);
      customerName: result.customerName || 'A customer',
      orderId: result.id,
      totalAmount: result.total.toString(),
    });

    return NextResponse.json(
      {
        success: true,
        orderId: result.id,
        order: result,
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

