import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const pageSlug = searchParams.get("page");
    const locale = searchParams.get("locale") || "en";

    if (!pageSlug) {
      return NextResponse.json({ error: "Missing ?page=" }, { status: 400 });
    }

    if (!["en", "ar"].includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale (en/ar only)" },
        { status: 400 }
      );
    }

    // ===== 1) GLOBAL SECTIONS =====
    const globalPage = await prisma.page.findUnique({
      where: { slug: "global" },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            section: {
              include: {
                translations: { where: { locale } },
              },
            },
          },
        },
      },
    });

    const globalData = {};
    globalPage?.sections.forEach((ps) => {
      const key = ps.section.key;
      const content = ps.section.translations[0]?.content || null;
      if (key) globalData[key] = content;
    });

    // ✅ page=orders -> return globals only
    if (pageSlug === "orders") {
      return NextResponse.json(
        {
          page: "orders",
          locale,
          ...globalData,
        },
        { status: 200 }
      );
    }

    // ===== 2) PAGE SECTIONS =====
    const page = await prisma.page.findUnique({
      where: { slug: pageSlug },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            section: {
              include: {
                translations: { where: { locale } },
              },
            },
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const pageData = {};
    page.sections.forEach((ps) => {
      const key = ps.section.key;
      const content = ps.section.translations[0]?.content || null;
      if (key) pageData[key] = content;
    });

    // ===== 3) MERGE GLOBAL + PAGE SECTIONS =====
    return NextResponse.json(
      {
        page: page.slug,
        locale,
        ...globalData,
        ...pageData,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("CMS Error:", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message },
      { status: 500 }
    );
  }
}
