import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function ensureSection() {
  const page = await prisma.page.upsert({
    where: { slug: "home" },
    create: { slug: "home", name: "Home" },
    update: {},
  });

  const section = await prisma.section.upsert({
    where: { key: "reviews" },
    create: { key: "reviews", name: "Customer Reviews", type: "LIST" },
    update: {},
  });

  const existingPS = await prisma.pageSection.findFirst({
    where: { pageId: page.id, sectionId: section.id },
  });
  if (!existingPS) {
    await prisma.pageSection.create({
      data: { pageId: page.id, sectionId: section.id, order: 99 },
    });
  }

  return section.id;
}

export async function GET() {
  try {
    const sectionId = await ensureSection();
    const translations = await prisma.sectionTranslation.findMany({ where: { sectionId } });
    const data = {};
    for (const t of translations) data[t.locale] = t.content;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { locale, list } = await req.json();
    if (!locale || !Array.isArray(list)) {
      return NextResponse.json({ success: false, error: "locale and list required" }, { status: 400 });
    }
    const sectionId = await ensureSection();
    await prisma.sectionTranslation.upsert({
      where: { locale_sectionId: { locale, sectionId } },
      create: { locale, content: { list }, sectionId },
      update: { content: { list } },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
