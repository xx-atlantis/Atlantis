import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authenticateAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/permissions";

const prisma = new PrismaClient();

/**
	* GET /api/admins/:id
	* Permission: user.read
	*/
export async function GET(req, { params }) {
	try {
		const admin = await authenticateAdmin(req);
		if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (!(await hasPermission(admin.id, "user.read")))
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });

		// ✅ Await params before accessing properties
		const { id } = await params;

		const user = await prisma.admin.findUnique({
			where: { id },
			include: {
				roles: {
					include: { role: true },
				},
			},
		});

		if (!user) {
			return NextResponse.json({ error: "Admin not found" }, { status: 404 });
		}

		return NextResponse.json({
			id: user.id,
			email: user.email,
			isActive: user.isActive,
			roles: user.roles.map((r) => ({
				id: r.role.id,
				name: r.role.name,
			})),
		});
	} catch (error) {
		console.error("GET /admins/:id error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch admin" },
			{ status: 500 }
		);
	}
}

/**
	* PUT /api/admins/:id
	* Permission: user.update
	*/
export async function PUT(req, { params }) {
	try {
		const admin = await authenticateAdmin(req);
		if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (!(await hasPermission(admin.id, "user.update")))
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });

		// ✅ Await params before accessing properties
		const { id } = await params;

		const { password, roleIds = [], isActive } = await req.json();

		// Update password if provided
		if (password) {
			const hashed = await bcrypt.hash(password, 10);
			await prisma.admin.update({
				where: { id },
				data: { password: hashed },
			});
		}

		// Update active state
		if (typeof isActive === "boolean") {
			await prisma.admin.update({
				where: { id },
				data: { isActive },
			});
		}

		// Replace roles
		if (Array.isArray(roleIds)) {
			await prisma.adminRole.deleteMany({
				where: { adminId: id },
			});

			if (roleIds.length > 0) {
				await prisma.adminRole.createMany({
					data: roleIds.map((roleId) => ({
						adminId: id,
						roleId,
					})),
				});
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("PUT /admins/:id error:", error);
		return NextResponse.json(
			{ error: "Failed to update admin" },
			{ status: 500 }
		);
	}
}

/**
	* DELETE /api/admins/:id
	* Permission: user.delete
	*/
export async function DELETE(req, { params }) {
	try {
		const admin = await authenticateAdmin(req);
		if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (!(await hasPermission(admin.id, "user.delete")))
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });

		// ✅ Await params before accessing properties
		const { id } = await params;

		// Delete admin roles first (foreign key constraint)
		await prisma.adminRole.deleteMany({
			where: { adminId: id },
		});

		// Then delete the admin
		await prisma.admin.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("DELETE /admins/:id error:", error);
		return NextResponse.json(
			{ error: "Failed to delete admin" },
			{ status: 500 }
		);
	}
}
