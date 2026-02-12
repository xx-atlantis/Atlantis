"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Menu, X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useCustomerAuth } from "@/app/context/CustomerAuthProvider";
import { useCart } from "@/app/context/CartContext"; 

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const { data, loading } = usePageContent();
  const { customer, logout } = useCustomerAuth();
  const { cartItems } = useCart(); 

  const isRTL = locale === "ar";
  const otherLocale = locale === "ar" ? "en" : "ar";
  const newPath = pathname.replace(/^\/(en|ar)/, `/${otherLocale}`);

  // State
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [mobileExpanded, setMobileExpanded] = useState(null); 

  // Calculate Cart Quantity
  // Calculate Cart Quantity
  const cartCount = Array.isArray(cartItems) 
    ? cartItems.reduce((acc, item) => acc + item.quantity, 0) 
    : 0;

  // ======================
  // MENU CONFIGURATION
  // ======================
  const menuStructure = [
    {
      title: isRTL ? "الرئيسية" : "Home",
      link: "/",
    },
    {
      title: isRTL ? "كيف نعمل" : "How It Works",
      link: "/how-it-works",
    },
    {
      title: isRTL ? "لوحة الإلهام" : "Mood Board",
      link: "/virtual-tour", // Fallback link
      sublinks: [
        { title: "Boho Style", link: "/portfolio?tab=boho" },
        { title: "Modern Style", link: "/portfolio?tab=modern" },
        { title: "Industrial Style", link: "/portfolio?tab=industrial" },
        { title: "Mid Century Style", link: "/portfolio?tab=midcentry" },
        { title: "Neo Classic", link: "/portfolio?tab=classic" },
        { title: "Zen Style", link: "/portfolio?tab=zen" },
      ],
    },
    {
      title: isRTL ? "معرض الأعمال" : "Portfolio",
      link: "/our-portfolio", // Fallback link
      // UPDATED SUBMENU AS REQUESTED
      sublinks: [
        { title: isRTL ? "خدماتنا" : "Our Services", link: "/services" },
        { title: isRTL ? "مشاريعنا" : "Our Portfolio", link: "/our-portfolio" },
        { title: isRTL ? "جولة افتراضية" : "Virtual Tour", link: "/virtual-tour" },
      ],
    },
    {
      title: isRTL ? "المتجر" : "Shop",
      link: "/shop",
    },
    {
      title: isRTL ? "الخطط والأسعار" : "Plans & Prices",
      link: "/pricing-plans",
    },
    {
      title: isRTL ? "المدونة" : "Blog",
      link: "/blog",
    },
  ];

  // ======================
  // HELPER FUNCTIONS
  // ======================
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]?.toUpperCase()).join("").slice(0, 2);
  };

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout();
    document.cookie = "customerData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  }

  const navRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !data?.header) return null;
  const header = data.header;

  return (
    <header dir={isRTL ? "rtl" : "ltr"} className="w-full bg-white sticky top-0 z-50 shadow-sm font-sans">
      <div className="flex justify-between items-center px-4 sm:px-8 md:px-10 py-4">
        
        {/* LOGO */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <img src="/logo.png" width={40} height={40} alt="Atlantis" />
          <span className="hidden lg:flex font-bold text-lg text-[#2D3247]">Atlantis</span>
        </Link>

        {/* =======================
            DESKTOP NAV
        ======================= */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700" ref={navRef}>
          {menuStructure.map((item, idx) => (
            <div key={idx} className="relative">
              {item.sublinks ? (
                // Dropdown Parent
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-[#2D3247] py-2 transition-colors"
                  onClick={() => setActiveDropdown(activeDropdown === idx ? null : idx)}
                >
                  {item.title}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === idx ? "rotate-180" : ""}`} />
                </div>
              ) : (
                // Standard Link
                <Link
                  href={`/${locale}${item.link}`}
                  className="block py-2 hover:text-[#2D3247] relative after:absolute after:bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#2D3247] hover:after:w-full after:transition-all after:duration-300"
                >
                  {item.title}
                </Link>
              )}

              {/* Desktop Dropdown Menu */}
              {item.sublinks && activeDropdown === idx && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-md z-50 animate-fadeIn overflow-hidden">
                  {item.sublinks.map((sub, sIdx) => (
                    <Link
                      key={sIdx}
                      href={`/${locale}${sub.link}`}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-5 py-3 text-sm hover:bg-[#2D3247] hover:text-white border-b border-gray-50 last:border-0 transition-all"
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* =======================
            RIGHT ACTIONS
        ======================= */}
        <div className="flex items-center gap-3 lg:gap-4">
          
          {/* CART ICON */}
          <Link href={`/${locale}/checkout`} className="relative p-2 text-gray-700 hover:text-[#2D3247] transition">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* LANGUAGE (Desktop) */}
          <Link
            href={newPath}
            className="hidden lg:flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition"
          >
            <Globe size={16} />
            <span className="uppercase font-medium">{locale === "ar" ? "EN" : "AR"}</span>
          </Link>

          {/* AUTH (Desktop) */}
          <div className="hidden lg:block">
            {!customer ? (
              <Link
                href={`/${locale}/login`}
                className="border border-gray-300 rounded-lg px-5 py-2 text-sm font-medium hover:bg-gray-50 transition"
              >
                {header.login}
              </Link>
            ) : (
              <div className="relative group">
                <button className="w-9 h-9 rounded-full bg-[#2D3247] text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                  {getInitials(customer.name)}
                </button>
                <div className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-48 bg-white shadow-lg border border-gray-100 rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold truncate">{customer.name}</p>
                  </div>
                  <Link href={`/${locale}/profile`} className="block px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700">Profile</Link>
                  <Link href={`/${locale}/orders`} className="block px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700">My Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm mt-1">Logout</button>
                </div>
              </div>
            )}
          </div>

          {/* CTA (Desktop) */}
          <button
            onClick={() => router.push(`/${locale}/start-a-project`)}
            className="hidden lg:block bg-[#2D3247] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1e2231] transition shadow-sm"
          >
            {header.cta}
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* =======================
          MOBILE MENU
      ======================= */}
      {menuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-200 ${isRTL ? "text-right" : "text-left"} max-h-[90vh] overflow-y-auto`}>
          <div className="flex flex-col text-sm font-medium text-gray-700">
            
            {menuStructure.map((item, idx) => (
              <div key={idx} className="border-b border-gray-50 last:border-0">
                {item.sublinks ? (
                  <div>
                    <div 
                      className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setMobileExpanded(mobileExpanded === idx ? null : idx)}
                    >
                      <span className="font-semibold text-gray-800">{item.title}</span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${mobileExpanded === idx ? "rotate-180" : ""}`} />
                    </div>
                    
                    {/* Mobile Submenu */}
                    <div className={`bg-gray-50 overflow-hidden transition-all duration-300 ${mobileExpanded === idx ? "max-h-96 py-2" : "max-h-0"}`}>
                      {item.sublinks.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          href={`/${locale}${sub.link}`}
                          onClick={() => setMenuOpen(false)}
                          className="block px-8 py-3 text-gray-600 hover:text-[#2D3247] hover:bg-gray-100"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/${locale}${item.link}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-4 font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#2D3247]"
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}

            <div className="p-6 space-y-4 bg-white">
              {/* Mobile Auth */}
              {!customer ? (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMenuOpen(false)}
                  className="block text-center border border-gray-300 rounded-lg px-4 py-3 font-semibold hover:bg-gray-50 transition"
                >
                  {header.login}
                </Link>
              ) : (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-[#2D3247] text-white flex items-center justify-center text-sm font-bold">
                      {getInitials(customer.name)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">Welcome back</p>
                    </div>
                  </div>
                  <Link href={`/${locale}/profile`} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-[#2D3247]">Profile</Link>
                  <Link href={`/${locale}/orders`} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-[#2D3247]">My Orders</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left py-2 text-sm text-red-600 font-medium mt-1">Logout</button>
                </div>
              )}

              {/* Mobile Language */}
              <Link
                href={newPath}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 w-full font-medium transition"
              >
                <Globe size={18} />
                <span>{locale === "ar" ? "English" : "العربية"}</span>
              </Link>

              {/* Mobile CTA */}
              <button
                onClick={() => { setMenuOpen(false); router.push(`/${locale}/start-a-project`); }}
                className="w-full bg-[#2D3247] text-white px-5 py-3 rounded-lg font-bold shadow-md hover:bg-[#1e2231] transition"
              >
                {header.cta}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}