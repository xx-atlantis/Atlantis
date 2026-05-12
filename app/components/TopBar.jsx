"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { useCountryCurrency } from "@/app/context/CountryCurrencyContext";

export default function TopBar() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const { country, countries, selectCountry } = useCountryCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const isRTL = locale === "ar";
  const otherLocale = locale === "ar" ? "en" : "ar";
  const newPath = pathname.replace(/^\/(en|ar)/, `/${otherLocale}`);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="bg-[#F5F3EF] border-b border-gray-200 text-xs text-gray-600 z-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-10 py-1.5 flex items-center justify-between gap-4">

        {/* ── Country / Currency selector ── */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 hover:text-gray-900 transition-colors font-medium"
          >
            <span className="text-sm">{country.flag}</span>
            <span className="hidden sm:inline">{isRTL ? country.nameAr : country.name}</span>
            <span className="text-gray-400">·</span>
            <span className="font-semibold">{country.currency}</span>
            <ChevronDown size={11} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div
              className={`absolute top-full mt-1 ${isRTL ? "right-0" : "left-0"} w-58 bg-white shadow-xl border border-gray-100 rounded-xl z-[100] overflow-hidden py-1`}
              style={{ width: "220px" }}
            >
              {countries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { selectCountry(c.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F3EF] transition text-left ${
                    country.code === c.code ? "bg-[#F5F3EF] font-semibold" : ""
                  }`}
                >
                  <span className="text-base shrink-0">{c.flag}</span>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{isRTL ? c.nameAr : c.name}</p>
                    <p className="text-[11px] text-gray-400">{c.currency}</p>
                  </div>
                  {country.code === c.code && (
                    <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#2D3247] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Language switcher ── */}
        <Link
          href={newPath}
          className="flex items-center gap-1 hover:text-gray-900 transition-colors font-medium border border-gray-300 rounded-md px-2.5 py-0.5 hover:border-gray-400"
        >
          <Globe size={11} />
          <span>{locale === "ar" ? "English" : "العربية"}</span>
        </Link>
      </div>
    </div>
  );
}
