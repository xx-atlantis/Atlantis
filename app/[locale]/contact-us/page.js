"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { Loader2, CheckCircle } from "lucide-react";

export default function ContactUs() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const contact = data?.contactus;
  const form = contact?.form || {};

  const [fields, setFields] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fields.name.trim() || !fields.email.trim() || !fields.message.trim()) {
      setError(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSent(true);
    } catch (err) {
      setError(err.message || (isRTL ? "فشل الإرسال، حاول مجدداً" : "Failed to send. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-[75vh] md:min-h-[90vh] overflow-hidden mx-4 sm:mx-8 md:mx-16 my-6 sm:my-10 md:my-12 rounded-lg flex items-center justify-center"
    >
      {/* Background Image */}
      <Image
        src={contact?.heroImage || "/hero.jpg"}
        alt="Interior design background"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Overlay Card */}
      <div
        className={`absolute z-10 bg-white/95 shadow-2xl rounded-2xl
          ${isRTL ? "sm:right-10 md:right-16" : "sm:right-10 md:right-16"}
          max-w-2xs md:max-w-md p-5 sm:p-8 md:p-10 flex flex-col justify-center backdrop-blur-sm`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
          <img
            src="/logo.png"
            alt="Atlantis Logo"
            width={45}
            height={45}
            className="sm:w-[50px] md:w-[55px]"
          />
          <span className="font-semibold text-gray-700 text-sm sm:text-base md:text-lg">
            {contact?.brand || "Atlantis"}
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-center text-lg sm:text-xl md:text-2xl font-semibold leading-snug text-gray-900 mb-6">
          {contact?.mainTitle}
        </h1>

        {/* Success State */}
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle size={48} className="text-green-500" />
            <p className="font-semibold text-gray-800 text-lg">
              {isRTL ? "تم الإرسال بنجاح!" : "Message sent!"}
            </p>
            <p className="text-gray-500 text-sm">
              {isRTL ? "سنتواصل معك قريباً." : "We'll get back to you soon."}
            </p>
            <button
              onClick={() => { setSent(false); setFields({ name: "", email: "", subject: "", message: "" }); }}
              className="mt-2 text-sm text-[#2D3247] underline underline-offset-2"
            >
              {isRTL ? "إرسال رسالة أخرى" : "Send another message"}
            </button>
          </div>
        ) : (
          /* Form */
          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              placeholder={form?.name || (isRTL ? "الاسم" : "Name")}
              value={fields.name}
              onChange={set("name")}
              required
              className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-[#2D3247]/40 focus:outline-none text-sm sm:text-base"
            />
            <input
              type="email"
              placeholder={form?.email || (isRTL ? "البريد الإلكتروني" : "Email")}
              value={fields.email}
              onChange={set("email")}
              required
              className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-[#2D3247]/40 focus:outline-none text-sm sm:text-base"
            />
            <input
              type="text"
              placeholder={form?.subject || (isRTL ? "الموضوع" : "Subject")}
              value={fields.subject}
              onChange={set("subject")}
              className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-[#2D3247]/40 focus:outline-none text-sm sm:text-base"
            />
            <textarea
              rows="4"
              placeholder={form?.message || (isRTL ? "رسالتك" : "Message")}
              value={fields.message}
              onChange={set("message")}
              required
              className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:ring-2 focus:ring-[#2D3247]/40 focus:outline-none resize-none text-sm sm:text-base"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#2D3247] text-white w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-[#1e2231] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading
                ? (isRTL ? "جاري الإرسال…" : "Sending…")
                : (form?.button || (isRTL ? "إرسال" : "Send"))}
            </button>
          </form>
        )}
      </div>

      <div className="absolute inset-0 bg-black/20 z-0"></div>
    </section>
  );
}
