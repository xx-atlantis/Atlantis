import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      select: { slug: true },
      orderBy: { slug: "asc" },
    });

    return NextResponse.json({
      slugs: pages.map((p) => p.slug),
    });
  } catch (err) {
    console.error("Slug Fetch Error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
