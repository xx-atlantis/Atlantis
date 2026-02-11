"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";

export default function Footer() {
  const { locale } = useLocale();
  const { data } = usePageContent(); // ← get API CMS content

  const footer = data?.footer; // ← extract footer object
  const isRTL = locale === "ar";

  // Defined social links with specific URLs
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/atlantis.contractor",
    },
    {
      name: "Linkedin",
      url: "https://www.linkedin.com/in/atlantis-contracting-97778b38a/",
    },
    {
      name: "Tiktok",
      url: "https://www.tiktok.com/@atlantiscontracting",
    },
    {
      name: "X",
      url: "https://x.com/AtlantisCo10692",
    },
  ];

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-white border-t border-gray-200 pt-16 pb-8 text-gray-800"
    >
      {/* ====== Top Footer Grid ====== */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* ===== Brand Info ===== */}
        <div className={`${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex justify-start items-center gap-2 mb-4">
            <img src="/logo.png" alt="Atlantis Logo" width={45} />
            <span className="font-bold text-lg tracking-tight">Atlantis</span>
          </div>

          <p className="text-sm leading-relaxed text-gray-600 mb-6 max-w-xs mx-auto sm:mx-0">
            {footer?.description}
          </p>

          {/* Social Icons */}
          <div className="flex justify-start gap-4">
            {socialLinks.map((social, i) => (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition"
              >
                <img
                  src={`/${social.name}.png`}
                  alt={social.name}
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              </a>
            ))}
          </div>
        </div>

        {/* ===== Useful Links ===== */}
        <div className={`${isRTL ? "text-right" : "text-left"}`}>
          <h4 className="font-semibold text-[#2D3247] mb-4 inline-block relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-16 after:h-[2px] after:bg-[#2D3247]">
            {footer?.useful?.title}
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {footer?.useful?.links?.map((link, i) => (
              <li key={i}>
                <a
                  href={`/${locale}${link.url}`}
                  className="hover:text-[#2D3247] transition"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Company News ===== */}
        <div className={`${isRTL ? "text-right" : "text-left"}`}>
          <h4 className="font-semibold text-[#2D3247] mb-4 inline-block relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-16 after:h-[2px] after:bg-[#2D3247]">
            {footer?.company?.title}
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {footer?.company?.links?.map((link, i) => (
              <li key={i}>
                <a
                  href={`/${locale}${link.url}`}
                  className="hover:text-[#2D3247] transition"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Newsletter ===== */}
        <div className={`md:text-center ${isRTL ? "text-right" : "text-left"}`}>
          <h4 className="text-[#2D3247] font-semibold mb-2">
            {footer?.subscribe?.heading}
          </h4>
          <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto sm:mx-0">
            {footer?.subscribe?.desc}
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-row md:flex-col w-full items-center sm:items-stretch gap-2"
          >
            <input
              type="email"
              placeholder={footer?.subscribe?.placeholder}
              className="flex-1 w-4/5 md:w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#5E7E7D]"
            />
            <button className="bg-[#5E7E7D] text-white px-2 py-2 rounded-lg text-sm hover:bg-[#2D3247] transition w-1/4 md:w-full">
              {footer?.subscribe?.button}
            </button>
          </form>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className="max-w-7xl mx-auto mt-4 md:mt-12 pt-6 border-t border-gray-200 flex flex-col justify-center items-center gaop-2 md:gap-6 px-6 text-sm text-gray-500">
        <p className="text-center md:text-left text-xl font-semibold">
          {footer?.subscribe?.payment}
        </p>

        <div className="grid grid-cols-6 md:flex md:flex-wrap justify-center items-center gap-4 order-1 md:order-2">
          {[
            "/bank-transfer.png",
            "/madapay.png",
            "/visa.png",
            "/tabby.png",
            "/tamara.png",
            "/stc.png",
          ].map((src, i) => (
            <div
              key={i}
              className="flex justify-center items-center bg-white rounded-md"
              style={{ height: "42px", width: "auto" }}
            >
              <img
                src={src}
                alt="payment-icon"
                className="h-7 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-4 pt-6 border-t  border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6 px-6 text-sm text-gray-500">
        <p className="text-center md:text-left">
          © 2026 <span className="font-semibold text-[#2D3247]">Atlantis</span>.{" "}
          {footer?.copyright}
        </p>
        <div className="flex items-center flex-col md:flex-row">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
            <div>
              <p>CR Number: 4030528247</p>
            </div>
            <div>
              <p>VAT Number: 310112048500003</p>
            </div>
          </div>
          <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-center pl-2 gap-2 order-1 md:order-2">
            {["/footerCreditcard.png", "/footerVat.png", "/moc.png"].map(
              (src, i) => (
                <div
                  key={i}
                  className="flex justify-center items-center bg-white rounded-md"
                  style={{ height: "42px", width: "auto" }}
                >
                  <img
                    src={src}
                    alt="payment-icon"
                    className="h-7 object-contain"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}