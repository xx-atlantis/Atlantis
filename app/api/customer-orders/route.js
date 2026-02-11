import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // 1. Authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const customerId = payload.id;

    if (!customerId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    // 2. Parse Query Parameters
    const { searchParams } = new URL(req.url);
    
    // Pagination params
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filter params
    const orderType = searchParams.get("orderType"); // 'shop' or 'package'
    const orderStatus = searchParams.get("orderStatus"); // 'pending', 'processing', etc.
    const paymentStatus = searchParams.get("paymentStatus"); // 'paid', 'pending'
    const searchQuery = searchParams.get("search"); // Search by ID or Product Name
    const startDate = searchParams.get("startDate"); // ISO date string
    const endDate = searchParams.get("endDate"); // ISO date string
    const sortBy = searchParams.get("sortBy") || "createdAt"; // Field to sort by
    const sortOrder = searchParams.get("sortOrder") || "desc"; // 'asc' or 'desc'

    // 3. Build the "where" clause
    const whereClause = {
      customerId: customerId,
      ...(orderType && { orderType }),
      ...(orderStatus && { orderStatus }),
      ...(paymentStatus && { paymentStatus }),
      ...(searchQuery && {
        OR: [
          { id: { contains: searchQuery, mode: 'insensitive' } },
          { items: { some: { name: { contains: searchQuery, mode: 'insensitive' } } } }
        ]
      }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    // 4. Fetch Data & Total Count
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        orderBy: { [sortBy]: sortOrder },
        include: { 
          items: true,
        },
      }),
      prisma.order.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Fetch Orders Error:", error);
    if (error.code === 'ERR_JWT_EXPIRED') {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}