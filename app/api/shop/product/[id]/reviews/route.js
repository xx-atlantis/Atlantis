import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* GET /api/shop/product/[id]/reviews — list approved reviews */
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const result = await prisma.$runCommandRaw({
      find: "ProductReview",
      filter: { productId: { $oid: id }, approved: true },
      sort: { createdAt: -1 },
      limit: 50,
    });

    const reviews = result?.cursor?.firstBatch || [];

    return NextResponse.json({ success: true, data: reviews });
  } catch (err) {
    console.error("Reviews GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/* POST /api/shop/product/[id]/reviews — submit a review */
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, rating, comment } = body;

    if (!name?.trim() || !comment?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name and comment are required" },
        { status: 400 }
      );
    }

    const clampedRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

    await prisma.$runCommandRaw({
      insert: "ProductReview",
      documents: [
        {
          productId: { $oid: id },
          name: name.trim(),
          rating: clampedRating,
          comment: comment.trim(),
          approved: true,
          createdAt: { $date: new Date().toISOString() },
        },
      ],
    });

    return NextResponse.json({ success: true, message: "Review submitted" });
  } catch (err) {
    console.error("Reviews POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
