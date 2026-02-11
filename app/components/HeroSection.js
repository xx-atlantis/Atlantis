"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";

export default function HeroSection() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";

  // Content Data
  const content = {
    title: isRTL 
      ? "تصميم داخلي فاخر، يعكس هويتك." 
      : "Luxurious Interior Design, Tailored to You.",
    subtitle: isRTL
      ? "نحول مساحتك إلى واحة من الجمال والراحة. ابدأ رحلة تصميم منزلك اليوم مع أفضل خبراء التصميم في المملكة."
      : "We transform your space into an oasis of beauty and comfort. Start your home design journey today with the Kingdom's top experts.",
    ctaPrimary: isRTL ? "ابدأ مشروعك الآن" : "Start Your Project",
    ctaSecondary: isRTL ? "شاهد أعمالنا" : "View Portfolio",
    trustText: isRTL ? "موثوق به من قبل" : "Trusted by",
  };

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex flex-col justify-end">
      
      {/* 1. Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-luxury.jpg" // Make sure to add a nice villa image here
          alt="Luxury Interior"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent rtl:bg-gradient-to-l rtl:from-black/60 rtl:via-black/40 rtl:to-transparent"></div>
      </div>

      {/* 2. Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-20 md:pb-32 flex flex-col items-start rtl:items-start" dir={isRTL ? "rtl" : "ltr"}>
        
        <div className="max-w-2xl fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 font-serif">
            {content.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed font-light">
            {content.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href={`/${locale}/quiz`}
              className="bg-[#D4AF37] text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-[#b5952f] transition shadow-lg text-center"
            >
              {content.ctaPrimary}
            </Link>
            <Link 
              href={`/${locale}/portfolio`}
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-white hover:text-[#2D3247] transition text-center"
            >
              {content.ctaSecondary}
            </Link>
          </div>
        </div>

      </div>

      {/* 3. Social Proof Bar (Bottom Strip) */}
      <div className="relative z-10 w-full bg-[#2D3247] text-white/60 py-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6" dir={isRTL ? "rtl" : "ltr"}>
          
          <span className="text-sm uppercase tracking-widest font-medium">
            {content.trustText}
          </span>

          {/* Partner Logos - Replace src with actual logos */}
          <div className="flex gap-8 md:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Using text placeholders for now - Replace with <Image /> */}
            <span className="text-xl font-serif font-bold">VOGUE</span>
            <span className="text-xl font-serif font-bold">ARCHITECTURAL DIGEST</span>
            <span className="text-xl font-serif font-bold">EMAAR</span>
            <span className="text-xl font-serif font-bold">ROSHN</span>
          </div>
        </div>
      </div>

    </section>
  );
}