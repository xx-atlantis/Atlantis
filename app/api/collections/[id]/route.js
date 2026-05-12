import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { nameEn, nameAr, image, productIds, isActive, order } = body;

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        nameEn: nameEn?.trim(),
        nameAr: nameAr?.trim(),
        image: image ?? null,
        productIds: productIds ?? [],
        isActive: isActive !== false,
        order: order ?? 0,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: collection });
  } catch (err) {
    console.error("PUT /api/collections/[id]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/collections/[id]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
