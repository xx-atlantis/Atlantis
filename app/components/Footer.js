"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function Footer() {
  const { locale } = useLocale();
  const { data } = usePageContent();

  const footer = data?.footer;
  const isRTL = locale === "ar";

  const socialLinks = [
    { name: "Facebook", url: "https://www.facebook.com/atlantis.contractor" },
    { name: "Linkedin", url: "https://www.linkedin.com/in/atlantis-contracting-97778b38a/" },
    { name: "Tiktok", url: "https://www.tiktok.com/@atlantiscontracting" },
    { name: "X", url: "https://x.com/AtlantisCo10692" },
  ];

  // Helper component updated to support optional external links
  const IconBox = ({ src, alt, href }) => {
    const content = (
      <div className={`flex items-center justify-center bg-white border border-gray-100 rounded-md w-16 h-10 p-1 shadow-sm ${href ? 'hover:shadow-md transition cursor-pointer' : ''}`}>
        <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
      </div>
    );

    // If an href is passed, wrap it in an anchor tag pointing to a new tab
    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      );
    }

    return content;
  };

  return (
    <footer dir={isRTL ? "rtl" : "ltr"} className="bg-white border-t border-gray-200 pt-16 pb-8 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Info */}
        <div className={isRTL ? "text-right" : "text-left"}>
          <div className="flex justify-start items-center gap-2 mb-4">
            <img src="/logo.png" alt="Atlantis Logo" width={45} />
            <span className="font-bold text-lg tracking-tight">Atlantis</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-600 mb-6 max-w-xs">{footer?.description}</p>
          <div className="flex justify-start gap-4">
            {socialLinks.map((social, i) => (
              <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
                <img src={`/${social.name}.png`} alt={social.name} className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>

        {/* Useful Links */}
        <div className={isRTL ? "text-right" : "text-left"}>
          <h4 className="font-semibold text-[#2D3247] mb-4 inline-block relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-16 after:h-[2px] after:bg-[#2D3247]">
            {footer?.useful?.title}
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {footer?.useful?.links?.map((link, i) => (
              <li key={i}>
                <a href={`/${locale}${link.url}`} className="hover:text-[#2D3247] transition">{link.name}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company News */}
        <div className={isRTL ? "text-right" : "text-left"}>
          <h4 className="font-semibold text-[#2D3247] mb-4 inline-block relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-16 after:h-[2px] after:bg-[#2D3247]">
            {footer?.company?.title}
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {footer?.company?.links?.map((link, i) => (
              <li key={i}>
                <a href={`/${locale}${link.url}`} className="hover:text-[#2D3247] transition">{link.name}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className={isRTL ? "text-right" : "text-left"}>
          <h4 className="text-[#2D3247] font-semibold mb-2">{footer?.subscribe?.heading}</h4>
          <p className="text-sm text-gray-600 mb-4">{footer?.subscribe?.desc}</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
            <input
              type="email"
              placeholder={footer?.subscribe?.placeholder}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#5E7E7D] w-full"
            />
            <button className="bg-[#5E7E7D] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2D3247] transition w-full">
              {footer?.subscribe?.button}
            </button>
          </form>
        </div>
      </div>

      {/* ====== Payment Bar ====== */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-200 flex flex-col items-center gap-4 px-6">
        <p className="text-xl font-semibold text-gray-700">
          {footer?.subscribe?.payment}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-3">
          {[
            "/bank.png",
            "/madapay.png",
            "/visa.png",
            "/tabby.png",
            "/tamara.png",
            "/stc.png",
          ].map((src, i) => (
            <IconBox key={i} src={src} alt="payment-icon" />
          ))}
        </div>
      </div>

      {/* ====== Bottom Copyright & Legal ====== */}
      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6 px-6 text-sm text-gray-500">
        <p className="text-center md:text-left">
          © 2026 <span className="font-semibold text-[#2D3247]">Atlantis</span>. {footer?.copyright}
        </p>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-xs font-medium">
            <p>CR: 4030528247</p>
            <p>VAT: 310112048500003</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {/* Array updated to objects to support individual links */}
            {[
              { src: "/footerCreditcard.png" },
              { src: "/footerVat.png", href: "/files/VAT%20Certificate.pdf" },
              { src: "/moc.png" }
            ].map((item, i) => (
              <IconBox key={i} src={item.src} alt="legal-icon" href={item.href} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}