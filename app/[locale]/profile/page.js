"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { useCustomerAuth } from "@/app/context/CustomerAuthProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { locale } = useLocale();
  const isRTL = locale === "ar";

  const { customer, loading: authLoading, saveCustomer } = useCustomerAuth();
  const { data } = usePageContent();

  // If CMS data isn't loaded yet
  const t = data?.profile || {};

  // ---------------------------
  // Local form state
  // ---------------------------
  const [name, setName] = useState(customer?.name || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [avatar, setAvatar] = useState(customer?.avatar || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  // Sync state when customer loads
  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
      setAvatar(customer.avatar || "");
    }
  }, [customer]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !customer) {
      router.push(`/${locale}/login`);
    }
  }, [authLoading, customer, router, locale]);

  if (authLoading || !customer) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="min-h-[60vh] flex items-center justify-center bg-gray-50"
      >
        <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
          <div className="h-24 bg-gray-200 rounded mb-4" />
          <div className="h-10 bg-gray-200 rounded mb-2" />
          <div className="h-10 bg-gray-200 rounded mb-2" />
          <div className="h-10 bg-gray-200 rounded mb-2" />
        </div>
      </section>
    );
  }

  // ---------------------------
  // Submit handler
  // ---------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error(
        locale === "ar"
          ? "كلمتا المرور غير متطابقتين"
          : "Passwords do not match"
      );
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      avatar: avatar.trim() || null,
    };

    if (newPassword.trim()) {
      payload.password = newPassword.trim();
    }

    try {
      setSaving(true);

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.error || "Failed to update profile.");
        return;
      }

      // Update context
      saveCustomer(json.data);

      toast.success(
        locale === "ar"
          ? "تم تحديث الملف الشخصي بنجاح"
          : "Profile updated successfully"
      );

      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(
        locale === "ar"
          ? "حدث خطأ ما. حاول مرة أخرى."
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t.title}
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8">
          {/* Left Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
            <div className="relative w-28 h-28 mb-4">
              <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-gray-500">
                    {(customer.name || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#2D3247] text-white text-xs shadow-md">
                ✎
              </span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {customer.name}
            </h2>
            <p className="text-xs text-gray-500 mb-4">{customer.email}</p>

            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                customer.verified
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-current" />
              {customer.verified ? t.verified : t.notVerified}
            </span>
          </div>

          {/* Right Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8"
          >
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                {t.basicInfo}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    {t.name}
                  </label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#2D3247]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#2D3247]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#2D3247]"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Avatar */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    {t.avatar}
                  </label>
                  <input
                    type="url"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#2D3247]"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                {t.security}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    {t.newPassword}
                  </label>
                  <input
                    type="password"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#2D3247]"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    {t.confirmPassword}
                  </label>
                  <input
                    type="password"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#2D3247]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => router.push(`/${locale}`)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t.cancel}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2D3247] hover:bg-[#1e2231] disabled:opacity-60 flex items-center gap-2"
              >
                {saving && (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {saving ? t.saving : t.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
