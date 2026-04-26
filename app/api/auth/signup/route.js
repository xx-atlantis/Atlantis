import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import admin from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, phone, idToken } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Verify that the phone was actually verified via Firebase OTP
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "Phone verification is required" },
        { status: 400 }
      );
    }

    let verifiedPhone = phone;
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      if (!decoded.phone_number) {
        return NextResponse.json(
          { success: false, error: "Phone verification failed — no phone in token" },
          { status: 401 }
        );
      }
      verifiedPhone = decoded.phone_number;
    } catch (firebaseErr) {
      console.error("Firebase token verification failed:", firebaseErr.message);
      return NextResponse.json(
        { success: false, error: "Phone verification token is invalid or expired" },
        { status: 401 }
      );
    }

    // Check if customer already exists
    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email is already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        name: name || "",
        email,
        password: hashed,
        phone: verifiedPhone,
        verified: true, // phone was verified via Firebase OTP
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer registered successfully",
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          verified: customer.verified,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Customer Register Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
