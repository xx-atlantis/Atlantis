import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format." },
        { status: 400 }
      );
    }

    // 🔎 Check if customer exists
    const customer = await prisma.customer.findFirst({
      where: { phone: phone },
      select: { 
        id: true, 
        name: true, 
        email: true,
        verified: true // Using 'verified' instead of 'status'
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "No account found with this phone number" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer verified. You can proceed with OTP.",
      data: {
        customerName: customer.name || "Customer"
      }
    });

  } catch (err) {
    console.error("Forgot Password Request Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}