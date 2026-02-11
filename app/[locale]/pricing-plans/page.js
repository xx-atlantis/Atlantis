"use client";

import PricingPlans from "@/app/components/app/PricingPlans";
import { useLocale } from "@/app/components/LocaleProvider";
import React from "react";

const Pricing = () => {
  const { locale } = useLocale();

  return (
    <div>
      {/* Pass the custom CTA text and the link.
        We include ${locale} to ensure the user stays in their current language.
      */}
      <PricingPlans 
        ctaText="Start Your Project" 
        ctaLink={`/${locale}/start-a-project`} 
      />
    </div>
  );
};

export default Pricing;