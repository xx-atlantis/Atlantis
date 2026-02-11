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
      { expiresIn: "7d" }
    );

    // ------------------------------
    // SET COOKIE (HttpOnly)
    // ------------------------------
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        verified: customer.verified,
      },
    });

    response.cookies.set("customerToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 1, // 1 day
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
