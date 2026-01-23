import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

/**
	* GET /api/admin/me
	* Restore admin session from cookie
	*/
export async function GET(req) {
	try {
		// 1️⃣ Read cookie
		const token = req.cookies.get("adminToken")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthenticated" },
				{ status: 401 }
			);
		}

		// 2️⃣ Verify JWT
		let payload;
		try {
			payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
		} catch {
			return NextResponse.json(
				{ error: "Invalid token" },
				{ status: 401 }
			);
		}

		// 3️⃣ Load admin with roles + permissions
		const admin = await prisma.admin.findUnique({
			where: { id: payload.adminId },
			include: {
				roles: {
					include: {
						role: {
							include: {
								permissions: {
									include: {
										permission: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!admin || !admin.isActive) {
			return NextResponse.json(
				{ error: "Admin not found or inactive" },
				{ status: 401 }
			);
		}

		// 4️⃣ Extract roles
		const roles = admin.roles.map((r) => r.role.name);

		// 5️⃣ Extract unique permissions
		const permissionsSet = new Set();
		admin.roles.forEach((r) => {
			r.role.permissions.forEach((rp) => {
				permissionsSet.add(rp.permission.key);
			});
		});

		const permissions = Array.from(permissionsSet);

		// 6️⃣ Return restored session
		return NextResponse.json({
			success: true,
			admin: {
				id: admin.id,
				email: admin.email,
				roles,
				permissions,
			},
		});
	} catch (error) {
		console.error("GET /admin/me error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
