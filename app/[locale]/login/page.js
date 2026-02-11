"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import Link from "next/link";
import Image from "next/image";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useCustomerAuth } from "@/app/context/CustomerAuthProvider";
import { useSearchParams } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Eye Icons Components
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L4.573 4.574m14.853 14.853L14.243 14.243" /></svg>
);

export default function LoginPage() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const { saveCustomer } = useCustomerAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const isRTL = locale === "ar";
  const loginData = data?.login;

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for login
  const [showNewPassword, setShowNewPassword] = useState(false); // New state for reset
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [idToken, setIdToken] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const closeModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setPhoneInput("");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowNewPassword(false);
    setConfirmationResult(null);
    setResendTimer(0);
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      saveCustomer(json.customer);
      toast.success(loginData?.success || "Login successful!");
      setTimeout(() => (window.location.href = redirect || `/${locale}`), 500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    const raw = phoneInput.replace(/\D/g, "").replace(/^05|^966/, "");
    if (!/^5\d{8}$/.test(raw)) return toast.error(isRTL ? "رقم غير صحيح" : "Invalid number");
    const finalPhone = `+966${raw}`;

    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: finalPhone }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setForgotStep(2);
      setTimeout(() => initRecaptcha(finalPhone), 100);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const initRecaptcha = (phone) => {
    if (!window.recaptchaVerifier && recaptchaRef.current) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: "normal",
        callback: () => sendOtp(phone),
        "expired-callback": () => {
          toast.error(isRTL ? "انتهت صلاحية التحقق" : "Captcha expired");
          window.recaptchaVerifier?.reset();
        }
      });
      window.recaptchaVerifier.render();
    }
  };

  const sendOtp = async (phoneNumber) => {
    setForgotLoading(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber || `+966${phoneInput.replace(/\D/g, "").replace(/^05|^966/, "")}`, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setResendTimer(60);
      toast.success(isRTL ? "تم إرسال رمز التحقق" : "OTP sent successfully");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } catch (error) {
      console.error(error);
      window.recaptchaVerifier?.reset();
      toast.error(isRTL ? "فشل إرسال الرمز" : "Failed to send SMS");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return;
    setForgotLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      setIdToken(await result.user.getIdToken());
      setForgotStep(3);
      toast.success(isRTL ? "تم التحقق" : "Verified");
    } catch (err) {
      toast.error(isRTL ? "رمز خاطئ" : "Invalid OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) return toast.error(isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match");
    if (newPassword.length < 6) return toast.error(isRTL ? "قصيرة جداً" : "Too short");

    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, newPassword }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      toast.success(isRTL ? "تم تغيير كلمة المرور" : "Password reset successful");
      closeModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  if (!loginData) return null;

  return (
    <>
      <section dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
        <div className="relative hidden lg:flex w-1/2 bg-gray-200">
          <Image src={loginData.backgroundImage || "/hero.jpg"} alt="Hero" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-10">
            <p className="text-white text-2xl text-center font-semibold max-w-md">{loginData?.slogan}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center mb-8">
              <img src="/logo.png" alt="Logo" width={60} />
              <h2 className="text-2xl font-bold mt-4 text-gray-900">{loginData?.loginTitle}</h2>
              <p className="text-gray-500 text-sm mt-1">{loginData?.loginSubtitle}</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{loginData?.email}</label>
                <input type="email" value={email} placeholder="johnDoe@example.com" onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{loginData?.password}</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    placeholder="Enter your password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#5E7E7D] ${isRTL ? 'pl-10' : 'pr-10'}`} 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center text-gray-400 hover:text-gray-600`}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-[#2D3247] hover:underline">
                    {loginData?.forgot || "Forgot Password?"}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#2D3247] text-white py-2.5 rounded-md text-sm hover:bg-[#1e2231] disabled:opacity-50 font-medium transition-colors">
                {loading ? "..." : loginData.login}
              </button>
            </form>

            <div className="mt-8 text-center border-t pt-6">
              <p className="text-sm text-gray-600">
                {isRTL ? "ليس لديك حساب؟" : "Not a member?"}{" "}
                <Link href={`/${locale}/signup`} className="text-[#2D3247] font-bold hover:underline transition-all">
                  {isRTL ? "سجل الآن" : "Sign up here"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={closeModal}>
          <div dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-[slideUp_0.3s_ease]">
            <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">&times;</button>
            
            <div className="flex items-center justify-center mb-6 gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className={`h-1.5 flex-1 rounded-full transition-all ${forgotStep >= step ? 'bg-[#2D3247]' : 'bg-gray-200'}`} />
              ))}
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#2D3247]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#2D3247]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {forgotStep === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
                  {forgotStep === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                  {forgotStep === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {forgotStep === 1 && (isRTL ? "إعادة تعيين كلمة المرور" : "Reset Password")}
                {forgotStep === 2 && (isRTL ? "التحقق من الهاتف" : "Verify Phone")}
                {forgotStep === 3 && (isRTL ? "كلمة مرور جديدة" : "New Password")}
              </h3>
            </div>

            {forgotStep === 1 && (
              <div className="space-y-4">
                <div className="flex gap-2" dir="ltr">
                  <div className="bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg text-sm font-semibold text-gray-700">+966</div>
                  <input type="tel" placeholder="5xxxxxxxx" value={phoneInput} maxLength={9} onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))} className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2D3247] focus:border-transparent transition-all" />
                </div>
                <button onClick={handleVerifyPhone} disabled={forgotLoading || phoneInput.length < 9} className="w-full bg-[#2D3247] text-white py-3 rounded-lg font-semibold hover:bg-[#1e2231] disabled:opacity-50 transition-all shadow-lg">
                  {forgotLoading ? "..." : (isRTL ? "إرسال الرمز" : "Send Code")}
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div className="space-y-4">
                {!confirmationResult ? (
                  <div ref={recaptchaRef} className="flex justify-center my-4"></div>
                ) : (
                  <>
                    <input type="text" maxLength={6} placeholder="• • • • • •" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="w-full border-2 border-gray-300 rounded-lg px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-[#2D3247] transition-all" />
                    <button onClick={handleVerifyOtp} disabled={forgotLoading || otp.length < 6} className="w-full bg-[#2D3247] text-white py-3 rounded-lg font-semibold hover:bg-[#1e2231] disabled:opacity-50 transition-all shadow-lg">
                      {forgotLoading ? "..." : (isRTL ? "تحقق" : "Verify")}
                    </button>
                    <button onClick={() => sendOtp()} disabled={resendTimer > 0} className="w-full text-sm text-[#2D3247] hover:underline disabled:text-gray-400 transition-all">
                      {resendTimer > 0 ? `${isRTL ? "إعادة إرسال في" : "Resend in"} ${resendTimer}s` : (isRTL ? "إعادة إرسال الرمز" : "Resend Code")}
                    </button>
                  </>
                )}
              </div>
            )}

            {forgotStep === 3 && (
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    placeholder={isRTL ? "كلمة المرور الجديدة" : "New Password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2D3247] transition-all ${isRTL ? 'pl-10' : 'pr-10'}`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)} 
                    className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center text-gray-400 hover:text-gray-600`}
                  >
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <input type="password" placeholder={isRTL ? "تأكيد كلمة المرور" : "Confirm Password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2D3247] transition-all" />
                <button onClick={handleResetPassword} disabled={forgotLoading || !newPassword || !confirmNewPassword} className="w-full bg-[#2D3247] text-white py-3 rounded-lg font-semibold hover:bg-[#1e2231] disabled:opacity-50 transition-all shadow-lg">
                  {forgotLoading ? "..." : (isRTL ? "حفظ كلمة المرور" : "Save Password")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}