// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const { profile } = require("console");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌱 Seeding CMS content...");

  // ---------------------------------------------------------
  // 1) Load locale JSON files
  // ---------------------------------------------------------
  const en = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "app", "locales", "en", "common.json"),
      "utf8"
    )
  );

  const ar = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "app", "locales", "ar", "common.json"),
      "utf8"
    )
  );

  // ---------------------------------------------------------
  // 2) Clean DB
  // ---------------------------------------------------------
  await prisma.sectionTranslation.deleteMany();
  await prisma.pageSection.deleteMany();
  await prisma.section.deleteMany();
  await prisma.page.deleteMany();

  console.log("🗑 Old CMS data cleared");

  // ---------------------------------------------------------
  // 3) GLOBAL SECTIONS
  // ---------------------------------------------------------
  const globalSections = ["header", "footer"];

  // ---------------------------------------------------------
  // 4) REAL MATCHING pageMap (BASED ON YOUR FOLDER NAMES)
  // ---------------------------------------------------------
  const pageMap = {
    global: globalSections,

    home: ["hero", "howitworks", "whybest", "projects", "plans", "styles"],

    "about-us": ["aboutus"],
    blog: ["blog", "blogDetails"],
    checkout: ["checkout"],
    "contact-us": ["contactus"],
    faqs: ["faq"],
    "how-it-works": ["howitworks", , "whybest", "projects"],
    login: ["login"],
    "our-projects": ["ourprojects"],
    packages: ["ordersummary", "packages"],
    portfolio: ["portfolio", "projects"],
    "pricing-plans": ["plans"],
    "privacy-policy": ["privacyPolicy"],
    services: ["services", "solutions"],
    signup: ["login"],
    "start-a-project": ["startproject"],
    "terms-and-condition": ["termsandconditions"],
    "virtual-tour": ["virtualtour"],
    room: ["roomSteps"],
    villa: ["villaSteps"],
    apartment: ["apartmentSteps"],
    shop: ["shop"],
    profile: ["profile"],
  };

  // ---------------------------------------------------------
  // 5) Collect ALL section keys
  // ---------------------------------------------------------
  const allSectionKeys = new Set();
  Object.values(pageMap).forEach((keys) =>
    keys.forEach((k) => allSectionKeys.add(k))
  );

  // ---------------------------------------------------------
  // 6) Create each section with translations
  // ---------------------------------------------------------
  const createdSections = {};

  for (const key of allSectionKeys) {
    const enContent = en[key] || null;
    const arContent = ar[key] || null;

    if (!enContent && !arContent) {
      console.log(`⚠️ Missing data for: "${key}" - skipping`);
      continue;
    }

    const section = await prisma.section.create({
      data: {
        key,
        type: "JSON",
        translations: {
          create: [
            ...(enContent ? [{ locale: "en", content: enContent }] : []),
            ...(arContent ? [{ locale: "ar", content: arContent }] : []),
          ],
        },
      },
    });

    createdSections[key] = section;
    console.log(`📦 Created section: ${key}`);
  }

  // ---------------------------------------------------------
  // 7) Create PAGES + link their sections
  // ---------------------------------------------------------
  for (const [slug, keys] of Object.entries(pageMap)) {
    const page = await prisma.page.create({
      data: {
        slug,
        name: slug.replace(/-/g, " ").toUpperCase(),
      },
    });

    console.log(`📄 Page created: ${slug}`);

    let order = 1;
    for (const key of keys) {
      if (!createdSections[key]) {
        console.log(`  ⚠️ Section missing: ${key}`);
        continue;
      }

      await prisma.pageSection.create({
        data: {
          pageId: page.id,
          sectionId: createdSections[key].id,
          order,
        },
      });

      console.log(`  🔗 Linked "${key}" → "${slug}"`);
      order++;
    }
  }

  console.log("✅ CMS seeding finished successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
