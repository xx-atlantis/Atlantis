import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  try {
    const where = all ? {} : { isActive: true };
    const collections = await prisma.collection.findMany({
      where,
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: collections });
  } catch (err) {
    console.error("GET /api/collections:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nameEn, nameAr, image, productIds, isActive, order } = body;

    if (!nameEn?.trim() || !nameAr?.trim()) {
      return NextResponse.json({ success: false, error: "Both EN and AR names are required" }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim(),
        image: image || null,
        productIds: productIds || [],
        isActive: isActive !== false,
        order: order || 0,
      },
    });

    return NextResponse.json({ success: true, data: collection });
  } catch (err) {
    console.error("POST /api/collections:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
