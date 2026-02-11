import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/permissions";

const prisma = new PrismaClient();

/**
	* GET /api/roles/:id
	* Permission: role.read
	*/
export async function GET(req, { params }) {
	try {
		const admin = await authenticateAdmin(req);

		if (!admin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!(await hasPermission(admin.id, "role.read"))) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// ✅ Await params before accessing properties
		const { id } = await params;

		const role = await prisma.role.findUnique({
			where: { id },
			include: {
				permissions: {
					include: {
						permission: true,
					},
				},
			},
		});

		if (!role) {
			return NextResponse.json(
				{ error: "Role not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			id: role.id,
			name: role.name,
			permissions: role.permissions.map((rp) => rp.permission.key),
		});
	} catch (error) {
		console.error("GET /roles/:id error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch role" },
			{ status: 500 }
		);
	}
}

/**
	* PUT /api/roles/:id
	* Permission: role.update
	*/
export async function PUT(req, { params }) {
	try {
		const admin = await authenticateAdmin(req);

		if (!admin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!(await hasPermission(admin.id, "role.update"))) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// ✅ Await params before accessing properties
		const { id } = await params;

		const { name, permissionKeys = [] } = await req.json();

		// 1️⃣ Update role name
		if (name) {
			await prisma.role.update({
				where: { id },
				data: { name },
			});
		}

		// 2️⃣ Replace permissions
		if (Array.isArray(permissionKeys)) {
			await prisma.rolePermission.deleteMany({
				where: { roleId: id },
			});

			if (permissionKeys.length > 0) {
				const permissions = await prisma.permission.findMany({
					where: { key: { in: permissionKeys } },
				});

				await prisma.rolePermission.createMany({
					data: permissions.map((p) => ({
						roleId: id,
						permissionId: p.id,
					})),
				});
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("PUT /roles/:id error:", error);
		return NextResponse.json(
			{ error: "Failed to update role" },
			{ status: 500 }
		);
	}
}

/**
	* DELETE /api/roles/:id
	* Permission: role.delete
	*/
export async function DELETE(req, { params }) {
	try {
		const admin = await authenticateAdmin(req);

		if (!admin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!(await hasPermission(admin.id, "role.delete"))) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// ✅ Await params before accessing properties
		const { id } = await params;

		// ❌ Prevent deleting role if assigned
		const assignedAdmins = await prisma.adminRole.count({
			where: { roleId: id },
		});

		if (assignedAdmins > 0) {
			return NextResponse.json(
				{ error: "Role is assigned to admin(s)" },
				{ status: 400 }
			);
		}

		await prisma.role.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("DELETE /roles/:id error:", error);
		return NextResponse.json(
			{ error: "Failed to delete role" },
			{ status: 500 }
		);
	}
}
