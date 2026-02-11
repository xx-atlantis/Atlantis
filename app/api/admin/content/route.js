import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ============================================================
   GET — Fetch one page (all translations: en + ar)
   Example: /api/admin/content?page=home
============================================================ */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pageSlug = searchParams.get("page");

    if (!pageSlug) {
      return NextResponse.json(
        { success: false, error: "Missing ?page=<slug>" },
        { status: 400 }
      );
    }

    const page = await prisma.page.findUnique({
      where: { slug: pageSlug },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            section: {
              include: {
                translations: true, // <-- return en + ar both versions
              },
            },
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    // -------- Format into a clean object --------
    const result = {};

    page.sections.forEach((ps) => {
      const key = ps.section.key;
      const translated = {};

      ps.section.translations.forEach((t) => {
        translated[t.locale] = t.content;
      });

      result[key] = translated;
    });

    return NextResponse.json({
      success: true,
      page: pageSlug,
      data: result,
    });
  } catch (err) {
    console.error("Admin GET Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/* ============================================================
   PATCH — Update a specific section translation
============================================================ */
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { page, key, locale, content } = body;

    if (!page || !key || !locale) {
      return NextResponse.json(
        { success: false, error: "page, key, locale required" },
        { status: 400 }
      );
    }

    // Find the correct section
    const found = await prisma.pageSection.findFirst({
      where: {
        page: { slug: page },
        section: { key },
      },
      include: { section: true },
    });

    if (!found) {
      return NextResponse.json(
        { success: false, error: "Section not found" },
        { status: 404 }
      );
    }

    const sectionId = found.sectionId;

    // Upsert translation
    await prisma.sectionTranslation.upsert({
      where: {
        locale_sectionId: { locale, sectionId },
      },
      create: { locale, content, sectionId },
      update: { content },
    });

    return NextResponse.json({ success: true, message: "Updated" });
  } catch (err) {
    console.error("Admin PATCH Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
