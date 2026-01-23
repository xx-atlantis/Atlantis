import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authenticateAdmin } from "@/lib/adminAuth";
import { hasPermission } from "@/lib/permissions";

const prisma = new PrismaClient();

/**
	* GET /api/admins
	* Permission: user.read
	*/
export async function GET(req) {
	try {
		const admin = await authenticateAdmin(req);

		if (!admin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!(await hasPermission(admin.id, "user.read"))) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const admins = await prisma.admin.findMany({
			include: {
				roles: {
					include: {
						role: true,
					},
				},
			},
		});

		const data = admins.map((a) => ({
			id: a.id,
			email: a.email,
			isActive: a.isActive,
			roles: a.roles.map((r) => ({
				id: r.role.id,
				name: r.role.name,
			})),
			createdAt: a.createdAt,
		}));

		return NextResponse.json(data);
	} catch (error) {
		console.error("GET /admins error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch admins" },
			{ status: 500 }
		);
	}
}

/**
	* POST /api/admins
	* Permission: user.create
	*/
export async function POST(req) {
	try {
		const admin = await authenticateAdmin(req);

		if (!admin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!(await hasPermission(admin.id, "user.create"))) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { email, password, roleIds = [] } = await req.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		// ❌ Prevent duplicate email
		const existing = await prisma.admin.findUnique({
			where: { email },
		});

		if (existing) {
			return NextResponse.json(
				{ error: "Admin with this email already exists" },
				{ status: 400 }
			);
		}

		// 🔐 Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// 1️⃣ Create admin
		const newAdmin = await prisma.admin.create({
			data: {
				email,
				password: hashedPassword,
			},
		});

		// 2️⃣ Assign roles (optional)
		if (Array.isArray(roleIds) && roleIds.length > 0) {
			await prisma.adminRole.createMany({
				data: roleIds.map((roleId) => ({
					adminId: newAdmin.id,
					roleId,
				})),
			});
		}

		return NextResponse.json(
			{
				id: newAdmin.id,
				email: newAdmin.email,
				roles: roleIds,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("POST /admins error:", error);
		return NextResponse.json(
			{ error: "Failed to create admin" },
			{ status: 500 }
		);
	}
}
