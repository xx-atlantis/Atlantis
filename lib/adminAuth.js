import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function authenticateAdmin(req) {
	try {
		const token = req.cookies.get("adminToken")?.value;

		if (!token) return null;

		const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

		const admin = await prisma.admin.findUnique({
			where: { id: payload.adminId },
		});

		if (!admin || !admin.isActive) return null;

		return admin;
	} catch {
		return null;
	}
}
