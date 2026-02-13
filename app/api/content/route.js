import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// FALLBACK CONTENT (Used if DB is empty)
// ==========================================
const FALLBACKS = {
  login: {
    backgroundImage: "/hero.jpg",
    slogan: "Design your dream space with Atlantis.",
    loginTitle: "Welcome Back",
    loginSubtitle: "Please enter your details to sign in.",
    email: "Email Address",
    password: "Password",
    forgot: "Forgot Password?",
    login: "Sign In",
    noAccount: "Don't have an account?",
    signup: "Sign up",
    success: "Login successful!"
  },
  signup: {
    signupTitle: "Create Account",
    signupSubtitle: "Join us to start your journey.",
    firstName: "First Name",
    firstNamePlaceholder: "John",
    lastName: "Last Name",
    lastNamePlaceholder: "Doe",
    email: "Email Address",
    emailPlaceholder: "john@example.com",
    password: "Password",
    passwordPlaceholder: "Create a password",
    confirmPassword: "Confirm Password",
    haveAccount: "Already have an account?",
    login: "Sign In",
    signup: "Sign Up",
    loading: "Processing...",
    errors: {
      required: "All fields are required",
      passwordMismatch: "Passwords do not match"
    },
    success: {
      accountCreated: "Account created successfully!"
    }
  }
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const pageSlug = searchParams.get("page");
    const locale = searchParams.get("locale") || "en";

    // 1. Validate Request
    if (!pageSlug) {
      return NextResponse.json({ error: "Missing ?page=" }, { status: 400 });
    }

    if (!["en", "ar"].includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale (en/ar only)" },
        { status: 400 }
      );
    }

    // ==========================================
    // 2. FETCH GLOBAL SECTIONS
    // ==========================================
    const globalPage = await prisma.page.findUnique({
      where: { slug: "global" },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            section: {
              include: {
                translations: { where: { locale } },
              },
            },
          },
        },
      },
    });

    const globalData = {};
    globalPage?.sections.forEach((ps) => {
      const key = ps.section.key;
      const content = ps.section.translations[0]?.content || null;
      if (key) globalData[key] = content;
    });

    // Special Case: Orders page only needs globals
    if (pageSlug === "orders") {
      return NextResponse.json(
        { page: "orders", locale, ...globalData },
        { status: 200 }
      );
    }

    // ==========================================
    // 3. FETCH PAGE SECTIONS
    // ==========================================
    const page = await prisma.page.findUnique({
      where: { slug: pageSlug },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            section: {
              include: {
                translations: { where: { locale } },
              },
            },
          },
        },
      },
    });

    const pageData = {};

    if (page) {
      // If Page Found in DB, map the data
      page.sections.forEach((ps) => {
        const key = ps.section.key;
        const content = ps.section.translations[0]?.content || null;
        if (key) pageData[key] = content;
      });
    } else {
      // ==========================================
      // 4. GRACEFUL FALLBACK LOGIC
      // ==========================================
      // If page is missing in DB, check if we have a hardcoded fallback
      if (FALLBACKS[pageSlug]) {
        return NextResponse.json(
          {
            page: pageSlug,
            locale,
            ...globalData,
            [pageSlug]: FALLBACKS[pageSlug], // Inject fallback data
          },
          { status: 200 }
        );
      }

      // If no DB entry AND no fallback, return 200 OK with empty page data
      // This prevents the frontend from crashing on pages like checkout or home
      // while you are still building your database.
      return NextResponse.json(
        {
          page: pageSlug,
          locale,
          ...globalData,
          [pageSlug]: {} 
        }, 
        { status: 200 }
      );
    }

    // ==========================================
    // 5. MERGE & RETURN
    // ==========================================
    return NextResponse.json(
      {
        page: page.slug,
        locale,
        ...globalData,
        ...pageData,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("CMS Error:", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message },
      { status: 500 }
    );
  }
}