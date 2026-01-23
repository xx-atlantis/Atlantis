import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const body = await req.json();
    const { page, locale, header, footer, ...rest } = body;

    // ===========================
    // BASIC VALIDATION
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
    // DETECT DYNAMIC SECTION
    // ===========================
    const dynamicSectionKeys = Object.keys(rest);

    if (dynamicSectionKeys.length > 1) {
      return NextResponse.json(
        { error: "Only one dynamic page section is allowed per request" },
        { status: 400 }
      );
    }

    const dynamicSectionKey = dynamicSectionKeys[0]; // e.g. ourPortfolio
    const dynamicSectionContent = rest[dynamicSectionKey];

    // ===========================
    // BUILD SECTIONS PAYLOAD
    // ===========================
    const sections = {
      header,
      footer,
      ...(dynamicSectionKey
        ? { [dynamicSectionKey]: dynamicSectionContent }
        : {}),
    };

    Object.keys(sections).forEach(
      (key) => sections[key] === undefined && delete sections[key]
    );

    // ===========================
    // FETCH PAGE + SECTIONS
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
    // UPSERT TRANSLATIONS
    // ===========================
    const ops = [];

    for (const ps of pageData.sections) {
      const key = ps.section.key;

      if (!sections[key]) continue;

      ops.push(
        prisma.sectionTranslation.upsert({
          where: {
            locale_sectionId: {
              locale,
              sectionId: ps.section.id,
            },
          },
          update: {
            content: sections[key],
          },
          create: {
            locale,
            sectionId: ps.section.id,
            content: sections[key],
          },
        })
      );
    }

    await prisma.$transaction(ops);

    return NextResponse.json({
      success: true,
      updated: Object.keys(sections),
    });
  } catch (err) {
    console.error("❌ page update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
