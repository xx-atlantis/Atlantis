"use client";

import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function usePhoneOTP({ locale = "en" } = {}) {
  const isRTL = locale === "ar";

  const recaptchaRef = useRef(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // cleanup on unmount
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

    if (!recaptchaRef.current) {
      console.error("Recaptcha container missing");
      return;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      recaptchaRef.current,
      {
        size: "normal",
        "expired-callback": () => {
          toast.error(
            isRTL ? "انتهت صلاحية التحقق، حاول مرة أخرى" : "Recaptcha expired"
          );
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        },
      }
    );
  };

  const sendOTP = async (phoneInput) => {
    let raw = phoneInput.replace(/\D/g, "");
    if (raw.startsWith("05")) raw = raw.substring(1);
    if (raw.startsWith("966")) raw = raw.substring(3);

    if (!/^5\d{8}$/.test(raw)) {
      toast.error(
        isRTL
          ? "رقم جوال سعودي غير صحيح"
          : "Invalid Saudi mobile number"
      );
      return;
    }

    const phone = `+966${raw}`;

    try {
      setLoading(true);
      setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      setConfirmationResult(result);
      setOtpSent(true);
      toast.success(isRTL ? "تم إرسال الرمز" : "OTP sent");

      return phone;
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (code) => {
    if (!confirmationResult) return null;

    try {
      setLoading(true);
      const userCred = await confirmationResult.confirm(code);
      const idToken = await userCred.user.getIdToken();

      setIsVerified(true);
      setOtpSent(false);

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      toast.success(isRTL ? "تم التحقق بنجاح" : "Verified");

      return idToken;
    } catch (err) {
      toast.error(isRTL ? "رمز غير صحيح" : "Invalid OTP");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    recaptchaRef,
    sendOTP,
    verifyOTP,
    otpSent,
    isVerified,
    loading,
  };
}
