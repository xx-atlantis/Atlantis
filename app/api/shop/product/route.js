import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =========================================================
	POST — Create Product
========================================================= */
export async function POST(req) {
	try {
		const body = await req.json();

		const {
			categoryId,
			price,
			sku,
			inStock = true,
			coverImage,
			images = [],
			en,
			ar,
		} = body;

		/* ---------------- VALIDATION ---------------- */
		if (!categoryId) {
			return NextResponse.json(
				{ success: false, error: "categoryId is required" },
				{ status: 400 }
			);
		}

		if (price == null) {
			return NextResponse.json(
				{ success: false, error: "price is required" },
				{ status: 400 }
			);
		}

		if (!coverImage) {
			return NextResponse.json(
				{ success: false, error: "coverImage is required" },
				{ status: 400 }
			);
		}

		if (!en?.name) {
			return NextResponse.json(
				{ success: false, error: "English name is required" },
				{ status: 400 }
			);
		}

		if (!ar?.name) {
			return NextResponse.json(
				{ success: false, error: "Arabic name is required" },
				{ status: 400 }
			);
		}

		/* ---------------- CREATE PRODUCT ---------------- */
		const product = await prisma.product.create({
			data: {
				categoryId,
				price,
				sku: sku || null,
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
							variant: en.variant || {},
						},
						{
							locale: "ar",
							name: ar.name,
							short_description: ar.short_description || "",
							material: ar.material || "",
							variant: ar.variant || {},
						},
					],
				},
			},
			include: {
				translations: true,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Product created successfully",
			data: product,
		});
	} catch (err) {
		console.error("Product Create Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* =========================================================
	GET — List Products
	?locale=en
========================================================= */
export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);

		const locale = searchParams.get("locale") || "en";
		const categoryId = searchParams.get("categoryId");
		const search = searchParams.get("search");
		const inStock = searchParams.get("inStock");

		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "30");
		const skip = (page - 1) * limit;

		const where = {};

		if (categoryId) where.categoryId = categoryId;
		if (inStock !== null)
			where.inStock = inStock === "true";

		if (search) {
			where.translations = {
				some: {
					locale,
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{
							short_description: {
								contains: search,
								mode: "insensitive",
							},
						},
					],
				},
			};
		}

		const products = await prisma.product.findMany({
			where,
			skip,
			take: limit,
			include: {
				translations: {
					where: { locale },
				},
				category: {
					include: {
						translations: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const items = products.map((p) => {
			const t = p.translations[0] || {};

			const category = {};
			p.category.translations.forEach((tr) => {
				category[tr.locale] = tr.name;
			});

			return {
				id: p.id,
				price: p.price,
				sku: p.sku,
				inStock: p.inStock,
				coverImage: p.coverImage,
				images: p.images,
				categoryId: p.categoryId,

				name: t.name || "",
				short_description: t.short_description || "",
				material: t.material || "",
				variant: t.variant || {},

				category,
			};
		});

		return NextResponse.json({
			success: true,
			page,
			limit,
			count: items.length,
			data: items,
		});
	} catch (err) {
		console.error("Product List Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
