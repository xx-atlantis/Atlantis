import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Environment Variables
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET;
const LICENSE_HUB_KEY = process.env.LICENSE_HUB_KEY; 
const API_URL = 'https://license.themgdev.com/check-license.php';

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

export async function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // =========================================================
  // STEP 1: LICENSE HUB CHECK (THE KILL SWITCH)
  // =========================================================

  // Skip check for images, css, or the maintenance page itself
  const isStatic = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/);
  const isMaintenance = pathname.includes('/maintenance');

  if (!isStatic && !isMaintenance) {
    // Check for "suspended" cookie to avoid hitting your DB every time
    const cachedStatus = request.cookies.get('license_status')?.value;

    if (cachedStatus === 'suspended') {
      return NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503 });
    }

    // If no cookie exists, ping your License Hub
    if (!cachedStatus) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain_name: 'atlantis.sa',
            license_key: LICENSE_HUB_KEY
          }),
          signal: AbortSignal.timeout(3000) // 3s timeout
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'suspended') {
            const res = NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503 });
            // Set cookie for 12 hours
            res.cookies.set('license_status', 'suspended', { maxAge: 60 * 60 * 12 });
            return res;
          }
        }
      } catch (e) {
        console.error("License Hub Unreachable - Fail-Open activated.");
      }
    }
  }

  // =========================================================
  // STEP 2: YOUR ORIGINAL ADMIN & JWT LOGIC
  // =========================================================

  // Allow login pages
  if (
    pathname === "/auth/login" ||
    pathname === "/en/auth/login" ||
    pathname === "/ar/auth/login"
  ) {
    return NextResponse.next();
  }

  // Determine if this is an admin route
  const isAdmin =
    /^\/admin(\/.*)?$/.test(pathname) ||
    /^\/(en|ar)\/admin(\/.*)?$/.test(pathname);

  // If it's not an admin route, let them through (Frontend pages)
  if (!isAdmin) return NextResponse.next();

  // --- Auth & Permission Checks for Admin Panel ---
  const token = request.cookies.get("adminToken")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    jwt.verify(token, ADMIN_SECRET);
  } catch {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const normalizedPath = pathname.replace(/^\/(en|ar)/, "");
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => normalizedPath === route || normalizedPath.startsWith(route + "/")
  );

  if (!matchedRoute) return NextResponse.next();

  const requiredPermission = ROUTE_PERMISSIONS[matchedRoute];

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

// =========================================================
// STEP 3: THE MATCHER (CRITICAL)
// =========================================================
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};