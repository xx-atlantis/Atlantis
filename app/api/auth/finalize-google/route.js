import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, phone, tempToken } = body;

    try {
      const decoded = jwt.verify(tempToken, SECRET_KEY);
      if (decoded.email !== email) throw new Error("Token mismatch");
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid or expired session. Please try logging in with Google again." }, { status: 401 });
    }

    const existingPhone = await prisma.customer.findFirst({
      where: { 
        phone: phone,
        NOT: { email: email } 
      }
    });

    if (existingPhone) {
      return NextResponse.json({ success: false, error: "This phone number is already registered to another account." }, { status: 400 });
    }

    const customer = await prisma.customer.upsert({
      where: { email: email },
      update: { phone: phone, name: name, verified: true },
      create: { email: email, name: name, phone: phone, password: "", verified: true }
    });

    const sessionToken = jwt.sign({ id: customer.id, email: customer.email }, SECRET_KEY, { expiresIn: '30d' });

    // 1. Create response
    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        token: sessionToken
      }
    });

    // 2. Attach cookies directly to the response
    response.cookies.set("customer_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    
    response.cookies.set("token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Finalize Google Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create account." }, { status: 500 });
  }
}