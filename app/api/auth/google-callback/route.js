import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, idToken } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (customer && customer.phone) {
      const token = jwt.sign({ id: customer.id, email: customer.email }, SECRET_KEY, { expiresIn: '7d' });

      // 1. Create the response object
      const response = NextResponse.json({
        success: true,
        action: "LOGIN_SUCCESS",
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          token: token 
        }
      });

      // 2. Attach cookies directly to the response (Safest method)
      response.cookies.set("customer_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    } 
    else {
      const tempToken = jwt.sign({ email, name, stage: "incomplete" }, SECRET_KEY, { expiresIn: '1h' });
      return NextResponse.json({
        success: true,
        action: "REQUIRE_PHONE",
        tempToken: tempToken
      });
    }

  } catch (error) {
    console.error("Google Callback Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}