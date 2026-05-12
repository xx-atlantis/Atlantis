import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminAll = searchParams.get("all") === "true";

    const where = adminAll
      ? {}
      : { isActive: true, OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] };

    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: promotions });
  } catch (err) {
    console.error("Promotions GET Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { titleEn, titleAr, descEn, descAr, badgeEn, badgeAr, image, link, couponCode, isActive, validUntil } = body;

    if (!titleEn || !titleAr) {
      return NextResponse.json({ success: false, error: "Both EN and AR titles are required" }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        titleEn, titleAr,
        descEn: descEn || null,
        descAr: descAr || null,
        badgeEn: badgeEn || null,
        badgeAr: badgeAr || null,
        image: image || null,
        link: link || null,
        couponCode: couponCode || null,
        isActive: isActive ?? true,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    return NextResponse.json({ success: true, data: promotion });
  } catch (err) {
    console.error("Promotions POST Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
