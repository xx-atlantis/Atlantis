"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useCart } from "@/app/context/CartContext";
import { useState, useMemo, useEffect } from "react";
import { SaudiRiyal } from "lucide-react";

// --- HELPER: Fix Saudi Phone Numbers ---
// Converts "050..." or "50..." to "+96650..."
const formatSaudiPhone = (input) => {
  if (!input) return "";
  let cleaned = input.replace(/\D/g, ""); // Remove non-digits

  // If starts with 05..., replace 0 with 966
  if (cleaned.startsWith("05")) {
    cleaned = "966" + cleaned.substring(1);
  }
  // If starts with 5..., add 966
  else if (cleaned.startsWith("5")) {
    cleaned = "966" + cleaned;
  }

  // Ensure it has + prefix
  return "+" + cleaned;
};

export default function CheckoutPage() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const [cart, setCart] = useState({});
  const checkout = data?.checkout;
  const isRTL = locale === "ar";

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Load Customer Data
  useEffect(() => {
    const stored = localStorage.getItem("customer");
    if (stored) {
      try {
        setCustomer(JSON.parse(stored));
      } catch (e) {
        console.error("Invalid customer JSON", e);
      }
    }
  }, []);

  // 2. Form States
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 3. Load Cart Data
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  const { cartItems } = useCart();
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // 4. Payment State (Default: PayTabs)
  const [selectedPayment, setSelectedPayment] = useState("paytabs");

  // 5. Calculations
