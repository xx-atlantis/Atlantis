import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =========================================================
	GET — Category Detail
========================================================= */
export async function GET(req, context) {
	try {
		const { id } = context.params;
		const { searchParams } = new URL(req.url);
		const locale = searchParams.get("locale") || "en";

		const category = await prisma.category.findUnique({
			where: { id },
			include: {
				translations: {
					where: { locale },
				},
				_count: {
					select: { products: true },
				},
			},
		});

		if (!category) {
			return NextResponse.json(
				{ success: false, error: "Category not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: {
				id: category.id,
				name: category.translations[0]?.name || "",
				productCount: category._count.products,
			},
		});
	} catch (err) {
		console.error("Category Detail Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* =========================================================
	PUT — Update Category (EN + AR)
========================================================= */
export async function PUT(req, context) {
	try {
		const { id } = context.params;
		const body = await req.json();
		const { en, ar } = body;

		if (!en?.name || !ar?.name) {
			return NextResponse.json(
				{ success: false, error: "Both EN and AR names are required" },
				{ status: 400 }
			);
		}

		const updated = await prisma.category.update({
			where: { id },
			data: {
				translations: {
					upsert: [
						{
							where: {
								locale_categoryId: { locale: "en", categoryId: id },
							},
							create: { locale: "en", name: en.name },
							update: { name: en.name },
						},
						{
							where: {
								locale_categoryId: { locale: "ar", categoryId: id },
							},
							create: { locale: "ar", name: ar.name },
							update: { name: ar.name },
						},
					],
				},
			},
			include: { translations: true },
		});

		return NextResponse.json({
			success: true,
			message: "Category updated successfully",
			data: updated,
		});
	} catch (err) {
		console.error("Category Update Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* =========================================================
	DELETE — Remove Category + Translations
========================================================= */
export async function DELETE(req, context) {
	try {
		const { id } = context.params;

		// Optional safety check
		const count = await prisma.product.count({
			where: { categoryId: id },
		});

		if (count > 0) {
			return NextResponse.json(
				{
					success: false,
					error: "Category cannot be deleted while products exist",
				},
				{ status: 400 }
			);
		}

		await prisma.categoryTranslation.deleteMany({
			where: { categoryId: id },
		});

		await prisma.category.delete({
			where: { id },
		});

		return NextResponse.json({
			success: true,
			message: "Category deleted successfully",
		});
	} catch (err) {
		console.error("Category Delete Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
