"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Globe, Menu, X, ShoppingCart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useCustomerAuth } from "@/app/context/CustomerAuthProvider";
import { useCart } from "@/app/context/CartContext"; // 1. Import Cart Context

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const { data, loading } = usePageContent();
  const { customer, logout } = useCustomerAuth();
  const { cartItems } = useCart(); // 2. Get Cart Items

  const isRTL = locale === "ar";
  const otherLocale = locale === "ar" ? "en" : "ar";
  const newPath = pathname.replace(/^\/(en|ar)/, `/${otherLocale}`);

  // State
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Tracks which desktop dropdown is open
  const [mobileExpanded, setMobileExpanded] = useState(null); // Tracks mobile accordion

  // Calculate Cart Quantity
  const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

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
      link: "/virtual-tour",
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
      title: isRTL ? "أعمالنا" : "Portfolio",
      link: "/our-projects",
      sublinks: [
        { title: isRTL ? "سكني" : "Residential", link: "/portfolio?cat=residential" },
        { title: isRTL ? "تجاري" : "Commercial", link: "/portfolio?cat=commercial" },
        { title: isRTL ? "ضيافة" : "Hospitality", link: "/portfolio?cat=hospitality" },
        { title: isRTL ? "جميع المشاريع" : "All Projects", link: "/our-projects" },
      ],
    },
    {
      title: isRTL ? "المتجر" : "Shop",
      link: "/shop",
    },
    {
      title: isRTL ? "الخطط والأسعار" : "Plans & Prices",
      link: "/pricing",
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
    return name
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout();
    document.cookie = "customerData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  }

  // Close dropdowns when clicking outside
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
    <header dir={isRTL ? "rtl" : "ltr"} className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-8 md:px-10 py-4">
        
        {/* LOGO */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <img src="/logo.png" width={40} height={40} alt="Atlantis" />
          <span className="hidden lg:flex font-bold text-lg">Atlantis</span>
        </Link>

        {/* =======================
            DESKTOP NAV
        ======================= */}
        <nav className="hidden lg:flex gap-6 text-sm font-medium text-gray-700" ref={navRef}>
          {menuStructure.map((item, idx) => (
            <div key={idx} className="relative group">
              {item.sublinks ? (
                // Dropdown Parent
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-[#2D3247] py-2"
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
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-md z-50 animate-fadeIn">
                  {item.sublinks.map((sub, sIdx) => (
                    <Link
                      key={sIdx}
                      href={`/${locale}${sub.link}`}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-4 py-3 text-sm hover:bg-[#2D3247] hover:text-white border-b border-gray-50 last:border-0 transition-colors"
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
          
          {/* 3. CART ICON (Mobile & Desktop) */}
          <Link href={`/${locale}/checkout`} className="relative p-2 text-gray-700 hover:text-[#2D3247] transition">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {/* LANGUAGE (Desktop only) */}
          <Link
            href={newPath}
            className="hidden lg:flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition"
          >
            <Globe size={16} />
            <span className="uppercase">{locale === "ar" ? "EN" : "AR"}</span>
          </Link>

          {/* AUTH (Desktop) */}
          <div className="hidden lg:block">
            {!customer ? (
              <Link
                href={`/${locale}/login`}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-100 transition"
              >
                {header.login}
              </Link>
            ) : (
              <div className="relative group">
                <button className="w-9 h-9 rounded-full bg-[#2D3247] text-white flex items-center justify-center text-xs font-semibold">
                  {getInitials(customer.name)}
                </button>
                <div className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-40 bg-white shadow-md rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                  <Link href={`/${locale}/profile`} className="block px-3 py-2 hover:bg-gray-100 rounded text-sm">Profile</Link>
                  <Link href={`/${locale}/orders`} className="block px-3 py-2 hover:bg-gray-100 rounded text-sm">My Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded text-sm">Logout</button>
                </div>
              </div>
            )}
          </div>

          {/* CTA (Desktop) */}
          <button
            onClick={() => router.push(`/${locale}/start-a-project`)}
            className="hidden lg:block bg-[#2D3247] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#1e2231] transition"
          >
            {header.cta}
          </button>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* =======================
          MOBILE MENU
      ======================= */}
      {menuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex flex-col gap-0 px-0 py-2 text-sm font-medium text-gray-700 max-h-[80vh] overflow-y-auto">
            
            {/* Mobile Nav Links */}
            {menuStructure.map((item, idx) => (
              <div key={idx} className="border-b border-gray-50 last:border-0">
                {item.sublinks ? (
                  // Mobile Accordion
                  <div>
                    <div 
                      className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setMobileExpanded(mobileExpanded === idx ? null : idx)}
                    >
                      <span>{item.title}</span>
                      <ChevronDown size={16} className={`transition-transform ${mobileExpanded === idx ? "rotate-180" : ""}`} />
                    </div>
                    
                    {mobileExpanded === idx && (
                      <div className="bg-gray-50 px-6 py-2">
                        {item.sublinks.map((sub, sIdx) => (
                          <Link
                            key={sIdx}
                            href={`/${locale}${sub.link}`}
                            onClick={() => setMenuOpen(false)}
                            className="block py-2 text-gray-500 hover:text-[#2D3247]"
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Mobile Link
                  <Link
                    href={`/${locale}${item.link}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-6 py-4 hover:bg-gray-50 hover:text-[#2D3247]"
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}

            <div className="p-6 space-y-4">
              {/* Mobile Auth */}
              {!customer ? (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMenuOpen(false)}
                  className="block text-center border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100"
                >
                  {header.login}
                </Link>
              ) : (
                <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#2D3247] text-white flex items-center justify-center text-xs font-semibold">
                      {getInitials(customer.name)}
                    </div>
                    <span className="font-semibold">{customer.name}</span>
                  </div>
                  <Link href={`/${locale}/profile`} onClick={() => setMenuOpen(false)} className="block py-1 text-xs text-gray-600">Profile</Link>
                  <Link href={`/${locale}/orders`} onClick={() => setMenuOpen(false)} className="block py-1 text-xs text-gray-600">My Orders</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-1 text-xs text-red-600 mt-1">Logout</button>
                </div>
              )}

              {/* Mobile Language */}
              <Link
                href={newPath}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100 w-full"
              >
                <Globe size={16} />
                <span>{locale === "ar" ? "English" : "العربية"}</span>
              </Link>

              {/* Mobile CTA */}
              <button
                onClick={() => { setMenuOpen(false); router.push(`/${locale}/start-a-project`); }}
                className="w-full bg-[#2D3247] text-white px-5 py-3 rounded-lg hover:bg-[#1e2231]"
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