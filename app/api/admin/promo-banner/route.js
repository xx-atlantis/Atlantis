import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SLUG = "global";
const SECTION_KEY = "promoBanner";
const SECTION_TYPE = "JSON";

async function ensurePageSection() {
  let page = await prisma.page.findUnique({ where: { slug: PAGE_SLUG } });
  if (!page) {
    page = await prisma.page.create({ data: { slug: PAGE_SLUG, name: "Global" } });
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
      data: { pageId: page.id, sectionId: section.id, order: 99 },
    });
  }

  return section;
}

export async function GET() {
  try {
    const section = await prisma.section.findUnique({
      where: { key: SECTION_KEY },
      include: { translations: { where: { locale: "en" } } },
    });

    const content = section?.translations?.[0]?.content || {
      isActive: false, textEn: "", textAr: "", link: "", bgColor: "#2D3247", textColor: "#ffffff",
    };

    return NextResponse.json({ success: true, data: content });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const section = await ensurePageSection();

    // Store in "en" locale — front-end reads from global data regardless of locale
    await prisma.sectionTranslation.upsert({
      where: { locale_sectionId: { locale: "en", sectionId: section.id } },
      create: { locale: "en", content: body, sectionId: section.id },
      update: { content: body },
    });

    // Mirror to "ar" so the global CMS read (which filters by locale) picks it up
    await prisma.sectionTranslation.upsert({
      where: { locale_sectionId: { locale: "ar", sectionId: section.id } },
      create: { locale: "ar", content: body, sectionId: section.id },
      update: { content: body },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Promo Banner PATCH error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
