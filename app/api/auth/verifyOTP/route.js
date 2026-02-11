import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import admin from "@/lib/firebaseAdmin";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { idToken, newPassword } = await req.json();

    if (!idToken || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔐 Verify Firebase OTP proof
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phone = decoded.phone_number;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "OTP verification failed" },
        { status: 401 }
      );
    }

    // 🔎 Find customer
    const customer = await prisma.customer.findFirst({
      where: { phone },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        verified: true, // optional but recommended
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
    console.error("Verify & Reset Error:", err);
    return NextResponse.json(
      { success: false, error: "Invalid or expired OTP" },
      { status: 401 }
    );
  }
}
