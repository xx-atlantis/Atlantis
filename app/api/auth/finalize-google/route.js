import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, phone, tempToken } = body;

    // 1. Verify the temp token to ensure they came from Google Login
    try {
      const decoded = jwt.verify(tempToken, SECRET_KEY);
      if (decoded.email !== email) {
        throw new Error("Token mismatch");
      }
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid or expired session. Please try logging in with Google again." }, { status: 401 });
    }

    // 2. Check if this phone number is already taken by ANOTHER account
    const existingPhone = await prisma.customer.findFirst({
      where: { 
        phone: phone,
        NOT: { email: email } // It's okay if it matches the current email (updating self)
      }
    });

    if (existingPhone) {
      return NextResponse.json({ success: false, error: "This phone number is already registered to another account." }, { status: 400 });
    }

    // 3. Upsert User (Create if new, Update if exists)
    // We use upsert because the user might exist (email only) but be missing the phone
    const customer = await prisma.customer.upsert({
      where: { email: email },
      update: { 
        phone: phone,
        name: name, // Update name just in case
        emailVerified: true // They used Google, so email is verified
      },
      create: {
        email: email,
        name: name,
        phone: phone,
        password: "", // No password for Google users
        emailVerified: true
      }
    });

    // 4. Generate Final Session Token
    const sessionToken = jwt.sign({ id: customer.id, email: customer.email }, SECRET_KEY, { expiresIn: '30d' });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        token: sessionToken
      }
    });

  } catch (error) {
    console.error("Finalize Google Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create account." }, { status: 500 });
  }
}
