import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { en, ar } = await req.json();

    if (!en?.name || !ar?.name) {
      return NextResponse.json({ success: false, error: "Both EN and AR names are required" }, { status: 400 });
    }

    const updated = await prisma.material.update({
      where: { id },
      data: {
        translations: {
          upsert: [
            {
              where: { locale_materialId: { locale: "en", materialId: id } },
              create: { locale: "en", name: en.name },
              update: { name: en.name },
            },
            {
              where: { locale_materialId: { locale: "ar", materialId: id } },
              create: { locale: "ar", name: ar.name },
              update: { name: ar.name },
            },
          ],
        },
      },
      include: { translations: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Material Update Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await prisma.materialTranslation.deleteMany({ where: { materialId: id } });
    await prisma.material.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Material Delete Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
