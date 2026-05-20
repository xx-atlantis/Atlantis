import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Logos are stored as a locale-neutral CMS section (locale = "any")
// Content shape: { logos: [{ id, url, alt, order }] }

async function ensureSection() {
  const page = await prisma.page.upsert({
    where: { slug: "global" },
    create: { slug: "global", name: "Global" },
    update: {},
  });

  const section = await prisma.section.upsert({
    where: { key: "client-logos" },
    create: { key: "client-logos", type: "LIST" },
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

async function getLogos(sectionId) {
  const t = await prisma.sectionTranslation.findFirst({
    where: { sectionId, locale: "any" },
  });
  const logos = t?.content?.logos ?? [];
  return logos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// GET — return all logos
export async function GET() {
  try {
    const sectionId = await ensureSection();
    const logos = await getLogos(sectionId);
    return NextResponse.json({ success: true, data: logos });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST — add a new logo
export async function POST(req) {
  try {
    const { url, alt } = await req.json();
    if (!url) return NextResponse.json({ success: false, error: "url required" }, { status: 400 });

    const sectionId = await ensureSection();
    const logos = await getLogos(sectionId);

    const newLogo = {
      id: crypto.randomUUID(),
      url,
      alt: alt || "",
      order: logos.length,
    };

    const updated = [...logos, newLogo];

    await prisma.sectionTranslation.upsert({
      where: { locale_sectionId: { locale: "any", sectionId } },
      create: { locale: "any", content: { logos: updated }, sectionId },
      update: { content: { logos: updated } },
    });

    return NextResponse.json({ success: true, data: newLogo });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH — update a logo (alt, order) or reorder all
export async function PATCH(req) {
  try {
    const body = await req.json();
    const sectionId = await ensureSection();

    // Full reorder: { logos: [...] }
    if (Array.isArray(body.logos)) {
      const reordered = body.logos.map((l, i) => ({ ...l, order: i }));
      await prisma.sectionTranslation.upsert({
        where: { locale_sectionId: { locale: "any", sectionId } },
        create: { locale: "any", content: { logos: reordered }, sectionId },
        update: { content: { logos: reordered } },
      });
      return NextResponse.json({ success: true });
    }

    // Single update: { id, alt }
    const { id, alt } = body;
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const logos = await getLogos(sectionId);
    const updated = logos.map((l) => (l.id === id ? { ...l, alt: alt ?? l.alt } : l));

    await prisma.sectionTranslation.upsert({
      where: { locale_sectionId: { locale: "any", sectionId } },
      create: { locale: "any", content: { logos: updated }, sectionId },
      update: { content: { logos: updated } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE — remove a logo by id
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const sectionId = await ensureSection();
    const logos = await getLogos(sectionId);
    const updated = logos.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i }));

    await prisma.sectionTranslation.upsert({
      where: { locale_sectionId: { locale: "any", sectionId } },
      create: { locale: "any", content: { logos: updated }, sectionId },
      update: { content: { logos: updated } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
