const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌱 Adding 'our-portfolio' page data...");

  // ---------------------------------------------------------
  // 1) Load locale JSON files for en and ar (fetching from the respective locale JSON files)
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
  // 2) Fetch the 'ourPortfolio' section data from the loaded JSON
  // ---------------------------------------------------------
  const ourPortfolioEn = en.ourPortfolio || null;
  const ourPortfolioAr = ar.ourPortfolio || null;

  if (!ourPortfolioEn || !ourPortfolioAr) {
    console.log(
      `⚠️ Missing 'ourPortfolio' data in either English or Arabic - skipping`
    );
    return;
  }

  // ---------------------------------------------------------
  // 3) Create the 'ourPortfolio' section with translations
  // ---------------------------------------------------------
  const ourPortfolioSection = await prisma.section.create({
    data: {
      key: "ourPortfolio",
      type: "JSON",
      translations: {
        create: [
          {
            locale: "en",
            content: ourPortfolioEn,
          },
          {
            locale: "ar",
            content: ourPortfolioAr,
          },
        ],
      },
    },
  });

  console.log("📦 Created ourPortfolio section");

  // ---------------------------------------------------------
  // 4) Create the 'our-portfolio' page
  // ---------------------------------------------------------
  const ourPortfolioPage = await prisma.page.create({
    data: {
      slug: "our-portfolio",
      name: "Our Portfolio",
    },
  });

  console.log("📄 Page created: our-portfolio");

  // ---------------------------------------------------------
  // 5) Link the 'ourPortfolio' section to the 'our-portfolio' page
  // ---------------------------------------------------------
  await prisma.pageSection.create({
    data: {
      pageId: ourPortfolioPage.id,
      sectionId: ourPortfolioSection.id,
      order: 1, // You can adjust this order if necessary
    },
  });

  console.log("🔗 Linked 'ourPortfolio' section to the 'our-portfolio' page");

  console.log("✅ 'our-portfolio' CMS seeding finished successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
