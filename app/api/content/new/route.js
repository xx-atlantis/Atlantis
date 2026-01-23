import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const { slug, name, sectionKeys } = await req.json();

  if (!slug || !name || !Array.isArray(sectionKeys)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const page = await prisma.page.create({
    data: {
      slug,
      name,
      sections: {
        create: sectionKeys.map((key, index) => ({
          order: index,
          section: {
            connect: { key },
          },
        })),
      },
    },
  });

  return NextResponse.json(page);
}
