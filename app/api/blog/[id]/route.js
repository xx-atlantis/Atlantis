import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/blog/[id]?locale=en
 * Fetch single blog by ID
 */
export async function GET(req, context) {
  try {
    // ✅ FIX: await params
    const { id } = await context.params;

    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    if (!["en", "ar"].includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale (en / ar only)" },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.findUnique({
      where: { id }, // ✅ safe now
      include: {
        translations: {
          where: { locale },
        },
      },
    });

    if (!blog || !blog.translations.length) {
      return NextResponse.json(
        { error: "Blog not found for this locale" },
        { status: 404 }
      );
    }

    // 🔥 Flatten response (recommended)
    const response = {
      id: blog.id,
      slug: blog.slug,
      cover: blog.cover,
      published: blog.published,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      ...blog.translations[0],
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blog/[id]
 * Update blog + upsert translation
 */
export async function PUT(req, context) {
  try {
    // ✅ await params (Next.js App Router)
    const { id } = await context.params;
    const body = await req.json();

    const { cover, published, en, ar } = body;

    if (!en || !ar) {
      return NextResponse.json(
        { error: "Both en and ar objects are required" },
        { status: 400 }
      );
    }

    if (!en.title || !en.content || !ar.title || !ar.content) {
      return NextResponse.json(
        { error: "Both EN and AR must have title and content" },
        { status: 400 }
      );
    }

    /* =========================
       DATE FIX (HTML date → ISO)
    ========================= */
    const enPublishedAt = en.publishedAt
      ? new Date(en.publishedAt).toISOString()
      : null;

    const arPublishedAt = ar.publishedAt
      ? new Date(ar.publishedAt).toISOString()
      : null;

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        cover,
        published,

        translations: {
          upsert: [
            {
              where: {
                blogId_locale: {
                  blogId: id,
                  locale: "en",
                },
              },
              update: {
                title: en.title,
                excerpt: en.excerpt,
                content: en.content,
                publishedAt: enPublishedAt,
                metaTitle: en.metaTitle,
                metaDescription: en.metaDescription,
              },
              create: {
                locale: "en",
                title: en.title,
                excerpt: en.excerpt,
                content: en.content,
                publishedAt: enPublishedAt,
                metaTitle: en.metaTitle,
                metaDescription: en.metaDescription,
              },
            },
            {
              where: {
                blogId_locale: {
                  blogId: id,
                  locale: "ar",
                },
              },
              update: {
                title: ar.title,
                excerpt: ar.excerpt,
                content: ar.content,
                publishedAt: arPublishedAt,
                metaTitle: ar.metaTitle,
                metaDescription: ar.metaDescription,
              },
              create: {
                locale: "ar",
                title: ar.title,
                excerpt: ar.excerpt,
                content: ar.content,
                publishedAt: arPublishedAt,
                metaTitle: ar.metaTitle,
                metaDescription: ar.metaDescription,
              },
            },
          ],
        },
      },
    });

    return NextResponse.json(blog);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to update blog" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/[id]
 * Delete blog completely
 */
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;

    await prisma.$transaction([
      prisma.blogTranslation.deleteMany({
        where: { blogId: id },
      }),
      prisma.blog.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to delete blog" },
      { status: 500 }
    );
  }
}
