import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =========================================================
	GET — Product Detail
========================================================= */
export async function GET(req, context) {
	try {
		const params = await context.params;
		const { id } = params;

		if (!id || id.length < 10) {
			return NextResponse.json(
				{ success: false, error: "Invalid or missing product ID" },
				{ status: 400 }
			);
		}

		const { searchParams } = new URL(req.url);
		const locale = searchParams.get("locale") || "en";

		const product = await prisma.product.findUnique({
			where: { id },
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
		});

		if (!product) {
			return NextResponse.json(
				{ success: false, error: "Product not found" },
				{ status: 404 }
			);
		}

		const t = product.translations[0] || {};

		const category = {
			id: product.category.id,
			names: Object.fromEntries(
				product.category.translations.map((tr) => [
					tr.locale,
					tr.name,
				])
			),
		};

		return NextResponse.json({
			success: true,
			data: {
				id: product.id,
				price: product.price,
				sku: product.sku,
				inStock: product.inStock,
				images: product.images,
		coverImage: product.coverImage,

		// 🔥 IMPORTANT: CATEGORY ID (for admin edit)
		categoryId: product.categoryId,

			name: t.name || "",
			short_description: t.short_description || "",
			material: t.material || "",
			variant: t.variant || {},

		// 🔥 CATEGORY - bilingual (for display only)
		category: {
			id: product.category.id,
			names: Object.fromEntries(
				product.category.translations.map((tr) => [tr.locale, tr.name])
			),
		},
			},
		});
	} catch (err) {
		console.error("Product Detail Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* =========================================================
	PUT — Update Product
========================================================= */
export async function PUT(req, context) {
	try {
		const params = await context.params;
		const { id } = params;

		const body = await req.json();

		const {
			categoryId,
			price,
			sku,
			inStock,
			coverImage,
			images,
			en,
			ar,
		} = body;

		if (!categoryId || price == null || !en?.name || !ar?.name) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const updated = await prisma.product.update({
			where: { id },
			data: {
				categoryId,
				price,
				sku: sku || null,
				inStock,
				coverImage,
				images,

				translations: {
					upsert: [
						{
							where: {
								locale_productId: {
									locale: "en",
									productId: id,
								},
							},
							create: {
								locale: "en",
								name: en.name,
								short_description: en.short_description || "",
								material: en.material || "",
								variant: en.variant || {},
							},
							update: {
								name: en.name,
								short_description: en.short_description || "",
								material: en.material || "",
								variant: en.variant || {},
							},
						},
						{
							where: {
								locale_productId: {
									locale: "ar",
									productId: id,
								},
							},
							create: {
								locale: "ar",
								name: ar.name,
								short_description: ar.short_description || "",
								material: ar.material || "",
								variant: ar.variant || {},
							},
							update: {
								name: ar.name,
								short_description: ar.short_description || "",
								material: ar.material || "",
								variant: ar.variant || {},
							},
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
			message: "Product updated successfully",
			data: updated,
		});
	} catch (err) {
		console.error("Product Update Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* =========================================================
	DELETE — Remove Product + Translations
========================================================= */
export async function DELETE(req, context) {
	try {
		const params = await context.params;
		const { id } = params;

		await prisma.productTranslation.deleteMany({
			where: { productId: id },
		});

		await prisma.product.delete({
			where: { id },
		});

		return NextResponse.json({
			success: true,
			message: "Product deleted successfully",
		});
	} catch (err) {
		console.error("Product Delete Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
