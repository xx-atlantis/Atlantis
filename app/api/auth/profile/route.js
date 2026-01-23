import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Extract JWT token from cookies
function getToken(req) {
  return req.cookies.get("customerToken")?.value || null;
}

export async function PUT(req) {
  try {
    const token = getToken(req);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    // Verify JWT and extract customer ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customerId = decoded.id; // IMPORTANT FIX

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Invalid token: missing user ID" },
        { status: 401 }
      );
    }

    // Parse body
    const body = await req.json();
    const { name, phone, email, avatar, password } = body;

    // Build dynamic update object
    const data = {};

    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (email) data.email = email;
    if (avatar) data.avatar = avatar;

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 }
      );
    }

    // Update customer
    const updated = await prisma.customer.update({
      where: { id: customerId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        verified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Customer Profile Update Error:", err);

    // Invalid or expired JWT
    if (err.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Prisma unique constraint (email)
    if (err.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // Default case
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
