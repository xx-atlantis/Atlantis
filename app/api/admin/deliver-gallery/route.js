import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Stored under section key "deliver-gallery", locale "en"
// Content shape: { headingEn, headingAr, subheadingEn, subheadingAr, images: [{ id, url, alt, order }] }
const SECTION_KEY = "deliver-gallery";
const LOCALE = "en";

const DEFAULTS = {
  headingEn: "What We Deliver",
  headingAr: "ما نقدمه",
  subheadingEn: "A look at the transformations we create for our clients across the GCC.",
  subheadingAr: "لمحة عن التحولات التي نصنعها لعملائنا في دول الخليج.",
  images: [],
};

async function ensureSection() {
  const page = await prisma.page.upsert({
    where: { slug: "global" },
    create: { slug: "global", name: "Global" },
    update: {},
  });

  const section = await prisma.section.upsert({
    where: { key: SECTION_KEY },
    create: { key: SECTION_KEY, type: "LIST" },
    update: {},
  });

  const existing = await prisma.pageSection.findFirst({
    where: { pageId: page.id, sectionId: section.id },
  });
  if (!existing) {
    await prisma.pageSection.create({
      data: { pageId: page.id, sectionId: section.id, order: 0 },
    });
  }

  return section.id;
}

async function getData(sectionId) {
  const t = await prisma.sectionTranslation.findFirst({
    where: { sectionId, locale: LOCALE },
  });
  const content = t?.content ?? {};
  return {
    headingEn: content.headingEn ?? DEFAULTS.headingEn,
    headingAr: content.headingAr ?? DEFAULTS.headingAr,
    subheadingEn: content.subheadingEn ?? DEFAULTS.subheadingEn,
    subheadingAr: content.subheadingAr ?? DEFAULTS.subheadingAr,
    images: (content.images ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  };
}

async function saveData(sectionId, data) {
  await prisma.sectionTranslation.upsert({
    where: { locale_sectionId: { locale: LOCALE, sectionId } },
    create: { locale: LOCALE, content: data, sectionId },
    update: { content: data },
  });
}

// GET
export async function GET() {
  try {
    const sectionId = await ensureSection();
    const data = await getData(sectionId);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH — update headings or reorder/add images
export async function PATCH(req) {
  try {
    const body = await req.json();
    const sectionId = await ensureSection();
    const current = await getData(sectionId);

    const updated = {
      headingEn: body.headingEn ?? current.headingEn,
      headingAr: body.headingAr ?? current.headingAr,
      subheadingEn: body.subheadingEn ?? current.subheadingEn,
      subheadingAr: body.subheadingAr ?? current.subheadingAr,
      images: Array.isArray(body.images)
        ? body.images.map((img, i) => ({ ...img, order: i }))
        : current.images,
    };

    await saveData(sectionId, updated);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST — add a single image
export async function POST(req) {
  try {
    const { url, alt } = await req.json();
    if (!url) return NextResponse.json({ success: false, error: "url required" }, { status: 400 });

    const sectionId = await ensureSection();
    const current = await getData(sectionId);

    const newImage = { id: crypto.randomUUID(), url, alt: alt || "", order: current.images.length };
    const updated = { ...current, images: [...current.images, newImage] };
    await saveData(sectionId, updated);

    return NextResponse.json({ success: true, data: newImage });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE — remove image by id
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const sectionId = await ensureSection();
    const current = await getData(sectionId);
    const images = current.images.filter((img) => img.id !== id).map((img, i) => ({ ...img, order: i }));
    await saveData(sectionId, { ...current, images });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
