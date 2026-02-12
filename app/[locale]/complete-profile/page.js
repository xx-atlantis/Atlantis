"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCustomerAuth } from "@/app/context/CustomerAuthProvider";
import { Smartphone, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function CompleteGoogleSignup() {
  const { locale } = useLocale();
  const { saveCustomer } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRTL = locale === "ar";

  // Data passed from the Google Login redirect
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const tempToken = searchParams.get("token"); 

  const [step, setStep] = useState(1); // 1: Input Phone, 2: Verify OTP
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const recaptchaRef = useRef(null);

  // Cleanup Recaptcha
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const initRecaptcha = () => {
    if (!recaptchaRef.current) return;
    if (window.recaptchaVerifier) window.recaptchaVerifier.clear();

    window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
      size: "invisible", 
      callback: () => {},
      "expired-callback": () => {
        toast.error("Recaptcha expired");
        window.recaptchaVerifier?.clear();
      }
    });
  };

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    // Validate Saudi Mobile (5xxxxxxxx)
    const raw = phone.replace(/\D/g, "").replace(/^05|^966/, "");
    if (!/^5\d{8}$/.test(raw)) return toast.error(isRTL ? "رقم جوال غير صحيح" : "Invalid KSA mobile number");
    
    const finalPhone = `+966${raw}`;
    setLoading(true);

    try {
      initRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, finalPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
      setResendTimer(60);
      toast.success(isRTL ? "تم إرسال الرمز" : "OTP sent");
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "فشل إرسال الرمز" : "Failed to send OTP");
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Create Account
  const handleVerifyOTP = async () => {
    if (otp.length < 6) return;
    setLoading(true);

    try {
      // 1. Verify with Firebase
      await confirmationResult.confirm(otp);
      
      // 2. Call your Backend to create/update user
      // We pass the 'tempToken' to prove they actually logged into Google previously
      const raw = phone.replace(/\D/g, "").replace(/^05|^966/, "");
      const finalPhone = `+966${raw}`;

      const res = await fetch("/api/auth/finalize-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          name, 
          phone: finalPhone, 
          tempToken 
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // 3. Login Success
      saveCustomer(json.customer);
      toast.success(isRTL ? "تم إنشاء الحساب بنجاح" : "Account created successfully");
      router.push(`/${locale}`);

    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "فشل التحقق" : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-100 relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isRTL ? `مرحباً، ${name}` : `Welcome, ${name}!`}
          </h1>
          <p className="text-gray-500 text-sm">
            {isRTL 
              ? "لإكمال تسجيلك عبر جوجل، يرجى تأكيد رقم الجوال." 
              : "To complete your Google signup, please verify your mobile number."}
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
            {email}
          </div>
        </div>

        {/* Recaptcha Container (Invisible) */}
        <div ref={recaptchaRef}></div>

        {/* Step 1: Input Phone */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {isRTL ? "رقم الجوال" : "Mobile Number"}
              </label>
              <div className="relative" dir="ltr">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r pr-2 border-gray-300">
                  <span className="text-lg">🇸🇦</span>
                  <span className="text-sm font-bold text-gray-600">+966</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="5xxxxxxxx"
                  className="w-full pl-24 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2D3247] focus:border-[#2D3247] outline-none transition font-mono text-lg"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2 mx-1">
                {isRTL 
                  ? "مطلوب لخدمات الدفع (تابي/تمارا) والتوصيل." 
                  : "Required for payments (Tabby/Tamara) and delivery."}
              </p>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading || phone.length < 9}
              className="w-full bg-[#2D3247] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1e2231] transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {isRTL ? "إرسال رمز التحقق" : "Send Verification Code"}
              {!loading && (isRTL ? <ArrowRight className="rotate-180" size={18} /> : <ArrowRight size={18} />)}
            </button>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                {isRTL ? "أدخل الرمز المرسل إلى" : "Enter code sent to"} <span dir="ltr">+966 {phone}</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-3xl tracking-[10px] font-bold py-3 border-b-2 border-gray-300 focus:border-[#2D3247] outline-none bg-transparent transition"
                placeholder="000000"
              />
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length < 6}
              className="w-full bg-[#5E7E7D] text-white py-3.5 rounded-xl font-semibold hover:bg-[#4a6363] transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {isRTL ? "جاري التحقق..." : "Verifying..."}
                </>
              ) : (
                isRTL ? "تأكيد وإنشاء الحساب" : "Confirm & Create Account"
              )}
            </button>

            <div className="text-center">
              <button 
                onClick={handleSendOTP}
                disabled={resendTimer > 0}
                className="text-sm text-gray-500 hover:text-[#2D3247] disabled:opacity-50 transition font-medium"
              >
                {resendTimer > 0 
                  ? (isRTL ? `إعادة الإرسال خلال ${resendTimer}ث` : `Resend in ${resendTimer}s`) 
                  : (isRTL ? "إعادة إرسال الرمز" : "Resend Code")}
              </button>
            </div>
            
            <button 
              onClick={() => { setStep(1); setOtp(""); }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 mt-4"
            >
              {isRTL ? "تغيير رقم الجوال" : "Change Phone Number"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}