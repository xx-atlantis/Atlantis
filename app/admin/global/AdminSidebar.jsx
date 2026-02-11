"use client";

import { ChevronDown, LogOut, Package, FileText, Settings } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

/**
 * 🔐 Permission mapping for sidebar routes
 */
const PAGE_PERMISSIONS = {
    "/admin/orders": "order.read",
    "/admin/add-shop-product": "product.read",
    "/admin/blog": "blog.read",
    "/admin/blog-management": "blog.read",
    "/admin/our-portfolio": "portfolio.read",
    "/admin/start-a-project": "project_request.read",
    "/admin/start-a-project/inside-steps": "project_request.read",
    "/admin/start-a-project/packages": "project_request.read",
    "/admin/management": "user.read",
    "/admin/roles": "role.read",
    "/admin": "content.read",
    "/admin/how-it-works": "content.read",
    "/admin/contact-us": "content.read",
    "/admin/portfolio": "content.read",
    "/admin/plans-pricing": "content.read",
    "/admin/service": "content.read",
    "/admin/virtual-tour": "content.read",
    "/admin/faqs": "content.read",
    "/admin/about-us": "content.read",
    "/admin/terms-and-condition": "content.read",
    "/admin/privacy-policy": "content.read",
};

const AdminSidebar = ({ collapsed, setCollapsed, setMenuOpen }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { locale } = useLocale();
    const { admin, roles, permissions, clearAdminSession } = useAdminAuth();
    const [projectExpanded, setProjectExpanded] = useState(
        pathname.includes("/admin/start-a-project")
    );

    useEffect(() => {
        console.log("👤 Admin:", admin);
        console.log("🎭 Roles:", roles);
        console.log("🔑 Permissions:", permissions);
    }, [admin, roles, permissions]);

    const canViewPage = (slug) => {
        const requiredPermission = PAGE_PERMISSIONS[slug];
        if (!requiredPermission) return true;
        return permissions.includes(requiredPermission);
    };

    /**
     * 📄 Main pages (excluding project-related)
     */
    const mainPages = useMemo(
        () => [
            {
                id: 2,
                slug: "/admin/orders",
                languages: { en: { title: "Orders" }, ar: { title: "الطلبات" } },
            },
            {
                id: 4,
                slug: "/admin/add-shop-product",
                languages: { en: { title: "Products" }, ar: { title: "المنتجات" } },
            },
            {
                id: 6,
                slug: "/admin/blog",
                languages: { en: { title: "Blogs Page" }, ar: { title: "صفحة المدونة" } },
            },
            {
                id: 7,
                slug: "/admin/blog-management",
                languages: { en: { title: "Site Blogs" }, ar: { title: "إدارة المدونات" } },
            },
            {
                id: 3,
                slug: "/admin/our-portfolio",
                languages: { en: { title: "Portfolio" }, ar: { title: "معرض الأعمال" } },
            },
            {
                id: 5,
                slug: "/admin/management",
                languages: { en: { title: "Admins" }, ar: { title: "المشرفين" } },
            },
            {
                id: 10,
                slug: "/admin/roles",
                languages: { en: { title: "Roles" }, ar: { title: "الأدوار" } },
            },
        ],
        []
    );

    /**
     * 📦 Project-related pages
     */
    const projectPages = useMemo(
        () => [
            {
                id: 8,
                slug: "/admin/start-a-project",
                languages: { en: { title: "Start a Project" }, ar: { title: "الطلبات" } },
            },
            {
                id: 9,
                slug: "/admin/start-a-project/inside-steps",
                languages: { en: { title: "Inside Steps" }, ar: { title: "الخطوات" } },
            },
            {
                id: 11,
                slug: "/admin/start-a-project/packages",
                languages: { en: { title: "Packages" }, ar: { title: "الباقات" } },
            },
        ],
        []
    );

    /**
     * 🧱 Content pages
     */
    const contentPages = useMemo(
        () => [
            { id: 10, slug: "/admin", languages: { en: { title: "Home" }, ar: { title: "الرئيسية" } } },
            { id: 11, slug: "/admin/how-it-works", languages: { en: { title: "How it Works" }, ar: { title: "كيف يعمل" } } },
            { id: 13, slug: "/admin/portfolio", languages: { en: { title: "Portfolio" }, ar: { title: "المحفظة" } } },
            { id: 14, slug: "/admin/plans-pricing", languages: { en: { title: "Plans & Pricing" }, ar: { title: "الأسعار" } } },
            { id: 15, slug: "/admin/service", languages: { en: { title: "Services" }, ar: { title: "الخدمات" } } },
            { id: 16, slug: "/admin/virtual-tour", languages: { en: { title: "Virtual Tour" }, ar: { title: "الجولة الافتراضية" } } },
            { id: 18, slug: "/admin/faqs", languages: { en: { title: "FAQs" }, ar: { title: "الأسئلة" } } },
            { id: 19, slug: "/admin/about-us", languages: { en: { title: "About Us" }, ar: { title: "من نحن" } } },
            { id: 17, slug: "/admin/terms-and-condition", languages: { en: { title: "Terms" }, ar: { title: "الشروط" } } },
            { id: 20, slug: "/admin/privacy-policy", languages: { en: { title: "Privacy" }, ar: { title: "الخصوصية" } } },
        ],
        []
    );

    const visibleContentPages = contentPages.filter((p) => canViewPage(p.slug));
    const visibleProjectPages = projectPages.filter((p) => canViewPage(p.slug));
    const isActive = (slug) => pathname === slug;

    const handleLogout = async () => {
        try {
            await fetch("/api/admin/logout", { method: "GET", credentials: "include" });
            clearAdminSession();
            router.replace("/auth/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <div
            className={`${
                collapsed ? "w-20" : "w-64"
            } border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white flex flex-col transition-all duration-300 h-screen sticky top-0 shadow-sm`}
            dir={locale === "ar" ? "rtl" : "ltr"}
        >
            {/* Header */}
            <div className="py-5 px-5 border-b border-gray-200 bg-white">
                {!collapsed && (
                    <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {locale === "ar" ? "لوحة التحكم" : "CMS Admin"}
                    </h1>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
                {/* Main Pages */}
                {mainPages
                    .filter((page) => canViewPage(page.slug))
                    .map((page) => (
                        <Link
                            key={page.id}
                            href={page.slug}
                            className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ${
                                isActive(page.slug)
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                            }`}
                        >
                            <span className="font-medium text-sm">
                                {locale === "ar"
                                    ? page.languages.ar.title
                                    : page.languages.en.title}
                            </span>
                        </Link>
                    ))}

                {/* Project Management Collapsible */}
                {visibleProjectPages.length > 0 && (
                    <div className="pt-2">
                        <button
                            onClick={() => setProjectExpanded(!projectExpanded)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200"
                        >
                            <span className="font-medium text-sm flex items-center gap-2">
                                <Package size={16} />
                                {!collapsed && (locale === "ar" ? "إدارة المشاريع" : "Projects")}
                            </span>
                            {!collapsed && (
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${
                                        projectExpanded ? "rotate-180" : ""
                                    }`}
                                />
                            )}
                        </button>

                        {projectExpanded && !collapsed && (
                            <div className="mt-1 space-y-0.5 ltr:ml-3 rtl:mr-3 ltr:pl-3 rtl:pr-3 ltr:border-l-2 rtl:border-r-2 border-gray-200">
                                {visibleProjectPages.map((page) => (
                                    <Link
                                        key={page.id}
                                        href={page.slug}
                                        className={`block px-3 py-2 rounded-md text-sm transition-all ${
                                            isActive(page.slug)
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {locale === "ar"
                                            ? page.languages.ar.title
                                            : page.languages.en.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Content Pages Collapsible */}
                {visibleContentPages.length > 0 && (
                    <details
                        className="group pt-2"
                        open={visibleContentPages.some((p) => isActive(p.slug))}
                    >
                        <summary className="cursor-pointer px-3 py-2.5 flex justify-between rounded-lg items-center text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all list-none">
                            <span className="flex items-center gap-2">
                                <FileText size={16} />
                                {!collapsed && (locale === "ar" ? "محتوى الموقع" : "Content")}
                            </span>
                            {!collapsed && (
                                <ChevronDown
                                    size={16}
                                    className="transition-transform duration-200 group-open:rotate-180"
                                />
                            )}
                        </summary>

                        {!collapsed && (
                            <div className="mt-1 space-y-0.5 ltr:ml-3 rtl:mr-3 ltr:pl-3 rtl:pr-3 ltr:border-l-2 rtl:border-r-2 border-gray-200">
                                {visibleContentPages.map((page) => (
                                    <Link
                                        key={page.id}
                                        href={page.slug}
                                        className={`block px-3 py-2 rounded-md text-sm transition-all ${
                                            isActive(page.slug)
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {locale === "ar"
                                            ? page.languages.ar.title
                                            : page.languages.en.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </details>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-white">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm shadow-sm"
                >
                    <LogOut size={16} />
                    {!collapsed && (locale === "ar" ? "تسجيل الخروج" : "Logout")}
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;