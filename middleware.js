import { NextResponse } from "next/server";

// =========================================================
// ENVIRONMENT VARIABLES
// =========================================================
const LICENSE_HUB_KEY = process.env.LICENSE_HUB_KEY || "YOUR_KEY_HERE"; 
const API_URL = 'https://license.themgdev.com/index.php';

// =========================================================
// SECURITY: PAYLOAD SIGNING FUNCTION (EDGE COMPATIBLE)
// =========================================================
async function signPayload(payloadObject) {
  // Make sure to add SIGNING_SECRET to your .env file!
  const secret = process.env.SIGNING_SECRET || "mg_core_super_secret_keychain_998877"; 
  const payloadString = JSON.stringify(payloadObject);
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  
  // Create a Web Crypto Key (Edge Runtime safe)
  const cryptoKey = await crypto.subtle.importKey(
    "raw", 
    keyData, 
    { name: "HMAC", hash: "SHA-256" }, 
    false, 
    ["sign"]
  );
  
  // Sign the payload
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC", 
    cryptoKey, 
    encoder.encode(payloadString)
  );
  
  // Convert buffer to hex string
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

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
  let response = NextResponse.next();

  // =========================================================
  // STEP 1: LICENSE HUB CHECK (THE KILL SWITCH)
  // =========================================================

  // Skip check for static assets, images, or the maintenance page itself
  const isStatic = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/);
  const isMaintenance = pathname.includes('/maintenance');

  if (!isStatic && !isMaintenance) {
    const cachedStatus = request.cookies.get('license_status')?.value;

    if (cachedStatus === 'suspended') {
      return NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503 });
    }

    if (!cachedStatus) {
      try {
        // 🔐 Prepare the payload and generate the mathematical seal
        const payload = {
          action: 'verify', 
          domain_name: 'atlantis.sa',
          license_key: LICENSE_HUB_KEY
        };
        const signature = await signPayload(payload);

        const hubResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Signature': signature // 🔐 Attach the seal here!
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(3000) 
        });

        if (hubResponse.ok) {
          const data = await hubResponse.json();
          
          if (data.status === 'suspended' || data.status === 'expired') {
            const maintenanceRes = NextResponse.rewrite(new URL('/maintenance', request.url), { status: 503 });
            maintenanceRes.cookies.set('license_status', 'suspended', { maxAge: 60 });
            return maintenanceRes; 
          } else {
             response.cookies.set('license_status', 'active', { maxAge: 60 });
          }
        }
      } catch (e) {
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

  const apiRes = await fetch(`${origin}/api/admin/me`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  if (!apiRes.ok) {
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