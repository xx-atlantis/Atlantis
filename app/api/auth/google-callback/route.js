import { prisma } from "@/lib/prisma"; // Adjust path to your prisma client
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // Ensure you have 'npm install jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, idToken } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    // 1. Check if customer exists in your database
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    // 2. Logic Flow
    if (customer && customer.phone) {
      // CASE A: User exists AND has a phone number -> LOGIN SUCCESS
      
      // Update last login (optional)
      // Generate a session token for your app
      const token = jwt.sign({ id: customer.id, email: customer.email }, SECRET_KEY, { expiresIn: '7d' });

      return NextResponse.json({
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
    } 
    
    // CASE B: User does not exist OR User exists but has no phone -> REQUIRE PHONE
    else {
      // Generate a temporary token to secure the "Complete Profile" page
      // This ensures someone can't just visit the page without actually logging into Google first
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