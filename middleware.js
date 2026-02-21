import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET;

/**
 * Route → Permission map
 */
const ROUTE_PERMISSIONS = {
  "/admin/orders": "order.read",
  "/admin/add-shop-product": "product.read",
  "/admin/blog": "blog.read",
  "/admin/blog-management": "blog.read",
  "/admin/our-portfolio": "portfolio.read",
  "/admin/start-a-project": "project_request.read",

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

if (status === 'suspended') {
  return NextResponse.rewrite(new URL('/maintenance', request.url), {
    status: 503,
  });
}

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // Allow login pages
  if (
    pathname === "/auth/login" ||
    pathname === "/en/auth/login" ||
    pathname === "/ar/auth/login"
  ) {
    return NextResponse.next();
  }

  // Admin routes only
  const isAdmin =
    /^\/admin(\/.*)?$/.test(pathname) ||
    /^\/(en|ar)\/admin(\/.*)?$/.test(pathname);

  if (!isAdmin) return NextResponse.next();

  // Auth check
  const token = request.cookies.get("adminToken")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    jwt.verify(token, ADMIN_SECRET);
  } catch {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Normalize locale
  const normalizedPath = pathname.replace(/^\/(en|ar)/, "");

  // Match permission
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(
    (route) =>
      normalizedPath === route ||
      normalizedPath.startsWith(route + "/")
  );

  if (!matchedRoute) return NextResponse.next();

  const requiredPermission = ROUTE_PERMISSIONS[matchedRoute];

  // Ask backend for permissions
  const res = await fetch(`${origin}/api/admin/me`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  if (!res.ok) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const data = await res.json();

  if (!data?.admin?.permissions?.includes(requiredPermission)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/en/admin/:path*", "/ar/admin/:path*"],
  runtime: "nodejs",
};
