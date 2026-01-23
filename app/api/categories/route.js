import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =========================================================
	POST — Create Category
========================================================= */
export async function POST(req) {
	try {
		const body = await req.json();
		const { en, ar } = body;

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

		const category = await prisma.category.create({
			data: {
				translations: {
					create: [
						{ locale: "en", name: en.name },
						{ locale: "ar", name: ar.name },
					],
				},
			},
			include: {
				translations: true,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Category created successfully",
			data: category,
		});
	} catch (err) {
		console.error("Category Create Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}

/* =========================================================
	GET — List Categories
	?locale=en
========================================================= */
export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const locale = searchParams.get("locale") || "en";

		const categories = await prisma.category.findMany({
			include: {
				translations: {
					where: { locale },
				},
				_count: {
					select: { products: true },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const items = categories.map((c) => ({
			id: c.id,
			name: c.translations[0]?.name || "",
			productCount: c._count.products,
		}));

		return NextResponse.json({
			success: true,
			count: items.length,
			data: items,
		});
	} catch (err) {
		console.error("Category List Error:", err);
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
