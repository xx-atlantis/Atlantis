import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // --- Pagination Setup ---
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // --- Filtering & Searching ---
    const search = searchParams.get("search") || "";
    const verified = searchParams.get("verified"); // 'true' or 'false'

    // Build the query object
    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        verified !== null
          ? { verified: verified === "true" }
          : {},
      ],
    };

    // --- Data Fetching ---
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { orders: true }, // Returns 'orders' count
          },
          orders: {
            take: 1, // Fetch only the most recent order info
            orderBy: { createdAt: "desc" },
            select: { createdAt: true, total: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Customer Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}