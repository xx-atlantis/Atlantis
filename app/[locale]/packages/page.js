"use client";
import { useEffect, useState } from "react";
import PackagesSection from "@/app/components/app/SelectPackage";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useVerifyCustomer } from "@/app/hooks/useVerifyCustomer";
import { useRouter } from "next/navigation";

export default function OrderSummary() {
  const router = useRouter();
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const [projectData, setProjectData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [warning, setWarning] = useState(null);

  // Customer verification hook
  const { customer, loading: verifying, error, refresh } = useVerifyCustomer();

  // Load stored project data
  useEffect(() => {
    try {
      const stored = localStorage.getItem("startProjectData");
      if (stored) setProjectData(JSON.parse(stored));
    } catch (e) {
      console.error("Cannot load project data", e);
    }
  }, []);

  // Text translations
  const t = {
    title: locale === "ar" ? "تفاصيل المشروع" : "Project Details",
    noData:
      locale === "ar"
        ? "لا توجد بيانات مشروع متاحة."
        : "No project data available.",
    selectedOptions: locale === "ar" ? "الخيارات المختارة" : "Selected Options",
    checkout: locale === "ar" ? "إتمام الطلب" : "Proceed to Checkout",
  };

  // ============================
  // SAFETY CHECK → prevents crash
  // ============================
  if (!projectData || !projectData.form) {
    return (
      <section className="py-20 text-center text-gray-600 text-lg">
        {t.noData}
      </section>
    );
  }

  const { type, form } = projectData;

  // Extract steps safely
  const stepKeys = Object.keys(form).filter((k) => k.startsWith("step_"));

  // ============================
  // CHECKOUT HANDLER
  // ============================
  const handleCheckout = async () => {
    setWarning(null);

    // Must select a package
    if (!selectedPackage) {
      setWarning(
        locale === "ar"
          ? "الرجاء اختيار باقة قبل المتابعة"
          : "Please select a package before continuing"
      );
      return;
    }

    // Build cart data
    const cartData = {
      cartType: "package", // ⭐ important
      package: selectedPackage,
      steps: form,
    };

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cartData));

    // Re-verify token before redirect
    await refresh();

    if (error || !customer) {
      router.push(`/${locale}/login`);
      return;
    }

    // Authenticated → continue
    router.push(`/${locale}/checkout`);
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="py-20 md:py-24 bg-gray-50">
      {/* PACKAGES SECTION */}
      <PackagesSection onSelectPackage={setSelectedPackage} />

      {/* DETAILS CARD */}
      <div
        className="
          mx-4 mt-10 max-w-6xl border border-gray-200 rounded-xl p-8
          bg-white shadow-lg md:mx-auto md:px-10 md:border-none
          transition-all duration-300 ease-in-out
        "
      >
        {/* HEADER */}
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">{t.title}</h2>

        {/* PROJECT INFO */}
        <div className="space-y-6 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium">
              {locale === "ar" ? "نوع المشروع" : "Project Type"}
            </span>
            <span className="font-semibold capitalize text-gray-900">
              {type}
            </span>
          </div>

          {form.designImage && (
            <div className="mt-4">
              <p className="font-medium mb-2">
                {locale === "ar" ? "الصورة المرفوعة" : "Uploaded Design"}
              </p>
              <img
                src={form.designImage}
                className="w-full h-56 object-cover rounded-lg shadow-md border"
                alt="Uploaded Design"
              />
            </div>
          )}
        </div>

        <hr className="my-6 border-gray-200" />

        {/* SELECTED OPTIONS */}
        <h3 className="text-2xl font-semibold mb-6">{t.selectedOptions}</h3>

        {/* OPTIONS GRID */}
        <div className="grid grid-cols-3 gap-6 text-sm">
          {stepKeys.map((key, index) => {
            const s = form[key];
            return (
              <p key={key} className="text-gray-800">
                {index + 1}. {s?.cardTitle}
              </p>
            );
          })}

          {/* Final dynamic selections */}
          {Object.keys(form)
            .filter((k) => !k.startsWith("step_") && k !== "designImage")
            .map((key, index) => {
              const s = form[key];
              if (!s?.cardTitle) return null;

              return (
                <p key={key} className="text-gray-800">
                  {stepKeys.length + index + 1}. {s.cardTitle}
                </p>
              );
            })}
        </div>

        {/* TOTAL SECTION */}
        <hr className="my-6 border-gray-200" />

        <div className="text-sm space-y-3">
          {warning && <p className="text-red-600 font-medium">{warning}</p>}

          {selectedPackage && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === "ar" ? "الباقة المختارة" : "Selected Package"}
                </span>
                <span className="font-medium text-gray-900">
                  {selectedPackage.title}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  {locale === "ar" ? "السعر" : "Price"}
                </span>
                <span className="font-semibold text-gray-900">
                  {selectedPackage.price} SAR
                </span>
              </div>

              {selectedPackage.oldPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {locale === "ar" ? "السعر القديم" : "Old Price"}
                  </span>
                  <span className="text-gray-400 line-through">
                    {selectedPackage.oldPrice} SAR
                  </span>
                </div>
              )}
            </>
          )}

          <hr className="border-gray-200 my-4" />

          <div className="flex justify-between text-lg font-semibold">
            <span>{locale === "ar" ? "إجمالي الطلب" : "Order Total"}</span>
            <span className="text-gray-900">
              {selectedPackage ? selectedPackage.price : 0} SAR
            </span>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* CHECKOUT BUTTON */}
        <div className="flex justify-start">
          <button
            onClick={handleCheckout}
            className="
              bg-primary-btn text-white px-8 py-4 rounded-md text-lg
              hover:bg-primary-theme transition-all duration-300 ease-in-out
              w-full md:w-1/4
            "
          >
            {verifying
              ? locale === "ar"
                ? "جاري التحقق..."
                : "Checking..."
              : t.checkout}
          </button>
        </div>
      </div>
    </section>
  );
}
