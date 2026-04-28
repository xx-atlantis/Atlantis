"use client";

import PricingPlans from "@/app/components/app/PricingPlans";
import { useLocale } from "@/app/components/LocaleProvider";
import React from "react";

const Pricing = () => {
  const { locale } = useLocale();

  const isRTL = locale === "ar";

  return (
    <div>
      <PricingPlans
        ctaText={isRTL ? "ابدأ مشروعك الآن" : "Start Your Project Now"}
        ctaLink={`/${locale}/start-a-project`}
      />
    </div>
  );
};

export default Pricing;