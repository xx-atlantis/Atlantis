import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================================================
   PATCH — Bulk update fields on selected products
   Body: { ids: string[], update: { showInShop?: boolean, inStock?: boolean } }
========================================================= */
export async function PATCH(req) {
  try {
    const { ids, update } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "ids must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!update || typeof update !== "object") {
      return NextResponse.json(
        { success: false, error: "update object is required" },
        { status: 400 }
      );
    }

    const allowedFields = ["showInShop", "inStock"];
    const data = {};
    for (const field of allowedFields) {
      if (update[field] !== undefined) data[field] = update[field];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data,
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (err) {
    console.error("Bulk Product Update Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST — Bulk create products
========================================================= */
export async function POST(req) {
  try {
    const body = await req.json();

    // Body must be an array
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Body must be an array of products" },
        { status: 400 }
      );
    }

    const formattedData = [];

    for (const item of body) {
      const {
        categoryId,
        price,
        inStock = true,
        coverImage,
        images = [],
        en,
        ar,
      } = item;

      // ----------------------------
      // VALIDATION

      if (!categoryId)
        throw new Error("categoryId missing in one of the items");
      if (!en?.name) throw new Error("en.name missing in one of the items");
      if (!ar?.name) throw new Error("ar.name missing in one of the items");
      if (price == null) throw new Error("price missing in one of the items");
      if (!coverImage)
        throw new Error("coverImage missing in one of the items");

      // ----------------------------
      // STRUCTURE FOR BULK CREATE
      // ----------------------------
      formattedData.push({
        categoryId,
        price,
        inStock,
        coverImage,
        images,
        translations: {
          create: [
            {
              locale: "en",
              name: en.name,
              short_description: en.short_description || "",
              material: en.material || "",
              variant: en.variant || {}, // JSON FIELD
            },
            {
              locale: "ar",
              name: ar.name,
              short_description: ar.short_description || "",
              material: ar.material || "",
              variant: ar.variant || {}, // JSON FIELD
            },
          ],
        },
      });
    }

    // ----------------------------
    // BULK CREATE (TRANSACTION)
    // ----------------------------
    const result = await prisma.$transaction(
      formattedData.map((p) => prisma.product.create({ data: p }))
    );

    return NextResponse.json({
      success: true,
      message: "Bulk products created successfully",
      count: result.length,
      data: result,
    });
  } catch (err) {
    console.error("Bulk Product Upload Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
