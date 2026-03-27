import { prisma } from "@/lib/prisma";

/**
 * Fetches page content directly from the database.
 * Use this in Server Components to avoid a client-side API round-trip.
 */
export async function getPageContent(pageSlug, locale = "en") {
  const sectionQuery = {
    orderBy: { order: "asc" },
    include: {
      section: {
        include: { translations: { where: { locale } } },
      },
    },
  };

  const [globalPage, page] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "global" }, include: { sections: sectionQuery } }),
    prisma.page.findUnique({ where: { slug: pageSlug }, include: { sections: sectionQuery } }),
  ]);

  const toMap = (p) => {
    const out = {};
    p?.sections.forEach((ps) => {
      const key = ps.section.key;
      const content = ps.section.translations[0]?.content ?? null;
      if (key) out[key] = content;
    });
    return out;
  };

  return { ...toMap(globalPage), ...toMap(page) };
}
