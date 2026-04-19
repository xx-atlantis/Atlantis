import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export async function POST(req) {
	try {
		let { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		// 🔥 Normalize email (VERY IMPORTANT)
		email = email.trim().toLowerCase();

		/**
			* 1️⃣ Find admin with roles & permissions
			*/
		const admin = await prisma.admin.findUnique({
			where: { email },
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

		if (!admin) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		/**
			* 2️⃣ Verify password
			*/
		const valid = await bcrypt.compare(password, admin.password);

		if (!valid) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		/**
			* 3️⃣ Generate JWT (KEEP IT MINIMAL)
			*/
		const token = jwt.sign(
			{ adminId: admin.id },
			process.env.ADMIN_JWT_SECRET,
			{ expiresIn: "1d" }
		);

		/**
			* 4️⃣ Extract roles & permissions
			*/
		const roleNames = admin.roles.map((r) => r.role.name);

		const permissionsSet = new Set();
		admin.roles.forEach((r) => {
			r.role.permissions.forEach((rp) => {
				permissionsSet.add(rp.permission.key);
			});
		});

		const permissions = Array.from(permissionsSet);

		/**
			* 5️⃣ Response + Cookie
			*/
		const response = NextResponse.json({
			success: true,
			admin: {
				id: admin.id,
				email: admin.email,
				roles: roleNames,
				permissions,
			},
		});

		response.cookies.set("adminToken", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 24, // 1 day — matches JWT expiry
		});

		return response;
	} catch (error) {
		console.error("Admin login error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
