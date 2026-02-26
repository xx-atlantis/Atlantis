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
