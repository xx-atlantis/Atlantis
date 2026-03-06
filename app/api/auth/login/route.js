import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key"; // Use env in production!

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // ------------------------------
    // VALIDATION
    // ------------------------------
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // ------------------------------
    // FIND CUSTOMER
    // ------------------------------
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ------------------------------
    // CHECK PASSWORD
    // ------------------------------
    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ------------------------------
    // CREATE JWT TOKEN
    // ------------------------------
    const token = jwt.sign(
      {
        id: customer.id,
        email: customer.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // Changed JWT expiration to match the cookie (7 days)
    );

    // ------------------------------
    // SET RESPONSE & COOKIE (THE FIX)
    // ------------------------------
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token: token, // <-- FIX 1: Send token directly to frontend
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        verified: customer.verified,
        token: token, // <-- Added here too so it perfectly matches the Google payload
      },
    });

    // <-- FIX 2: Changed to customer_token (snake_case) to match Google Auth
    response.cookies.set("customer_token", token, {
      httpOnly: false, // <-- FIX 3: Allowed frontend JS to see the cookie
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Match Google Auth settings
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Customer Login Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}