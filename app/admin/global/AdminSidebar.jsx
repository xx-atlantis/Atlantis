"use client";

import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

/**
	* 🔐 Permission mapping for sidebar routes
	* Single source of truth
	*/
const PAGE_PERMISSIONS = {
	// Main pages
	"/admin/orders": "order.read",
	"/admin/add-shop-product": "product.read",
	"/admin/blog": "blog.read",
	"/admin/blog-management": "blog.read",
	"/admin/our-portfolio": "portfolio.read",
	"/admin/start-a-project": "project_request.read",
	"/admin/start-a-project/inside-steps": "project_request.read",
	"/admin/management": "user.read",
		"/admin/roles": "role.read",

	// Content pages
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

	// 🔍 Debug (remove in production)
	useEffect(() => {
		console.log("👤 Admin:", admin);
		console.log("🎭 Roles:", roles);
		console.log("🔑 Permissions:", permissions);
	}, [admin, roles, permissions]);

	/**
		* 🔐 Permission checker
		*/
	const canViewPage = (slug) => {
		const requiredPermission = PAGE_PERMISSIONS[slug];
		if (!requiredPermission) return true;
		return permissions.includes(requiredPermission);
	};

	/**
		* 📄 Main pages
		*/
	const mainPages = useMemo(
		() => [
			{
				id: 2,
				slug: "/admin/orders",
				languages: { en: { title: "All Orders" }, ar: { title: "الطلبات" } },
			},
			{
				id: 4,
				slug: "/admin/add-shop-product",
				languages: { en: { title: "Our Products" }, ar: { title: "منتجاتنا" } },
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
				languages: { en: { title: "Our Portfolio" }, ar: { title: "معرض الأعمال" } },
			},
			{
				id: 8,
				slug: "/admin/start-a-project",
				languages: { en: { title: "Start a Project" }, ar: { title: "ابدأ مشروعًا" } },
			},
			{
				id: 9,
				slug: "/admin/start-a-project/inside-steps",
				languages: { en: { title: "Project Steps" }, ar: { title: "خطوات المشروع" } },
			},
			{ id: 5, 
				slug: "/admin/management", 
				languages: { en: { title: "Admin Management" }, ar: { title: "إدارة المشرفين" } } 
			},
			{ id: 10, 
				slug: "/admin/roles",
				languages: { en: { title: "Role Management" }, ar: { title: "إدارة الأدوار" } } 
					},
		],
		[]
	);

	/**
		* 🧱 Content pages
		*/
	const contentPages = useMemo(
		() => [
			{ id: 10, slug: "/admin", languages: { en: { title: "Home" }, ar: { title: "الصفحة الرئيسية" } } },
			{ id: 11, slug: "/admin/how-it-works", languages: { en: { title: "How it Works" }, ar: { title: "كيف يعمل" } } },
			// { id: 12, slug: "/admin/contact-us", languages: { en: { title: "Contact Us" }, ar: { title: "اتصل بنا" } } },
			{ id: 13, slug: "/admin/portfolio", languages: { en: { title: "Portfolio" }, ar: { title: "المحفظة" } } },
			{ id: 14, slug: "/admin/plans-pricing", languages: { en: { title: "Plans & Pricing" }, ar: { title: "الأسعار" } } },
			{ id: 15, slug: "/admin/service", languages: { en: { title: "Service" }, ar: { title: "الخدمات" } } },
			{ id: 16, slug: "/admin/virtual-tour", languages: { en: { title: "Virtual Tour" }, ar: { title: "الجولة الافتراضية" } } },
			{ id: 18, slug: "/admin/faqs", languages: { en: { title: "Faqs" }, ar: { title: "الأسئلة الشائعة" } } },
			{ id: 19, slug: "/admin/about-us", languages: { en: { title: "About Us" }, ar: { title: "من نحن" } } },
			{ id: 17, slug: "/admin/terms-and-condition", languages: { en: { title: "Terms & Condition" }, ar: { title: "الشروط والأحكام" } } },
			{ id: 20, slug: "/admin/privacy-policy", languages: { en: { title: "Privacy Policy" }, ar: { title: "سياسة الخصوصية" } } },
		],
		[]
	);

	const visibleContentPages = contentPages.filter((p) =>
		canViewPage(p.slug)
	);

	const isActive = (slug) => pathname === slug;

	/**
		* 🚪 Logout
		*/
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
			className={`${collapsed ? "w-20" : "w-72"} border-r border-border bg-white flex flex-col transition-all duration-200 h-screen sticky top-0`}
			dir={locale === "ar" ? "rtl" : "ltr"}
		>
			{/* Header */}
			<div className="py-4 px-6 border-b border-gray-100 flex items-center justify-between">
				{!collapsed && (
					<h1 className="text-xl font-bold text-gray-800 tracking-tight">
						{locale === "ar" ? "لوحة التحكم" : "CMS Admin"}
					</h1>
				)}
			</div>

			{/* Navigation */}
			<div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
				<div className="space-y-1">
					{mainPages
						.filter((page) => canViewPage(page.slug))
						.map((page) => (
							<Link
								key={page.id}
								href={page.slug}
								className={`block py-2.5 px-3 rounded-lg transition-all duration-200 ${
									isActive(page.slug)
										? "bg-primary text-white shadow-md shadow-primary/20"
										: "text-gray-600 hover:bg-gray-100"
								}`}
							>
								<span className="font-medium text-sm">
									{locale === "ar"
										? page.languages.ar.title
										: page.languages.en.title}
								</span>
							</Link>
						))}
				</div>

				{visibleContentPages.length > 0 && (
					<>
						<p
							className={`text-xs text-gray-400 my-6 font-semibold uppercase tracking-wider ${
								collapsed ? "text-center" : "pl-2"
							}`}
						>
							{collapsed ? "•••" : "Website Content"}
						</p>

						<details
							className="group"
							open={visibleContentPages.some((p) => isActive(p.slug))}
						>
							<summary className="cursor-pointer px-3 py-3 flex justify-between rounded-lg items-center text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors list-none">
								<span>
									{locale === "ar" ? "إدارة الصفحات" : "Manage Pages"}
								</span>
								<ChevronDown
									size={16}
									className="transition-transform duration-200 group-open:rotate-180"
								/>
							</summary>

							<div className="mt-1 space-y-1 ltr:ml-2 rtl:mr-2 border-l-2 ltr:border-gray-100 rtl:border-r-2 rtl:border-l-0 px-2">
								{visibleContentPages.map((page) => (
									<Link
										key={page.id}
										href={page.slug}
										className={`block px-3 py-2 rounded-md text-sm transition-all ${
											isActive(page.slug)
												? "bg-primary text-white font-medium"
												: "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
										}`}
									>
										{locale === "ar"
											? page.languages.ar.title
											: page.languages.en.title}
									</Link>
								))}
							</div>
						</details>
					</>
				)}
			</div>

			{/* Footer */}
			<div className="p-4 border-t border-gray-100">
				<button
					onClick={handleLogout}
					className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm"
				>
					<LogOut size={18} />
					{!collapsed && (locale === "ar" ? "تسجيل الخروج" : "Logout")}
				</button>
			</div>
		</div>
	);
};

export default AdminSidebar;
