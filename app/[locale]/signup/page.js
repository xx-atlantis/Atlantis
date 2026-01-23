"use client";
import { useLocale } from "@/app/components/LocaleProvider";
import Link from "next/link";
import Image from "next/image";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
// Firebase Imports
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignupPage() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";
  const t = data?.login;

  // --------------------------
  // Form State
  // --------------------------
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // OTP & Phone State
  const [phoneInput, setPhoneInput] = useState(""); // Raw input (e.g., 501234567)
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!t) return null;

  // --------------------------
  // Initialize Recaptcha
  // --------------------------
  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "normal", // "normal" shows the 'I'm not a robot' box
        callback: () => {},
        "expired-callback": () => {
          toast.error("Recaptcha expired. Please try again.");
        },
      });
    }
  }, []);

  // --------------------------
  // Step 1: Send OTP (Strict KSA Logic)
  // --------------------------
  const handleSendOtp = async () => {
    setErrorMsg("");
    
    // 1. Clean Input: Remove spaces/dashes
    let rawNumber = phoneInput.replace(/\D/g, '');

    // 2. Format Logic: 
    // If starts with '05', remove '0' -> '5...'
    if (rawNumber.startsWith("05")) {
      rawNumber = rawNumber.substring(1);
    }
    // If starts with '966', remove '966' -> '5...' (to re-add it cleanly later)
    if (rawNumber.startsWith("966")) {
      rawNumber = rawNumber.substring(3);
    }

    // 3. Validation: Must be 9 digits starting with '5'
    const ksaRegex = /^5\d{8}$/;
    if (!ksaRegex.test(rawNumber)) {
      toast.error(isRTL ? "يرجى إدخال رقم جوال سعودي صحيح (5xxxxxxxx)" : "Please enter a valid KSA mobile (5xxxxxxxx)");
      return;
    }

    // 4. Construct Final E.164 Format
    const finalPhoneNumber = `+966${rawNumber}`;

    try {
      setOtpLoading(true);
      const appVerifier = window.recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, finalPhoneNumber, appVerifier);
      
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast.success(isRTL ? "تم إرسال رمز التحقق" : "OTP sent successfully");
    } catch (error) {
      console.error("OTP Error:", error);
      if (error.code === 'auth/invalid-phone-number') {
        toast.error("Invalid phone format.");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many attempts. Please wait.");
      } else {
        toast.error("Failed to send SMS. Try again.");
      }
      if(window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
      setOtpLoading(false);
    }
  };

  // --------------------------
  // Step 2: Verify OTP
  // --------------------------
  const handleVerifyOtp = async () => {
    setErrorMsg("");
    if (!otp) return;

    try {
      setOtpLoading(true);
      await confirmationResult.confirm(otp);
      
      setIsPhoneVerified(true);
      setOtpSent(false); 
      toast.success(isRTL ? "تم التحقق بنجاح" : "Phone verified successfully!");
    } catch (error) {
      console.error("Verify Error:", error);
      toast.error(isRTL ? "رمز التحقق غير صحيح" : "Invalid OTP Code");
    } finally {
      setOtpLoading(false);
    }
  };

  // --------------------------
  // Final Submit Handler
  // --------------------------
  async function handleSignup(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!isPhoneVerified) {
      const msg = isRTL ? "يرجى التحقق من رقم الهاتف أولاً" : "Please verify your phone number first.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!email || !password || !firstName || !lastName) {
      const msg = t.errors?.required || "All fields are required.";
      setErrorMsg(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = t.errors?.passwordMismatch || "Passwords do not match.";
      setErrorMsg(msg);
      return;
    }

    // Format phone again for saving to DB
    let rawNumber = phoneInput.replace(/\D/g, '');
    if (rawNumber.startsWith("05")) rawNumber = rawNumber.substring(1);
    const finalSavedPhone = `+966${rawNumber}`;

    try {
      setLoading(true);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          password,
          phone: finalSavedPhone, // Send the Clean +966 number
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setErrorMsg(json.error || "Signup failed.");
        toast.error(json.error || "Signup failed.");
      } else {
        toast.success(t.success?.accountCreated || "Account created successfully!");
        setTimeout(() => {
          window.location.href = `/${locale}/login`;
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      
      {/* Left Image */}
      <div className="relative hidden lg:flex w-1/2 bg-gray-200">
        <Image src="/hero.jpg" alt="Interior design" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-10">
          <p className="text-white text-2xl text-center font-semibold leading-snug max-w-md">
            {t.slogan}
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="Atlantis Logo" width={60} />
            <h2 className="text-2xl font-bold mt-4 text-gray-900">{t.signupTitle}</h2>
            <p className="text-gray-500 text-sm mt-1 text-center">{t.signupSubtitle}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}

            {/* Names */}
            <div className="flex w-full gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.firstName || "First Name"}</label>
                <input
                  type="text"
                  placeholder={t.firstNamePlaceholder}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D]"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastName || "Last Name"}</label>
                <input
                  type="text"
                  placeholder={t.lastNamePlaceholder}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D]"
              />
            </div>

            {/* ================================== */}
            {/* KSA PHONE INPUT SECTION            */}
            {/* ================================== */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRTL ? "رقم الجوال" : "Mobile Number"}
              </label>
              
              <div className="flex gap-2" dir="ltr"> {/* Always LTR for phone numbers */}
                
                {/* Static Prefix Box */}
                <div className="flex items-center justify-center bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-3 min-w-[80px]">
                  <span className="mr-2">🇸🇦</span>
                  <span className="text-gray-600 font-medium text-sm">+966</span>
                </div>

                <input
                  type="tel"
                  placeholder="5xxxxxxxx"
                  value={phoneInput}
                  maxLength={9} // Limit to 9 digits (since we handle +966)
                  disabled={isPhoneVerified || otpSent}
                  onChange={(e) => {
                    // Only allow numbers
                    const val = e.target.value.replace(/\D/g, '');
                    setPhoneInput(val);
                  }}
                  className={`flex-1 border border-gray-300 rounded-r-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D] tracking-wider ${
                    isPhoneVerified ? "bg-green-50 border-green-500 text-green-700" : ""
                  }`}
                />

                {!isPhoneVerified && !otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || phoneInput.length < 9}
                    className="ml-2 bg-gray-900 text-white px-4 rounded-md text-xs font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {otpLoading ? "..." : (isRTL ? "إرسال" : "Send")}
                  </button>
                )}

                {isPhoneVerified && (
                  <div className="flex items-center justify-center px-2">
                    <div className="bg-green-100 rounded-full p-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-right ltr:text-left">
                {isRTL ? "مثال: 501234567" : "Example: 501234567"}
              </p>

              {/* ✅ MOVED HERE: Recaptcha container is now inside the phone section */}
              <div id="recaptcha-container" className="mt-3 flex justify-center"></div>

            </div>

            {/* OTP Input */}
            {otpSent && !isPhoneVerified && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-medium text-gray-600 mb-2 text-center">
                  {isRTL ? "أدخل الرمز المرسل إلى هاتفك" : "Enter verification code"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="- - - - - -"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-lg text-center font-bold focus:ring-[#5E7E7D] focus:border-[#5E7E7D]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                    className="bg-[#5E7E7D] text-white px-5 rounded-md text-sm font-medium hover:bg-[#4a6362]"
                  >
                    {otpLoading ? "..." : (isRTL ? "تأكيد" : "Verify")}
                  </button>
                </div>
              </div>
            )}
            {/* ================================== */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <input
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPassword}</label>
              <input
                type="password"
                placeholder={t.confirmPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isPhoneVerified}
              className="w-full bg-[#2D3247] text-white py-2.5 rounded-md font-medium text-sm hover:bg-[#1e2231] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {loading ? t.loading : t.signup}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              {t.haveAccount}{" "}
              <Link href={`/${locale}/login`} className="text-[#2D3247] font-medium hover:underline">
                {t.login}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}