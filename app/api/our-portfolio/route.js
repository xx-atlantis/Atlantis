import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    const projects = await prisma.portfolioProject.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: {
        translations: {
          where: { locale },
        },
      },
    });

    const data = projects.map((p) => {
      const t = p.translations[0];
      return {
        id: p.id,
        slug: p.slug,
        cover: p.cover,
        title: t?.title,
        excerpt: t?.excerpt,
        publishedAt: t?.publishedAt,
      };
    });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch portfolio projects" },
      { status: 500 }
    );
  }
}
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      slug,
      cover,
      published = true,
      translations,
      // translations: [
      //   { locale: "en", title, excerpt, content },
      //   { locale: "ar", title, excerpt, content }
      // ]
    } = body;

    // ===========================
    // VALIDATION
    // ===========================
    if (!slug || !translations?.length) {
      return NextResponse.json(
        { error: "slug and translations are required" },
        { status: 400 }
      );
    }

    const locales = translations.map((t) => t.locale);
    const uniqueLocales = new Set(locales);

    if (locales.length !== uniqueLocales.size) {
      return NextResponse.json(
        { error: "Duplicate locales in translations" },
        { status: 400 }
      );
    }

    // ===========================
    // TRANSACTION
    // ===========================
    const project = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create portfolio project
      const createdProject = await tx.portfolioProject.create({
        data: {
          slug,
          cover,
          published,
          translations: {
            create: translations.map((t) => ({
              locale: t.locale,
              title: t.title,
              excerpt: t.excerpt,
              content: t.content,
              publishedAt: new Date(),
            })),
          },
        },
      });

      // 2️⃣ Fetch our-portfolio page
      const page = await tx.page.findUnique({
        where: { slug: "our-portfolio" },
        include: {
          sections: {
            include: { section: true },
          },
        },
      });

      if (!page) throw new Error("our-portfolio page not found");

      const sectionEntry = page.sections.find(
        (ps) => ps.section.key === "ourPortfolio"
      );

      if (!sectionEntry) throw new Error("ourPortfolio section not found");

      // 3️⃣ Update section translation PER locale
      for (const t of translations) {
        const existingTranslation = await tx.sectionTranslation.findUnique({
          where: {
            locale_sectionId: {
              locale: t.locale,
              sectionId: sectionEntry.section.id,
            },
          },
        });

        const existingContent = existingTranslation?.content || {};
        const existingItems = existingContent.items || [];

        const newItem = {
          id: createdProject.id,
          slug: createdProject.slug,
          title: t.title,
          cover: cover,
        };

        await tx.sectionTranslation.upsert({
          where: {
            locale_sectionId: {
              locale: t.locale,
              sectionId: sectionEntry.section.id,
            },
          },
          update: {
            content: {
              ...existingContent,
              items: [...existingItems, newItem],
            },
          },
          create: {
            locale: t.locale,
            sectionId: sectionEntry.section.id,
            content: {
              items: [newItem],
            },
          },
        });
      }

      return createdProject;
    });

    return NextResponse.json({
      success: true,
      id: project.id,
      slug: project.slug,
    });
  } catch (err) {
    console.error("❌ our-portfolio POST error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
