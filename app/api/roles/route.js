import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/permissions";

const prisma = new PrismaClient();

/**
	* GET /api/roles
	* Permission: role.read
	*/
export async function GET(req) {
	try {
		const admin = await authenticateAdmin(req);

		if (!admin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!(await hasPermission(admin.id, "role.read"))) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const roles = await prisma.role.findMany({
			include: {
				permissions: {
					include: {
						permission: true,
					},
				},
			},
		});

		const data = roles.map((role) => ({
			id: role.id,
			name: role.name,
			permissions: role.permissions.map((rp) => rp.permission.key),
		}));

		return NextResponse.json(data);
	} catch (error) {
		console.error("GET /roles error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch roles" },
			{ status: 500 }
		);
	}
}

/**
	* POST /api/roles
	* Permission: role.create
	*/
export async function POST(req) {
	try {
		// 🔐 Authenticate admin
		const admin = await authenticateAdmin(req);

		if (!admin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 🔒 Permission check
		if (!(await hasPermission(admin.id, "role.create"))) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { name, permissionKeys = [] } = await req.json();

		// 🧪 Validation
		if (!name || typeof name !== "string") {
			return NextResponse.json(
				{ error: "Role name is required" },
				{ status: 400 }
			);
		}

		// 🔍 Check if role name already exists
		const existingRole = await prisma.role.findUnique({
			where: { name },
		});

		if (existingRole) {
			return NextResponse.json(
				{ error: "Role with this name already exists" },
				{ status: 409 }
			);
		}

		// 1️⃣ Create role
		const role = await prisma.role.create({
			data: { name },
		});

		// 2️⃣ Attach permissions (optional)
		if (Array.isArray(permissionKeys) && permissionKeys.length > 0) {
			const permissions = await prisma.permission.findMany({
				where: { key: { in: permissionKeys } },
			});

			await prisma.rolePermission.createMany({
				data: permissions.map((p) => ({
					roleId: role.id,
					permissionId: p.id,
				})),
			});
		}

		return NextResponse.json(
			{
				id: role.id,
				name: role.name,
				permissions: permissionKeys,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("POST /roles error:", error);
		return NextResponse.json(
			{ error: "Failed to create role" },
			{ status: 500 }
		);
	}
}
