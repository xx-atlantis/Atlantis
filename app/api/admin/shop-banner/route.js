import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SLUG = "shop";
const SECTION_KEY = "shop";
const SECTION_TYPE = "JSON";

async function ensurePageSection() {
  let page = await prisma.page.findUnique({ where: { slug: PAGE_SLUG } });
  if (!page) {
    page = await prisma.page.create({
      data: { slug: PAGE_SLUG, name: "Shop" },
    });
  }

  let section = await prisma.section.findUnique({ where: { key: SECTION_KEY } });
  if (!section) {
    section = await prisma.section.create({
      data: { key: SECTION_KEY, type: SECTION_TYPE },
    });
  }

  const existing = await prisma.pageSection.findFirst({
    where: { pageId: page.id, sectionId: section.id },
  });
  if (!existing) {
    await prisma.pageSection.create({
      data: { pageId: page.id, sectionId: section.id, order: 0 },
    });
  }

  return { page, section };
}

/* GET — fetch shop banner content (both locales) */
export async function GET() {
  try {
    const section = await prisma.section.findUnique({
      where: { key: SECTION_KEY },
      include: { translations: true },
    });

    if (!section) {
      return NextResponse.json({ success: true, data: { en: {}, ar: {} } });
    }

    const result = { en: {}, ar: {} };
    section.translations.forEach((t) => {
      result[t.locale] = t.content;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/* PATCH — upsert shop banner for one or both locales */
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { en, ar } = body;

    const { section } = await ensurePageSection();

    const updates = [];
    if (en !== undefined) updates.push({ locale: "en", content: en });
    if (ar !== undefined) updates.push({ locale: "ar", content: ar });

    for (const { locale, content } of updates) {
      await prisma.sectionTranslation.upsert({
        where: { locale_sectionId: { locale, sectionId: section.id } },
        create: { locale, content, sectionId: section.id },
        update: { content },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Shop Banner PATCH error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
