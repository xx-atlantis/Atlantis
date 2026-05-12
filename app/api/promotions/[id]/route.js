import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { titleEn, titleAr, descEn, descAr, badgeEn, badgeAr, image, link, couponCode, isActive, validUntil } = body;

    const updated = await prisma.promotion.update({
      where: { id },
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
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Promotion PUT Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Promotion DELETE Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
