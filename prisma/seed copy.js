const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);

  await prisma.admin.create({
    data: {
      email: "admin@example.com",
      password: hashed,
    },
  });

  console.log("Admin created");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
