import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function hasPermission(adminId, permissionKey) {
	const count = await prisma.rolePermission.count({
		where: {
			permission: { key: permissionKey },
			role: {
				admins: {
					some: {
						adminId,
					},
				},
			},
		},
	});

	return count > 0;
}
