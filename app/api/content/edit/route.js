import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const body = await req.json();
    const { page, locale, header, footer, ...dynamicSections } = body;

    // ===========================
    // 1. BASIC VALIDATION
    // ===========================
    if (!page || !locale) {
      return NextResponse.json(
        { error: "page and locale are required" },
        { status: 400 }
      );
    }

    if (!["en", "ar"].includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale (en / ar only)" },
        { status: 400 }
      );
    }

    // ===========================
    // 2. BUILD SECTIONS PAYLOAD
    // ===========================
    // We combine standard parts and any extra keys (like packages/ordersummary)
    const sectionsToUpdate = {
      header,
      footer,
      ...dynamicSections,
    };

    // Clean up undefined values so we don't try to update null fields
    Object.keys(sectionsToUpdate).forEach(
      (key) => sectionsToUpdate[key] === undefined && delete sectionsToUpdate[key]
    );

    // ===========================
    // 3. FETCH PAGE & LINKED SECTIONS
    // ===========================
    const pageData = await prisma.page.findUnique({
      where: { slug: page },
      include: {
        sections: {
          include: { section: true },
        },
      },
    });

    if (!pageData) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // ===========================
    // 4. PREPARE UPSERT OPERATIONS
    // ===========================
    const ops = [];

    for (const pageSection of pageData.sections) {
      const key = pageSection.section.key;

      // If this specific section key exists in our incoming JSON payload
      if (sectionsToUpdate[key]) {
        ops.push(
          prisma.sectionTranslation.upsert({
            where: {
              locale_sectionId: {
                locale,
                sectionId: pageSection.section.id,
              },
            },
            update: {
              content: sectionsToUpdate[key],
            },
            create: {
              locale,
              sectionId: pageSection.section.id,
              content: sectionsToUpdate[key],
            },
          })
        );
      }
    }

    // ===========================
    // 5. EXECUTE DATABASE UPDATE
    // ===========================
    if (ops.length > 0) {
      await prisma.$transaction(ops);
    }

    return NextResponse.json({
      success: true,
      updatedSections: Object.keys(sectionsToUpdate),
      count: ops.length
    });

  } catch (err) {
    console.error("❌ page update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}