// 5. Calculations
const subtotal = useMemo(() => {
  if (cart.cartType === "package") {
    const numericPrice = Number(cart?.package?.price?.replace(/\D/g, "")) || 0;
    const extraFee = Number(cart?.extraFee) || 0;
    return numericPrice + extraFee; // ✅ Add extra fee to subtotal
  }

  return safeCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
}, [cart, safeCartItems]);

  const shipping = cart.cartType === "package" ? 0 : (subtotal > 500 ? 0 : 25);
  const vat = subtotal * 0.15; // 15% VAT for KSA
  const total = subtotal + shipping + vat;

  // If content is not loaded yet
  if (!checkout) return null;

  // ============================================================
  //  CHECKOUT LOGIC (PayTabs + Tabby + Tamara)
  // ============================================================
  const handleCheckout = async () => {
    setErrorMsg("");
    setLoading(true);

    // --- Validation ---
    if (!name || !address || !phone || !email) {
      setErrorMsg(
        locale === "ar"
          ? "يرجى تعبئة جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      setLoading(false);
      return;
    }

    // --- Validate Phone Length ---
    if (phone.replace(/\D/g, "").length < 9) {
      setErrorMsg(locale === "ar" ? "رقم الهاتف غير صحيح" : "Invalid phone number");
      setLoading(false);
      return;
    }

    if (!customer?.id) {
      const redirectTo = `/${locale}/checkout`;
      window.location.href = `/${locale}/login?redirect=${encodeURIComponent(
        redirectTo
      )}`;
      setLoading(false);
      return;
    }

    // --- Format Data ---
    const formattedPhone = formatSaudiPhone(phone);

    // Split name for Payment Gateways that require First/Last separation
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    // --- Prepare Order Payload (For your DB) ---
    const orderPayload =
      cart.cartType === "package"
        ? {
          customerId: customer.id,
          orderType: "package",
          customerName: name,
          customerEmail: email,
          customerPhone: formattedPhone, // Save standardized phone
          address,
          notes,
          paymentMethod: selectedPayment,
          subtotal,
          shipping,
          vat,
          total,
          packageDetails: cart.package,
          projectSteps: cart.steps,
        }
        : {
          customerId: customer.id,
          orderType: "shop",
          customerName: name,
          customerEmail: email,
          customerPhone: formattedPhone, // Save standardized phone
          address,
          notes,
          paymentMethod: selectedPayment,
          subtotal,
          shipping,
          vat,
          total,
          items: safeCartItems.map((i) => ({
            productId: i.id,
            name: i.name,
            coverImage: i.coverImage,
            price: i.price,
            quantity: i.quantity,
            variant: i.variant,
            material: i.material,
          })),
        };

    try {
      // --- Step 1: Create Order in DB ---
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();

      if (!json.success || !json.orderId) {
        throw new Error(json.message || "Order creation failed");
      }

      // --- Step 2: Determine Payment Provider Endpoint ---
      let endpoint = "";
      if (selectedPayment === "paytabs") endpoint = "/api/paytabs/initiate";
      if (selectedPayment === "tabby") endpoint = "/api/tabby/initiate";
      // Ensure this matches the file we created: pages/api/tamara/checkout.js
      if (selectedPayment === "tamara") endpoint = "/api/tamara/checkout";

      if (!endpoint) {
        throw new Error("Invalid payment method selected");
      }

      // --- Step 3: Call Payment API ---
      // We explicitly construct the payload required by the backend files
      const paymentPayload = {
        orderId: json.orderId, // Used by PayTabs/Tabby
        firstName: firstName,  // Used by Tamara
        lastName: lastName,    // Used by Tamara
        phone: formattedPhone, // Critical for Tamara/Tabby
        email: email,
        amount: total,
        items: safeCartItems.map(i => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          sku: i.id
        }))
      };

      const paymentRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      const paymentData = await paymentRes.json();

      // Handle different response keys (url vs redirectUrl)
      const redirectUrl = paymentData.url || paymentData.redirectUrl;

      if (redirectUrl) {
        // Clear Cart & Redirect
        localStorage.removeItem("cart");
        window.location.href = redirectUrl;
      } else {
        throw new Error(paymentData.message || paymentData.error || "Failed to initiate payment");
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(
        locale === "ar"
          ? "حدث خطأ: " + (err.message || "يرجى المحاولة لاحقاً")
          : "Payment Error: " + (err.message || "Please try again later")
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  //  RENDER UI
  // ============================================================
  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="py-20 bg-gray-50">

      {/* Login Warning */}
      {!customer?.id && (
        <div className="max-w-6xl bg-[#2D3247] text-white p-2 mx-auto rounded-md mb-4 text-center">
          {locale === "ar" ? "يرجى تسجيل الدخول قبل المتابعة" : "Please Login Before filling this form."}
        </div>
      )}

      <div className="max-w-6xl mx-4 md:mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

        {/* ================= LEFT SIDE (FORMS) ================= */}
        <div className="space-y-8">

          {/* Customer Info Form */}
          <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
            {errorMsg && (
              <p className="text-red-600 mb-4 font-medium bg-red-50 p-3 rounded text-sm">
                {errorMsg}
              </p>
            )}

            <h2 className="text-lg font-semibold mb-6">
              {checkout?.invoice?.title}
            </h2>

            <div className="mb-4">
              <label className="text-sm text-gray-600">
                {checkout.invoice.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={checkout.invoice.firstPlaceholder}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2D3247]"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-600">
                {checkout.invoice.location}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={checkout.invoice.locationPlaceholder}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2D3247]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">
                  {checkout.invoice.phone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2D3247]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  {checkout.invoice.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={checkout.invoice.emailPlaceholder}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#2D3247]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              {checkout.additional.title}
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={checkout.additional.placeholder}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-32 resize-none focus:outline-none focus:border-[#2D3247]"
            />
          </div>
        </div>

        {/* ================= RIGHT SIDE (SUMMARY & PAYMENT) ================= */}
        <div className="space-y-8">

          {/* ---- Conditional Summary: Package vs Shop ---- */}
          {cart.cartType === "package" ? (
            /* PACKAGE SUMMARY */
            <div className="border border-gray-200 rounded-xl p-5 md:p-8 shadow-sm bg-white">
              <h2 className="text-lg font-semibold mb-6">
                {locale === "ar" ? "ملخص الباقة" : "Package Summary"}
              </h2>

              {/* ALWAYS VISIBLE: Package Price */}
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 font-medium">{cart.package.title}</span>
                <span className="font-semibold">{cart.package.price}</span>
              </div>

              {/* ALWAYS VISIBLE: Extra Fee if exists */}
              {cart.extraFee > 0 && (
                <div className="flex justify-between mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <div className="flex-1">
                    <span className="text-amber-700 text-sm font-bold">
                      {locale === "ar" ? "رسوم إضافية" : "Additional Fee"}
                    </span>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {cart.feeReason || (locale === "ar" ? "رسوم إضافية" : "Additional charges")}
                    </p>
                  </div>
                  <span className="font-bold text-amber-700">+{cart.extraFee} SAR</span>
                </div>
              )}

              <hr className="my-4 border-gray-100" />

              {/* COLLAPSIBLE: Project Details */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h2 className="font-semibold text-sm text-gray-800">
                    {locale === "ar" ? "تفاصيل المشروع" : "Project Details"}
                  </h2>
                  <span className="transition group-open:rotate-180 text-gray-400">
                    <svg fill="none" height="20" width="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </summary>

                <div className="mt-4 space-y-3 animate-fadeIn">
                  {Object.keys(cart.steps)
                    .sort((a, b) => {
                      const getOrder = (key) => {
                        if (key.startsWith("step_")) return parseInt(key.split("_")[1]);
                        if (key.startsWith("final_")) {
                          const maxStep = Math.max(
                            ...Object.keys(cart.steps)
                              .filter(k => k.startsWith("step_"))
                              .map(k => parseInt(k.split("_")[1]))
                          );
                          return maxStep + 1 + parseInt(key.split("_")[1]);
                        }
                        return 999;
                      };
                      return getOrder(a) - getOrder(b);
                    })
                    .map((key, index) => {
                      const step = cart.steps[key];
                      const title = step.cardTitle ?? step.label ?? step.value ?? key;
                      const question = step.question;

                      return (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          {question && (
                            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                              {question}
                            </p>
                          )}
                          <div className="flex items-start gap-2">
                            <span className="text-[#2D3247] font-bold text-xs mt-0.5">{index + 1}.</span>
                            <span className="text-gray-700 text-sm font-medium">{title}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </details>

              <hr className="my-4 border-gray-100" />

              {/* VAT Display for Package */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">
                  {locale === "ar" ? "الضريبة (15%)" : "VAT (15%)"}
                </span>
                <span className="text-gray-500">
                  {vat.toFixed(2)} SAR
                </span>
              </div>

              <hr className="my-4 border-gray-100" />

              {/* ALWAYS VISIBLE: Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900">{locale === "ar" ? "الإجمالي" : "Total"}</span>
                <div className="text-right">
                  <span className="text-[#2D3247]">{total.toFixed(2)} SAR</span>
                  <p className="text-[10px] text-gray-400 font-normal">
                    {locale === "ar" ? "شامل الضريبة" : "VAT Included"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* SHOP PRODUCT SUMMARY */
            <div className="border border-gray-200 rounded-xl p-5 md:p-8 shadow-sm bg-white">
              <h2 className="text-lg font-semibold mb-6">
                {locale === "ar" ? "ملخص الطلب" : "Order Summary"}
              </h2>

              {safeCartItems.length === 0 ? (
                <p className="text-gray-500">
                  {locale === "ar"
                    ? "لا توجد عناصر في السلة"
                    : "No items in cart."}
                </p>
              ) : (
                <div className="space-y-4">
                  {safeCartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.coverImage}
                          className="w-14 h-14 rounded-md border object-cover"
                          alt={item.name}
                        />
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm">{item.name}</p>

                          {(item.variant?.label || item.variant?.value) && (
                            <p className="text-xs text-gray-500">
                              {item.variant.label} {item.variant.value}
                            </p>
                          )}

                          {item.material && (
                            <p className="text-xs text-gray-500">
                              {item.material}
                            </p>
                          )}

                          <p className="text-xs text-gray-500">
                            × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <p className="font-semibold flex items-center text-gray-900">
                        <SaudiRiyal size={16} />
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <hr className="my-4" />

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">
                  {locale === "ar" ? "المجموع الفرعي" : "Subtotal"}
                </span>
                <span className="font-medium flex items-center">
                  <SaudiRiyal size={16} />
                  {subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">
                  {locale === "ar" ? "الشحن" : "Shipping"}
                </span>
                <span className="text-gray-500">
                  {shipping === 0
                    ? (locale === "ar" ? "مجاني" : "Free")
                    : `${shipping} SAR`
                  }
                </span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">
                  {locale === "ar" ? "الضريبة (15%)" : "VAT (15%)"}
                </span>
                <span className="text-gray-500">
                  {vat.toFixed(2)} SAR
                </span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-base font-semibold">
                <span>{locale === "ar" ? "الإجمالي" : "Total"}</span>
                <span className="font-medium flex items-center">
                  <SaudiRiyal size={16} />
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* ---- Payment Method Selection ---- */}
          <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">
              {checkout.payment.title}
            </h2>

            <div className="space-y-4">

              {/* Option 1: PayTabs (Cards) */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "paytabs"
                    ? "border-[#2D3247] bg-gray-50 ring-1 ring-[#2D3247]"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                onClick={() => setSelectedPayment("paytabs")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={selectedPayment === "paytabs"}
                      onChange={() => setSelectedPayment("paytabs")}
                      className="accent-[#2D3247] w-4 h-4"
                    />
                    <span className="font-medium text-sm">
                      {locale === "ar"
                        ? "بطاقة ائتمان / مدى"
                        : "Credit / Debit / Mada"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <img
                      src="/icons/visa.png"
                      alt="Visa"
                      className="h-5 object-contain"
                    />
                    <img
                      src="/icons/mastercard.png"
                      alt="Mastercard"
                      className="h-5 object-contain"
                    />
                    <img
                      src="/icons/mada.png"
                      alt="Mada"
                      className="h-5 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Option 2: Tabby */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "tabby"
                    ? "border-[#3EEDBF] bg-emerald-50 ring-1 ring-[#3EEDBF]"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                onClick={() => setSelectedPayment("tabby")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={selectedPayment === "tabby"}
                      onChange={() => setSelectedPayment("tabby")}
                      className="accent-[#3EEDBF] w-4 h-4"
                    />
                    <span className="font-medium text-sm">
                      {locale === "ar"
                        ? "تابي - قسمها على 4"
                        : "Tabby - Split in 4"}
                    </span>
                  </div>
                  <img
                    src="/icons/tabby.webp"
                    alt="Tabby"
                    className="h-8 object-contain"
                  />
                </div>
              </div>

              {/* Option 3: Tamara */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "tamara"
                    ? "border-[#E4806D] bg-orange-50 ring-1 ring-[#E4806D]"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                onClick={() => setSelectedPayment("tamara")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={selectedPayment === "tamara"}
                      onChange={() => setSelectedPayment("tamara")}
                      className="accent-[#E4806D] w-4 h-4"
                    />
                    <span className="font-medium text-sm">
                      {locale === "ar"
                        ? "تمارا - قسمها على 3"
                        : "Tamara - Split in 3"}
                    </span>
                  </div>
                  <img
                    src="/icons/tamara.png"
                    alt="Tamara"
                    className="h-6 object-contain"
                  />
                </div>
              </div>

            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !customer?.id}
              className="mt-8 w-full py-3 text-sm font-medium bg-[#2D3247] text-white rounded-md hover:bg-[#1e2231] transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {locale === "ar" ? "جاري المعالجة..." : "Processing..."}
                </>
              ) : (
                checkout.payment.checkout
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}