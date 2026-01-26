"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import Link from "next/link";
import Image from "next/image";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCustomerAuth } from "@/app/context/CustomerAuthProvider";
import { useSearchParams } from "next/navigation";


export default function LoginPage() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const { saveCustomer } = useCustomerAuth(); // ⬅ use context
  const searchParams = useSearchParams();
const redirect = searchParams.get("redirect");


  const isRTL = locale === "ar";
  const loginData = data?.login;
  if (!loginData) return null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      const msg =
        loginData?.errors?.required || "Email & password are required";
      toast.error(msg);
      setErrorMsg(msg);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // VERY important so token cookie is saved
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const json = await res.json();

      if (!json.success) {
        const msg = json.error || "Login failed.";
        toast.error(msg);
        setErrorMsg(msg);
        return;
      }

      // ---------------------------------------
      // ✔ Save customer in Context
      // ---------------------------------------
      saveCustomer(json.customer);

      // ---------------------------------------
      // ✔ Also save customer in cookie for page reload persistence
      // ---------------------------------------
      // Optional: sync with localStorage
      localStorage.setItem("customer", JSON.stringify(json.customer));

      toast.success(loginData?.success || "Login successful!");

      setTimeout(() => {
  if (redirect) {
    window.location.href = redirect; // 👈 back to checkout
  } else {
    window.location.href = `/${locale}`; // 👈 normal login
  }
}, 500);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
      setErrorMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col lg:flex-row bg-gray-50"
    >
      {/* LEFT IMAGE */}
      <div className="relative hidden lg:flex w-1/2 bg-gray-200">
        <Image
          src={loginData.backgroundImage || "/hero.jpg"}
          alt="Interior design"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-10">
          <p className="text-white text-2xl text-center font-semibold leading-snug max-w-md">
            {loginData?.slogan}
          </p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="Atlantis Logo" width={60} />
            <h2 className="text-2xl font-bold mt-4 text-gray-900">
              {loginData?.loginTitle}
            </h2>
            <p className="text-gray-500 text-sm mt-1 text-center">
              {loginData?.loginSubtitle}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {errorMsg && (
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {loginData?.email}
              </label>
              <input
                type="email"
                placeholder={loginData?.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5E7E7D]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {loginData?.password}
              </label>
              <input
                type="password"
                placeholder={loginData?.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#5E7E7D]"
              />
              <div className="text-right mt-1">
                <a href="#" className="text-xs text-[#2D3247] hover:underline">
                  {loginData?.forgot}
                </a>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D3247] text-white py-2.5 rounded-md font-medium text-sm hover:bg-[#1e2231] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? loginData.loading : loginData.login}
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-300" />
              <span className="px-3 text-sm text-gray-400">or</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Footer Links */}
            <p className="text-center text-sm text-gray-500 mt-6">
              {loginData?.noAccount}{" "}
              <Link
                href={`/${locale}/signup`}
                className="text-[#2D3247] font-medium hover:underline"
              >
                {loginData?.signup}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}