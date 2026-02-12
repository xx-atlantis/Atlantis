"use client";
import Image from "next/image";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { useLocale } from "@/app/components/LocaleProvider";

export default function GoogleButton() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Get the ID token to verify on backend
      const idToken = await user.getIdToken();

      // Send to backend to check if user exists and has phone
      const res = await fetch("/api/auth/google-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, email: user.email, name: user.displayName }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message);
      }

      if (json.action === "LOGIN_SUCCESS") {
        // User exists & verified -> Login directly
        localStorage.setItem("customer", JSON.stringify(json.customer));
        toast.success(isRTL ? "تم تسجيل الدخول بنجاح" : "Login successful");
        window.location.href = `/${locale}`;
      } else if (json.action === "REQUIRE_PHONE") {
        // New user or missing phone -> Redirect to Complete Profile
        // We pass the temp token provided by the backend to secure the next step
        const params = new URLSearchParams({
          email: user.email,
          name: user.displayName,
          token: json.tempToken
        });
        window.location.href = `/${locale}/complete-profile?${params.toString()}`;
      }

    } catch (error) {
      console.error(error);
      toast.error(isRTL ? "فشل تسجيل الدخول عبر جوجل" : "Google Login Failed");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-md font-medium hover:bg-gray-50 hover:shadow-sm transition-all duration-200 mb-4"
    >
      <Image 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        alt="Google" 
        width={20} 
        height={20} 
      />
      <span>{isRTL ? "المتابعة باستخدام جوجل" : "Continue with Google"}</span>
    </button>
  );
}