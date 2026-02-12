import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =====================================================
   GET → Single portfolio project (by id or slug)
===================================================== */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    const project = await prisma.portfolioProject.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        published: true,
      },
      include: {
        translations: {
          where: { locale },
        },
      },
    });

    if (!project || !project.translations.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const t = project.translations[0];

    return NextResponse.json({
      id: project.id,
      slug: project.slug,
      cover: Array.isArray(project.cover) ? project.cover : project.cover ? [project.cover] : [],
      title: t.title,
      excerpt: t.excerpt,
      content: t.content,
      publishedAt: t.publishedAt,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

//    PUT → Update portfolio project

export async function PUT(req, context) {
  try {
    // ✅ FIX: await params
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Project id is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      slug,
      cover,
      published,
      translations,
      // translations: [
      //   { locale: "en", title, excerpt, content },
      //   { locale: "ar", title, excerpt, content }
      // ]
    } = body;

    if (!translations || !Array.isArray(translations)) {
      return NextResponse.json(
        { error: "translations array is required" },
        { status: 400 }
      );
    }

    const project = await prisma.$transaction(async (tx) => {
      /* ===========================
         1️⃣ Update base project
      =========================== */
      const updatedProject = await tx.portfolioProject.update({
        where: { id }, // ✅ id is now valid
        data: {
          slug,
          cover,
          published,
        },
      });

      /* ===========================
         2️⃣ Update translations
      =========================== */
      for (const t of translations) {
        await tx.portfolioTranslation.upsert({
          where: {
            projectId_locale: {
              projectId: id,
              locale: t.locale,
            },
          },
          update: {
            title: t.title,
            excerpt: t.excerpt,
            content: t.content,
            publishedAt: new Date(),
          },
          create: {
            projectId: id,
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt,
            content: t.content,
            publishedAt: new Date(),
          },
        });
      }

      /* ===========================
         3️⃣ Sync ourPortfolio section
      =========================== */
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

      for (const t of translations) {
        const sectionTranslation = await tx.sectionTranslation.findUnique({
          where: {
            locale_sectionId: {
              locale: t.locale,
              sectionId: sectionEntry.section.id,
            },
          },
        });

        if (!sectionTranslation?.content?.items) continue;

        const updatedItems = sectionTranslation.content.items.map((item) =>
          item.id === id
            ? {
                ...item,
                title: t.title,
                cover: Array.isArray(cover) ? cover[0] : cover ?? item.cover,
                slug: slug ?? item.slug,
              }
            : item
        );

        await tx.sectionTranslation.update({
          where: {
            locale_sectionId: {
              locale: t.locale,
              sectionId: sectionEntry.section.id,
            },
          },
          data: {
            content: {
              ...sectionTranslation.content,
              items: updatedItems,
            },
          },
        });
      }

      return updatedProject;
    });

    return NextResponse.json({
      success: true,
      id: project.id,
    });
  } catch (err) {
    console.error("❌ our-portfolio PUT error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

/* =====================================================
   DELETE → Remove portfolio project
===================================================== */
export async function DELETE(req, context) {
  try {
    // ✅ FIX: await params (Next.js App Router)
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Project id is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      /* ===========================
         1️⃣ Fetch ourPortfolio section
      =========================== */
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

      /* ===========================
         2️⃣ Remove item from ALL locales
      =========================== */
      const translations = await tx.sectionTranslation.findMany({
        where: {
          sectionId: sectionEntry.section.id,
        },
      });

      for (const tr of translations) {
        if (!tr.content?.items) continue;

        const filteredItems = tr.content.items.filter((item) => item.id !== id);

        // If item didn't exist, skip update
        if (filteredItems.length === tr.content.items.length) continue;

        await tx.sectionTranslation.update({
          where: {
            locale_sectionId: {
              locale: tr.locale,
              sectionId: sectionEntry.section.id,
            },
          },
          data: {
            content: {
              ...tr.content,
              items: filteredItems,
            },
          },
        });
      }

      /* ===========================
         3️⃣ Delete project (cascade deletes translations)
      =========================== */
      await tx.portfolioProject.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ our-portfolio DELETE error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}