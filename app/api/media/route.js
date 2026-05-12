import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") || 200), 500);
  const skip = Number(searchParams.get("skip") || 0);

  try {
    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.mediaAsset.count(),
    ]);

    return NextResponse.json({ success: true, data: assets, total });
  } catch (err) {
    console.error("GET /api/media:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

  try {
    await prisma.mediaAsset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
