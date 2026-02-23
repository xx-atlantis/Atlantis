import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// =========================================================
// ENVIRONMENT VARIABLES
// =========================================================
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET;
const LICENSE_HUB_KEY = process.env.LICENSE_HUB_KEY || "YOUR_KEY_HERE"; 
const API_URL = 'https://license.themgdev.com/index.php';

// =========================================================
// ROUTE PERMISSIONS
// =========================================================
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

  // Skip check for static assets, images, or the maintenance page itself
  const isStatic = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/);
  const isMaintenance = pathname.includes('/maintenance');

  if (!isStatic && !isMaintenance) {
    // Check for cached status to avoid hitting the PHP database on every single click
    const cachedStatus = request.cookies.get('license_status')?.value;

    if (cachedStatus === 'suspended') {
      return NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503 });
    }

    // If no cookie exists (or it expired after 60 seconds), ping your License Hub
    if (!cachedStatus) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify', // Tells the PHP API we just want to verify the status
            domain_name: 'atlantis.sa',
            license_key: LICENSE_HUB_KEY
          }),
          signal: AbortSignal.timeout(3000) // 3-second timeout so the site never hangs
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'suspended' || data.status === 'expired') {
            const res = NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503 });
            // Lock them out for 60 seconds before checking the DB again
            res.cookies.set('license_status', 'suspended', { maxAge: 60 });
            return res;
          } else {
             // License is good! Cache the 'active' state for 60 seconds
             // We do this so the rest of the middleware (Admin logic) can continue
             const res = NextResponse.next();
             res.cookies.set('license_status', 'active', { maxAge: 60 });
             
             // Note: We don't return here, we let it fall through to Step 2!
          }
        }
      } catch (e) {
        // If your PHP server is down, we "Fail-Open" and let Atlantis run normally
        console.error("License Hub Unreachable - Fail-Open activated.");
      }
    }
  }

  // =========================================================
  // STEP 2: ORIGINAL ADMIN & JWT LOGIC
  // =========================================================

  // Allow login pages bypassing auth
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

  // If it's a frontend user page, let them through
  if (!isAdmin) return NextResponse.next();

  // --- Auth & Permission Checks for Admin Panel ---
  const token = request.cookies.get("adminToken")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Verify JWT
  try {
    jwt.verify(token, ADMIN_SECRET);
  } catch {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Match the route against our permissions object
  const normalizedPath = pathname.replace(/^\/(en|ar)/, "");
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => normalizedPath === route || normalizedPath.startsWith(route + "/")
  );

  // If no specific permission is required, let them in
  if (!matchedRoute) return NextResponse.next();

  const requiredPermission = ROUTE_PERMISSIONS[matchedRoute];

  // Ask your local Next.js API for the user's specific permissions
  const res = await fetch(`${origin}/api/admin/me`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  if (!res.ok) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const data = await res.json();
  
  // Enforce RBAC
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