"use client";

import { createContext, useContext, useState, useEffect } from "react";

export const COUNTRIES = [
  { code: "SA", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية", currency: "SAR", symbol: "SAR", flag: "🇸🇦" },
  { code: "AE", name: "UAE",          nameAr: "الإمارات العربية المتحدة", currency: "AED", symbol: "AED", flag: "🇦🇪" },
  { code: "KW", name: "Kuwait",       nameAr: "الكويت",                   currency: "KWD", symbol: "KWD", flag: "🇰🇼" },
  { code: "QA", name: "Qatar",        nameAr: "قطر",                      currency: "QAR", symbol: "QAR", flag: "🇶🇦" },
  { code: "BH", name: "Bahrain",      nameAr: "البحرين",                  currency: "BHD", symbol: "BHD", flag: "🇧🇭" },
  { code: "OM", name: "Oman",         nameAr: "عُمان",                    currency: "OMR", symbol: "OMR", flag: "🇴🇲" },
];

// Exchange rates relative to SAR (approximate)
const RATES_FROM_SAR = {
  SAR: 1,
  AED: 1.022,
  KWD: 0.0816,
  QAR: 1.022,
  BHD: 0.1008,
  OMR: 0.1028,
};

const CountryCurrencyContext = createContext(null);

export function CountryCurrencyProvider({ children }) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedCountry");
    if (saved) {
      const found = COUNTRIES.find((c) => c.code === saved);
      if (found) { setCountry(found); setReady(true); return; }
    }
    // Auto-detect via IP
    fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) })
      .then((r) => r.json())
      .then((d) => {
        const found = COUNTRIES.find((c) => c.code === d.country_code);
        if (found) setCountry(found);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const selectCountry = (code) => {
    const found = COUNTRIES.find((c) => c.code === code);
    if (!found) return;
    setCountry(found);
    localStorage.setItem("selectedCountry", code);
  };

  const formatPrice = (sarPrice) => {
    const rate = RATES_FROM_SAR[country.currency] ?? 1;
    const converted = sarPrice * rate;
    const digits = country.currency === "KWD" || country.currency === "BHD" || country.currency === "OMR" ? 3 : 2;
    return `${country.symbol} ${converted.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}`;
  };

  // Returns raw converted number (no formatting) — use for payment APIs
  const convertAmount = (sarPrice) => {
    const rate = RATES_FROM_SAR[country.currency] ?? 1;
    const digits = country.currency === "KWD" || country.currency === "BHD" || country.currency === "OMR" ? 3 : 2;
    return parseFloat((sarPrice * rate).toFixed(digits));
  };

  return (
    <CountryCurrencyContext.Provider value={{ country, countries: COUNTRIES, selectCountry, formatPrice, convertAmount, ready }}>
      {children}
    </CountryCurrencyContext.Provider>
  );
}

export function useCountryCurrency() {
  return useContext(CountryCurrencyContext);
}
