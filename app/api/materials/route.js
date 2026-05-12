import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { en, ar } = await req.json();

    if (!en?.name) {
      return NextResponse.json({ success: false, error: "English name is required" }, { status: 400 });
    }
    if (!ar?.name) {
      return NextResponse.json({ success: false, error: "Arabic name is required" }, { status: 400 });
    }

    const material = await prisma.material.create({
      data: {
        translations: {
          create: [
            { locale: "en", name: en.name },
            { locale: "ar", name: ar.name },
          ],
        },
      },
      include: { translations: true },
    });

    return NextResponse.json({ success: true, data: material });
  } catch (err) {
    console.error("Material Create Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    const materials = await prisma.material.findMany({
      include: {
        translations: { where: { locale } },
      },
      orderBy: { createdAt: "asc" },
    });

    const items = materials.map((m) => ({
      id: m.id,
      name: m.translations[0]?.name || "",
    }));

    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("Material List Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
