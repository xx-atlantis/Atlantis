"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useCustomerAuth } from "@/app/context/CustomerAuthProvider";

const droplinks = [
  {
    title: "Mood Board",
    link: "/en/virtual-tour",
    sublinks: [
      {
        title: "Boho Style",
        link: "/en/portfolio?tab=boho"
      },
      {
        title: "Modern Style",
        link: "/en/portfolio?tab=modern"
      },
      {
        title: "Industrial Style",
        link: "/en/portfolio?tab=industrial"
      },
      {
        title: "Mid Centry Style",
        link: "/en/portfolio?tab=midcentry"
      },
      {
        title: "Neo Classic",
        link: "/en/portfolio?tab=classic"
      },
      {
        title: "Zen Style",
        link: "/en/portfolio?tab=zen"
      },
    ]
  },
  {
    title: "Services",
    link: "/en/services"
  },
  {
    title: "Our Project",
    link: "/en/our-projects"
  },
  {
    title: "Virtual Tour",
    link: "/en/virtual-tour"
  },
]

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const { data, loading } = usePageContent();
  const { customer, logout } = useCustomerAuth(); // ⬅ CONTEXT

  const isRTL = locale === "ar";
  const otherLocale = locale === "ar" ? "en" : "ar";
  const newPath = pathname.replace(/^\/(en|ar)/, `/${otherLocale}`);
  const [openMain, setOpenMain] = useState(false);
  const [openSub, setOpenSub] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);

  // ======================
  // INITIALS HELPER
  // ======================
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  // ======================
  // LOGOUT HANDLER
  // ======================
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    logout(); // clear context
    document.cookie =
      "customerData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    window.location.reload();
  }

  if (loading || !data?.header) return null;

  const header = data.header;
  const links = header.links || [];
  const firstGroup = links.slice(0, 2);
  const secondGroup = links.slice(3, 7);
  const [activeParent, setActiveParent] = useState(null);
  const [activeSub, setActiveSub] = useState(null);


  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpenMain(false);
        setOpenSub(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  console.log("Header data:", customer);

  return (
    <header
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full bg-white sticky top-0 z-50 shadow-sm"
    >
      <div className="flex justify-between items-center px-4 sm:px-8 md:px-10 py-4">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" width={40} height={40} alt="Atlantis" />
          <span className="hidden lg:flex font-bold text-lg">Atlantis</span>
        </div>

        {/* DESKTOP NAV (Hidden on md & below) */}
        <nav className="hidden lg:flex gap-6 text-sm font-medium text-gray-700">
          {firstGroup.map((link, idx) => (
            <Link
              key={idx}
              href={`/${locale}${link.url}`}
              className="hover:text-[#2D3247] relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#2D3247] hover:after:w-full after:transition-all after:duration-300"
            >
              {link.title}
            </Link>
          ))}
          <div ref={dropdownRef} className="relative inline-block">
            {/* MAIN TOGGLE BUTTON */}
            <div
              className=" cursor-pointer flex gap-1 items-center "
              onClick={() => setOpenMain(!openMain)}
            >
              Portfolio <span><ChevronDown size={16} /></span>
            </div>

            {/* MAIN DROPDOWN */}
            {openMain && (
              <div className="absolute left-0 top-8 bg-white shadow-lg border  w-48 z-20">
                {droplinks.map((item, index) => (
                  <div key={index}>
                    {/* ROW ITEM */}
                    <div
                      className={`  hover:bg-[#2D3247] hover:text-white cursor-pointer ${item.sublinks ? "font-semibold" : ""
                        }`}
                      onClick={() => {
                        if (item.sublinks) {
                          setOpenSub(openSub === index ? null : index);
                          setActiveParent(index);   // set active parent
                          setActiveSub(null);       // reset sub
                        } else {
                          setActiveParent(index);   // active direct link
                          setActiveSub(null);
                        }
                      }}
                    >
                      {item.sublinks ? (
                        <p className={`flex justify-between items-center px-4 py-2 ${openSub === index ? "bg-[#2D3247] text-white" : ""}  ${activeParent === index ? "bg-[#2D3247] text-white" : ""}`}>{item.title} <ChevronRight size={16} /></p>
                      ) : (
                        <Link className={`flex justify-between items-center px-4 py-2
    ${activeParent === index ? "bg-[#2D3247] text-white" : ""}`} href={item.link}>{item.title}</Link>
                      )}
                    </div>

                    {/* SUB DROPDOWN */}
                    {item.sublinks && openSub === index && (
                      <div className="absolute left-full top-0 bg-white border shadow-lg w-48 z-30">
                        {item.sublinks.map((sub, i) => (
                          <Link
                            key={i}
                            href={sub.link}
                            onClick={() => {
                              setActiveSub(i);
                              setActiveParent(index);
                            }}
                            className={`block px-4 py-2 hover:bg-[#2D3247] hover:text-white 
    ${activeSub === i && activeParent === index ? "bg-[#2D3247] text-white" : ""}`}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {secondGroup.map((link, idx) => (
            <Link
              key={idx}
              href={`/${locale}${link.url}`}
              className="hover:text-[#2D3247] relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#2D3247] hover:after:w-full after:transition-all after:duration-300"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* DESKTOP RIGHT ACTIONS */}
        <div className="hidden lg:flex items-center gap-4">
          {/* LANGUAGE SWITCH */}
          <Link
            href={newPath}
            className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition"
          >
            <Globe size={16} />
            <span>{locale === "ar" ? "English" : "العربية"}</span>
          </Link>

          {/* AUTH AREA */}
          {!customer ? (
            <Link
              href={`/${locale}/login`}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-100 transition"
            >
              {header.login}
            </Link>
          ) : (
            <div className="relative group">
              {/* AVATAR */}
              <button className="w-10 h-10 rounded-full bg-[#2D3247] text-white flex items-center justify-center text-sm font-semibold">
                {getInitials(customer.name)}
              </button>

              {/* DROPDOWN */}
              <div
                className={`absolute ${isRTL ? "left-0" : "right-0"
                  } mt-2 w-40 bg-white shadow-md rounded-lg p-2 
                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}
              >
                <Link
                  href={`/${locale}/profile`}
                  className="block px-3 py-2 hover:bg-gray-100 rounded text-sm"
                >
                  Profile
                </Link>

                <Link
                  href={`/${locale}/orders`}
                  className="block px-3 py-2 hover:bg-gray-100 rounded text-sm"
                >
                  My Orders
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => router.push(`/${locale}/start-a-project`)}
            className="bg-[#2D3247] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#1e2231] transition"
          >
            {header.cta}
          </button>
        </div>

        {/* MOBILE + TABLET MENU BUTTON */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE + TABLET MENU */}
      {menuOpen && (
        <div
          className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 ${isRTL ? "text-right" : "text-left"
            }`}
        >
          <div className="flex flex-col gap-4 px-6 py-6 text-sm font-medium text-gray-700">
            {links.map((link, idx) => (
              <Link
                key={idx}
                href={`/${locale}${link.url}`}
                onClick={() => setMenuOpen(false)}
                className="hover:text-[#2D3247]"
              >
                {link.title}
              </Link>
            ))}

            <hr className="my-2" />

            {/* AUTH AREA */}
            {!customer ? (
              <Link
                href={`/${locale}/login`}
                onClick={() => setMenuOpen(false)}
                className="border border-gray-300 text-center rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
              >
                {header.login}
              </Link>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2D3247] text-white flex items-center justify-center text-sm font-semibold">
                    {getInitials(customer.name)}
                  </div>
                  <span className="font-medium">{customer.name}</span>
                </div>

                <Link
                  href={`/${locale}/profile`}
                  className="block px-3 py-2 hover:bg-gray-100 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>

                <Link
                  href={`/${locale}/orders`}
                  className="block px-3 py-2 hover:bg-gray-100 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  My Orders
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded"
                >
                  Logout
                </button>
              </>
            )}

            {/* Language */}
            <Link
              href={newPath}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              <Globe size={16} />
              <span>{locale === "ar" ? "English" : "العربية"}</span>
            </Link>

            {/* CTA */}
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push(`/${locale}/start-a-project`);
              }}
              className="bg-[#2D3247] text-white px-5 py-2 rounded-lg hover:bg-[#1e2231]"
            >
              {header.cta}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
