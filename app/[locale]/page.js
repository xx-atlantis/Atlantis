// Server Component — no "use client"
import { getPageContent } from "@/lib/getPageContent";
import { PageContentProvider } from "@/app/context/PageContentProvider";

import HeroSection from "../components/app/Hero";
import HowItWorks from "../components/app/HowItWorks";
import OurStyles from "../components/app/OurStyles";
import PricingPlans from "../components/app/PricingPlans";
import ProjectsShowcase from "../components/app/ProjectShowcase";
import WhyBestChoice from "../components/app/WhyBestChoice";
import CustomerReviews from "../components/app/CustomerReviews";
import ClientLogos from "../components/app/ClientLogos";

export default async function LandingPage({ params }) {
  const { locale } = await params;

  // Fetch hero data directly from DB on the server.
  // The image URL is embedded in the initial HTML — no client-side waterfall.
  let heroData = null;
  try {
    const content = await getPageContent("home", locale);
    heroData = content?.hero ?? null;
  } catch {
    // Hero falls back to client-side data if DB query fails
  }

  return (
    <>
      {/* Hero renders immediately — image URL is already known from server */}
      <HeroSection heroData={heroData} />

      {/* Remaining below-fold sections load via client-side provider */}
      <PageContentProvider page="home" locale={locale}>
        <HowItWorks />
        <ProjectsShowcase />
        <WhyBestChoice />
        <PricingPlans />
        <ClientLogos />
        <CustomerReviews />
        <OurStyles />
      </PageContentProvider>
    </>
  );
}
