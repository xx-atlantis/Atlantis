"use client";
import { useLocale } from "@/app/components/LocaleProvider";
import Link from "next/link";
import Image from "next/image";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";
import GoogleButton from "@/app/components/auth/GoogleButton"; // Import the Google Button

export default function SignupPage() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";
  const t = data?.login;

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP & Phone State
  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Ref to track Recaptcha container
  const recaptchaContainerRef = useRef(null);

  if (!t) return null;

  // Cleanup Recaptcha on Unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) return;

    if (!recaptchaContainerRef.current) {
      console.error("Recaptcha container not found");
      return;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
      size: "normal",
      callback: (response) => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        toast.error("Recaptcha expired. Please try again.");
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      },
    });
  };

  const handleSendOtp = async () => {
    setErrorMsg("");

    let rawNumber = phoneInput.replace(/\D/g, '');
    if (rawNumber.startsWith("05")) rawNumber = rawNumber.substring(1);
    if (rawNumber.startsWith("966")) rawNumber = rawNumber.substring(3);

    const ksaRegex = /^5\d{8}$/;
    if (!ksaRegex.test(rawNumber)) {
      toast.error(isRTL ? "يرجى إدخال رقم جوال سعودي صحيح (5xxxxxxxx)" : "Please enter a valid KSA mobile (5xxxxxxxx)");
      return;
    }

    const finalPhoneNumber = `+966${rawNumber}`;

    try {
      setOtpLoading(true);
      setupRecaptcha();

      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, finalPhoneNumber, appVerifier);

      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast.success(isRTL ? "تم إرسال رمز التحقق" : "OTP sent successfully");

    } catch (error) {
      console.error("OTP Error:", error);

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      if (error.code === 'auth/invalid-phone-number') {
        toast.error("Invalid phone format.");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many attempts. Please wait.");
      } else {
        toast.error("Failed to send SMS. Try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg("");
    if (!otp) return;

    try {
      setOtpLoading(true);
      await confirmationResult.confirm(otp);

      setIsPhoneVerified(true);
      setOtpSent(false);

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      toast.success(isRTL ? "تم التحقق بنجاح" : "Phone verified successfully!");
    } catch (error) {
      console.error("Verify Error:", error);
      toast.error(isRTL ? "رمز التحقق غير صحيح" : "Invalid OTP Code");
    } finally {
      setOtpLoading(false);
    }
  };

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
          phone: finalSavedPhone,
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

      {/* Recaptcha Container */}
      <div className="flex justify-center">
        <div ref={recaptchaContainerRef} id="recaptcha-container" className="my-2"></div>
      </div>

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
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white relative">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="Atlantis Logo" width={60} />
            <h2 className="text-2xl font-bold mt-4 text-gray-900">{t.signupTitle}</h2>
            <p className="text-gray-500 text-sm mt-1 text-center">{t.signupSubtitle}</p>
          </div>

          {/* Google Login Button */}
          <GoogleButton />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{isRTL ? "أو" : "Or"}</span>
            </div>
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

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRTL ? "رقم الجوال" : "Mobile Number"}
              </label>

              <div className="flex gap-2" dir="ltr">
                <div className="flex items-center justify-center bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-3 min-w-[80px]">
                  <span className="mr-2">🇸🇦</span>
                  <span className="text-gray-600 font-medium text-sm">+966</span>
                </div>

                <input
                  type="tel"
                  placeholder="5xxxxxxxx"
                  value={phoneInput}
                  maxLength={9}
                  disabled={isPhoneVerified || otpSent}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPhoneInput(val);
                  }}
                  className={`flex-1 border border-gray-300 rounded-r-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D] tracking-wider ${isPhoneVerified ? "bg-green-50 border-green-500 text-green-700" : ""
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

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPassword}</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t.confirmPassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
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