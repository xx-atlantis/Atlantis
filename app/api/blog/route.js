import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/blog?locale=en|ar
 * Fetch blogs based on locale
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    if (!["en", "ar"].includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale (en / ar only)" },
        { status: 400 }
      );
    }

    const blogs = await prisma.blog.findMany({
      where: {
        published: true,
        translations: {
          some: { locale }, // ensures blog has this language
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        translations: {
          where: { locale },
          select: {
            title: true,
            excerpt: true,
            publishedAt: true,
            metaTitle: true,
            metaDescription: true,
          },
        },
      },
    });

    // 🔥 Flatten response (frontend-friendly)
    const response = blogs.map((blog) => ({
      id: blog.id,
      slug: blog.slug,
      cover: blog.cover,
      published: blog.published,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      ...blog.translations[0], // locale-specific content
    }));

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog
 * Create a new blog (single locale)
 */
export async function POST(req) {
  try {
    const body = await req.json();

    const { slug, cover, en, ar } = body;

    if (!slug || !en || !ar) {
      return NextResponse.json(
        { error: "slug, en and ar objects are required" },
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
       DATE FIX (for both locales)
    ========================= */
    const enPublishedAt = en.publishedAt
      ? new Date(en.publishedAt).toISOString()
      : null;

    const arPublishedAt = ar.publishedAt
      ? new Date(ar.publishedAt).toISOString()
      : null;

    const blog = await prisma.blog.create({
      data: {
        slug,
        cover,
        translations: {
          create: [
            {
              locale: "en",
              title: en.title,
              excerpt: en.excerpt,
              content: en.content,
              publishedAt: enPublishedAt,
              metaTitle: en.metaTitle,
              metaDescription: en.metaDescription,
            },
            {
              locale: "ar",
              title: ar.title,
              excerpt: ar.excerpt,
              content: ar.content,
              publishedAt: arPublishedAt,
              metaTitle: ar.metaTitle,
              metaDescription: ar.metaDescription,
            },
          ],
        },
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to create blog" },
      { status: 500 }
    );
  }
}
