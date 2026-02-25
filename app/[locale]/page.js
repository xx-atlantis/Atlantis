"use client";

import { PageContentProvider } from "@/app/context/PageContentProvider";
import { useParams } from "next/navigation";

import HeroSection from "../components/app/Hero";
import HowItWorks from "../components/app/HowItWorks";
import OurStyles from "../components/app/OurStyles";
import PricingPlans from "../components/app/PricingPlans";
import ProjectsShowcase from "../components/app/ProjectShowcase";
import WhyBestChoice from "../components/app/WhyBestChoice";
import HowToGetStarted from "../components/app/HowToGetStarted";
import CustomerReviews from "../components/app/CustomerReviews";
//Home page that uses the PageContentProvider to fetch and display content based on the dynamic locale from the URL. It includes various sections like Hero, How It Works, Pricing Plans, etc., to create a comprehensive landing page experience.
export default function LandingPage() {
  const { locale } = useParams(); // get dynamic locale

  return (
    <PageContentProvider page="home" locale={locale}>
      <HeroSection />
      <HowItWorks />  
      <HowToGetStarted/>
      <WhyBestChoice />
      <ProjectsShowcase />
      <PricingPlans />
      <CustomerReviews />
      <OurStyles />
    </PageContentProvider>
  );
}
