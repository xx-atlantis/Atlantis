import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/permissions";

const prisma = new PrismaClient();

/**
	* GET /api/permissions
	* Fetch all system permissions
	*/
export async function GET(req) {
	try {
		// 1️⃣ Authenticate admin
		const admin = await authenticateAdmin(req);

		if (!admin) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// 2️⃣ RBAC check
		// You can also use "permission.read" if you prefer
		const allowed = await hasPermission(admin.id, "role.read");

		if (!allowed) {
			return NextResponse.json(
				{ error: "Forbidden" },
				{ status: 403 }
			);
		}

		// 3️⃣ Fetch permissions
		const permissions = await prisma.permission.findMany({
			orderBy: { key: "asc" },
		});

		// 4️⃣ Shape response (UI-friendly)
		const data = permissions.map((p) => ({
			id: p.id,
			key: p.key,
			group: p.key.split(".")[0], // e.g. "order.read" → "order"
			action: p.key.split(".")[1], // e.g. "read"
		}));

		return NextResponse.json(data);
	} catch (error) {
		console.error("GET /permissions error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch permissions" },
			{ status: 500 }
		);
	}
}
