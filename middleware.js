import { NextResponse } from "next/server";

// =========================================================
// ENVIRONMENT VARIABLES
// =========================================================
// NOTE: ADMIN_SECRET is no longer needed here as token validation 
// is securely offloaded to the Node API route below.
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

  // 🌟 FIX: We create a single MASTER response object at the very beginning.
  // This ensures any cookies we attach to it will actually make it to the user's browser.
  let response = NextResponse.next();

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
        const hubResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify', 
            domain_name: 'atlantis.sa',
            license_key: LICENSE_HUB_KEY
          }),
          signal: AbortSignal.timeout(3000) // 3-second timeout
        });

        if (hubResponse.ok) {
          const data = await hubResponse.json();
          
          if (data.status === 'suspended' || data.status === 'expired') {
            const maintenanceRes = NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503 });
            maintenanceRes.cookies.set('license_status', 'suspended', { maxAge: 60 });
            return maintenanceRes; // Stop completely and show maintenance
          } else {
             // 🌟 FIX: Attach the success cookie to our master response so it saves!
             response.cookies.set('license_status', 'active', { maxAge: 60 });
          }
        }
      } catch (e) {
        // If your PHP server is down, we "Fail-Open" and let Atlantis run normally
        console.error("License Hub Unreachable - Fail-Open activated.");
      }
    }
  }

  // =========================================================
  // STEP 2: ORIGINAL ADMIN LOGIC
  // =========================================================

  // Allow login pages bypassing auth
  if (
    pathname === "/auth/login" ||
    pathname === "/en/auth/login" ||
    pathname === "/ar/auth/login"
  ) {
    return response; 
  }

  // Determine if this is an admin route
  const isAdmin =
    /^\/admin(\/.*)?$/.test(pathname) ||
    /^\/(en|ar)\/admin(\/.*)?$/.test(pathname);

  // If it's a frontend user page, let them through
  if (!isAdmin) return response;

  // --- Auth & Permission Checks for Admin Panel ---
  const token = request.cookies.get("adminToken")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Match the route against our permissions object
  const normalizedPath = pathname.replace(/^\/(en|ar)/, "");
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => normalizedPath === route || normalizedPath.startsWith(route + "/")
  );

  // If no specific permission is required, let them in
  if (!matchedRoute) return response;

  const requiredPermission = ROUTE_PERMISSIONS[matchedRoute];

  // 🌟 FIX: We rely on this API call to securely validate the JWT on the Node server,
  // bypassing the Edge Runtime crash completely.
  const apiRes = await fetch(`${origin}/api/admin/me`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  if (!apiRes.ok) {
    // If the token is fake, expired, or tampered with, the API will reject it here
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const data = await apiRes.json();
  
  // Enforce RBAC
  if (!data?.admin?.permissions?.includes(requiredPermission)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  // Return the master response (with our license cookie attached)
  return response;
}

// =========================================================
// STEP 3: THE MATCHER (CRITICAL)
// =========================================================
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};