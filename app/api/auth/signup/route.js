import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    // ------------------------------
    // VALIDATION

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // ------------------------------
    // CHECK IF CUSTOMER EXISTS

    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email is already registered" },
        { status: 409 }
      );
    }

    // ------------------------------
    // HASH PASSWORD

    const hashed = await bcrypt.hash(password, 10);

    // ------------------------------
    // CREATE CUSTOMER

    const customer = await prisma.customer.create({
      data: {
        name: name || "",
        email,
        password: hashed,
        phone: phone || "",
        verified: false, // default
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
