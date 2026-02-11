import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import admin from "@/lib/firebaseAdmin";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { idToken, newPassword } = await req.json();

    // 1. Basic Validation
    if (!idToken || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 2. 🔐 Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError);
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // 3. Extract phone number from verified token
    const phone = decodedToken.phone_number;
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Identity verification failed" },
        { status: 401 }
      );
    }

    // 4. 🔎 Find Customer by phone (Must match your schema)
    const customer = await prisma.customer.findFirst({
      where: { phone },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    // 5. 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 6. 📝 Update Customer password
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        // If the user reset via phone, we can ensure they are marked verified
        verified: true, 
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
    console.error("Reset Password Error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}