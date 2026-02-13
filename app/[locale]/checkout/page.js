"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useCart } from "@/app/context/CartContext";
import { useState, useMemo, useEffect } from "react";
import { CheckCircle2, CreditCard, Wallet, Sparkles, Landmark } from "lucide-react";
import Script from "next/script"; // Required for Tabby Snippet

// =====================================================================
// NEW SAUDI RIYAL SYMBOL COMPONENT
// =====================================================================
// Paste the 'd' path from the GitHub repository you provided here.
const SaudiRiyalIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 512 512" 
    fill="currentColor" 
    className={`inline-block ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* PASTE THE PATH D="..." HERE */}
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="300" fontWeight="bold">ر.س</text>
  </svg>
);

// Helper: Format phone number to Saudi international format
const formatSaudiPhone = (input) => {
  if (!input) return "";
  let cleaned = input.replace(/\D/g, "");
  if (cleaned.startsWith("05")) {
    cleaned = "966" + cleaned.substring(1);
  } else if (cleaned.startsWith("5")) {
    cleaned = "966" + cleaned;
  }
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
  const [paymentType, setPaymentType] = useState("full");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("paytabs");

  useEffect(() => {
    const stored = localStorage.getItem("customer");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomer(parsed);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
      } catch (e) { console.error(e); }
    }
    const storedCart = localStorage.getItem("cart");
    if (storedCart) { setCart(JSON.parse(storedCart)); }
  }, []);

  const { cartItems } = useCart();
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const depositPercentage = useMemo(() => {
    if (cart.cartType !== "package") return 100;
    const title = cart?.package?.title?.toLowerCase() || "";
    if (title.includes("room")) return 50;
    if (title.includes("villa")) return 25;
    if (title.includes("apartment")) return 40;
    return 100;
  }, [cart]);

  const subtotal = useMemo(() => {
    let base = 0;
    if (cart.cartType === "package") {
      const rawPrice = cart?.package?.price;
      const numericPrice = typeof rawPrice === "string"
        ? Number(rawPrice.replace(/\D/g, ""))
        : Number(rawPrice) || 0;

      const extraFee = Number(cart?.extraFee) || 0;
      base = numericPrice + extraFee;

      if (paymentType === "deposit") {
        return (base * depositPercentage) / 100;
      }
    } else {
      base = safeCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }
    return base;
  }, [cart, safeCartItems, paymentType, depositPercentage]);

  const shipping = 0;
  const vat = subtotal * 0.15;
  const total = subtotal + shipping + vat;

  // ==========================================
  // TABBY PROMO SNIPPET INITIALIZATION
  // ==========================================
  useEffect(() => {
    if (selectedPayment === "tabby" && typeof window !== "undefined" && window.TabbyPromo) {
      try {
        // Small delay to ensure the DOM element #TabbyPromo is rendered
        setTimeout(() => {
          new window.TabbyPromo({
            selector: '#TabbyPromo',
            currency: 'SAR',
            price: total.toFixed(2),
            installmentsCount: 4,
            lang: locale === "ar" ? "ar" : "en",
            source: 'checkout',
            publicKey: 'pk_test_YOUR_PUBLIC_KEY', // <-- IMPORTANT: Replace with your Tabby Public Key
            merchantCode: 'ACI' // Replace with your Merchant Code
          });
        }, 100);
      } catch (err) {
        console.error("Tabby Promo Error:", err);
      }
    }
  }, [selectedPayment, total, locale]);

  if (!checkout) return null;

  const handleCheckout = async () => {
    setErrorMsg("");
    setLoading(true);

    if (!name || !address || !phone || !email) {
      setErrorMsg(isRTL ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill all required fields");
      setLoading(false);
      return;
    }

    if (phone.replace(/\D/g, "").length < 9) {
      setErrorMsg(isRTL ? "رقم الهاتف غير صحيح" : "Invalid phone number");
      setLoading(false);
      return;
    }

    if (!customer?.id) {
      const redirectTo = `/${locale}/checkout`;
      window.location.href = `/${locale}/login?redirect=${encodeURIComponent(redirectTo)}`;
      setLoading(false);
      return;
    }

    const formattedPhone = formatSaudiPhone(phone);
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    const orderPayload = cart.cartType === "package"
      ? {
        customerId: customer.id,
        orderType: "package",
        customerName: name,
        customerEmail: email,
        customerPhone: formattedPhone,
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
        customerPhone: formattedPhone,
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
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (!json.success || !json.orderId) throw new Error(json.message || "Order creation failed");

      if (selectedPayment === "bank_transfer") {
        localStorage.removeItem("cart");
        window.location.href = `/${locale}/order-success?orderId=${json.orderId}&method=bank`;
        return;
      }

      let endpoint = "";
      if (selectedPayment === "paytabs") endpoint = "/api/paytabs/initiate";
      if (selectedPayment === "tabby") endpoint = "/api/tabby/initiate";
      if (selectedPayment === "tamara") endpoint = "/api/tamara/checkout";

      const paymentRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: json.orderId,
          lang: locale === "ar" ? "ar" : "en", // Fix for Point 6
          firstName,
          lastName,
          phone: formattedPhone,
          email,
          amount: total,
          items: cart.cartType === "package" ? [{ name: cart.package.title, price: total, quantity: 1 }] : safeCartItems
        }),
      });

      const paymentData = await paymentRes.json();
      const redirectUrl = paymentData.url || paymentData.redirectUrl;

      if (redirectUrl) {
        localStorage.removeItem("cart");
        window.location.href = redirectUrl;
      } else {
        throw new Error(paymentData.message || "Failed to initiate payment");
      }
    } catch (err) {
      setErrorMsg(isRTL ? `حدث خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Tabby Promo Script */}
      <Script src="https://checkout.tabby.ai/tabby-promo.js" strategy="lazyOnload" />

      <section dir={isRTL ? "rtl" : "ltr"} className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-4 md:mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

          {/* LEFT COLUMN */}
          <div className="space-y-8">

            {/* 1. Payment Plan Selection */}
            {cart.cartType === "package" && (
              <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-[#2D3247]">
                  {isRTL ? "اختر خطة الدفع" : "Select Payment Plan"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setPaymentType("full")}
                    className={`cursor-pointer p-4 border rounded-xl transition-all flex items-center gap-4 ${paymentType === "full" ? "border-[#2D3247] bg-gray-50 ring-1 ring-[#2D3247]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === "full" ? "border-[#2D3247]" : "border-gray-300"}`}>
                      {paymentType === "full" && <div className="w-2.5 h-2.5 bg-[#2D3247] rounded-full" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{isRTL ? "دفع كامل المبلغ" : "Full Payment"}</p>
                      <p className="text-xs text-gray-500">{isRTL ? "ادفع 100% الآن" : "Pay 100% now"}</p>
                    </div>
                    <CreditCard className="ms-auto text-gray-400" size={20} />
                  </div>

                  <div
                    onClick={() => setPaymentType("deposit")}
                    className={`cursor-pointer p-4 border rounded-xl transition-all flex items-center gap-4 ${paymentType === "deposit" ? "border-[#5E7E7D] bg-gray-50 ring-1 ring-[#5E7E7D]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === "deposit" ? "border-[#5E7E7D]" : "border-gray-300"}`}>
                      {paymentType === "deposit" && <div className="w-2.5 h-2.5 bg-[#5E7E7D] rounded-full" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{isRTL ? `دفع عربون (${depositPercentage}%)` : `Pay Deposit (${depositPercentage}%)`}</p>
                      <p className="text-xs text-gray-500">{isRTL ? "والباقي عند التسليم" : "Rest later on"}</p>
                    </div>
                    <Wallet className="ms-auto text-gray-400" size={20} />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Invoice Form */}
            <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">{checkout?.invoice?.title}</h2>
              <div className="space-y-4">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={checkout.invoice.firstPlaceholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#2D3247] outline-none" />
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={checkout.invoice.locationPlaceholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#2D3247] outline-none" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="w-full">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#2D3247]"
                      dir="ltr"
                    />
                    <p className="text-[10px] text-gray-500 mt-1.5 mx-1 font-medium">
                      {isRTL
                        ? "رقم جوال سعودي (مطلوب لخدمة تابي وتمارا)"
                        : "Saudi phone number (Required for Tabby or Tamara)"}
                    </p>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={checkout.invoice.emailPlaceholder}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-[#2D3247]"
                    dir="ltr"
                  />
                </div>

              </div>
              {errorMsg && <p className="mt-4 text-red-500 text-xs font-bold">{errorMsg}</p>}
            </div>

            {/* 3. Package Features Details (Collapsible) */}
            {cart.cartType === "package" && cart.package?.features && (
              <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-[#5e7e7d]" size={22} />
                    <h2 className="text-lg font-bold text-[#2D3247]">
                      {isRTL ? "ماذا تشمل هذه الباقة؟" : "What's Included?"}
                    </h2>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {cart.package.type}
                  </div>
                </div>

                {/* Quick Stats Block */}
                <div className="grid grid-cols-4 gap-1 py-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                  <div className="text-center border-e border-gray-200">
                    <p className="text-[9px] text-gray-400 uppercase font-medium">{isRTL ? "المساحة" : "Area"}</p>
                    <p className="text-[10px] font-bold text-gray-700 truncate px-1">{cart.package?.area}</p>
                  </div>
                  <div className="text-center border-e border-gray-200">
                    <p className="text-[9px] text-gray-400 uppercase font-medium">{isRTL ? "تعديلات" : "Revisions"}</p>
                    <p className="text-[10px] font-bold text-gray-700">2 Free</p>
                  </div>
                  <div className="text-center border-e border-gray-200">
                    <p className="text-[9px] text-gray-400 uppercase font-medium">{isRTL ? "الضريبة" : "Tax"}</p>
                    <p className="text-[10px] font-bold text-gray-700">15% Inc.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-gray-400 uppercase font-medium">{isRTL ? "دفعات" : "Pay"}</p>
                    <p className="text-[10px] font-bold text-gray-700">{isRTL ? "مرنة" : "Flex"}</p>
                  </div>
                </div>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-sm font-bold text-[#5e7e7d]">
                      {isRTL ? "عرض جميع المميزات" : "View All Features"}
                    </span>
                    <span className="transition group-open:rotate-180 text-gray-400">
                      <svg fill="none" height="18" width="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                    {cart.package.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-50 bg-gray-50/30">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                        <span className="text-xs text-gray-600 leading-relaxed font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {/* 4. Bank Transfer Details */}
            {selectedPayment === "bank_transfer" && (
              <div className="border border-[#5e7e7d]/30 bg-[#5e7e7d]/5 rounded-xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 mb-4 text-[#5e7e7d]">
                  <Landmark size={24} />
                  <h2 className="text-lg font-bold">
                    {isRTL ? "تفاصيل التحويل البنكي" : "Bank Transfer Details"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <p className="text-[#5e7e7d] font-medium opacity-80">{isRTL ? "اسم الحساب" : "Account Name"}</p>
                    <p className="font-bold text-gray-800">مؤسسة محيط أطلس للديكور</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[#5e7e7d] font-medium opacity-80">{isRTL ? "البنك" : "Bank"}</p>
                    <p className="font-bold text-gray-800">SNB | البنك الأهلي السعودي</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[#5e7e7d] font-medium opacity-80">{isRTL ? "رقم الحساب" : "Account Number"}</p>
                    <p className="font-bold text-gray-800">01400024792710</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[#5e7e7d] font-medium opacity-80">{isRTL ? "الآيبان (IBAN)" : "IBAN"}</p>
                    <p className="font-bold text-gray-800" dir="ltr">SA27 1000 0001 4000 2479 2710</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/60 rounded-lg border border-[#5e7e7d]/20">
                  <p className="text-xs text-[#5e7e7d] font-medium flex items-start gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    {isRTL
                      ? "يرجى إرسال صورة إيصال التحويل عبر الواتساب لتأكيد الطلب: +966 53 787 8794"
                      : "Please share the transfer receipt via WhatsApp to confirm your order: +966 53 787 8794"}
                  </p>
                </div>
              </div>
            )}

            {/* 5. Additional Information */}
            <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">{checkout.additional.title}</h2>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={checkout.additional.placeholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none focus:border-[#2D3247] outline-none" />
            </div>
          </div>

          {/* RIGHT COLUMN - ORDER SUMMARY */}
          <div className="space-y-8">
            <div className="border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm bg-white">
              <h2 className="text-xl font-bold mb-6 text-[#2D3247]">
                {isRTL ? "ملخص الباقة" : "Package Summary"}
              </h2>

              {cart.cartType === "package" ? (
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#5e7e7d] font-bold mb-1">
                        {isRTL ? "باقة تصميم" : "Design Package"}
                      </p>
                      <h3 className="text-lg font-bold text-gray-800 leading-tight">{cart.package?.title}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-[#2D3247]">{cart.package?.price} <SaudiRiyalIcon size={16} className="inline-block " /></span>
                    </div>
                  </div>
                  {cart.extraFee > 0 && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                      <div>
                        <span className="text-amber-800 text-sm font-bold block">{isRTL ? "رسوم إضافية" : "Additional Fee"}</span>
                        <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">{cart.feeReason}</p>
                      </div>
                      <span className="font-bold text-amber-800 text-sm">+{cart.extraFee} <SaudiRiyalIcon size={12} className="inline-block " /></span>
                    </div>
                  )}

                  <hr className="border-gray-100" />

                  {/* PROJECT STEPS (Collapsible) */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <h2 className="font-bold text-sm text-gray-800">{isRTL ? "اختياراتك للمشروع" : "Project Selections"}</h2>
                      <span className="transition group-open:rotate-180 text-gray-400">
                        <svg fill="none" height="18" width="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </summary>
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                      {cart.steps && Object.keys(cart.steps).map((key, index) => {
                        const step = cart.steps[key];
                        const title = Array.isArray(step.selections)
                          ? step.selections.map(s => s.cardTitle || s.label).join(", ")
                          : (step.cardTitle ?? step.label ?? step.value);
                        return (
                          <div key={key} className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                            <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">{step.question}</p>
                            <div className="flex items-start gap-2">
                              <span className="text-[#2D3247] font-bold text-xs mt-0.5">{index + 1}.</span>
                              <span className="text-gray-700 text-[12px] font-medium">{title}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>

                  <hr className="my-4 border-gray-100" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{isRTL ? "الضريبة (15%)" : "VAT (15%)"}</span>
                      <span>{vat.toFixed(2)} <SaudiRiyalIcon size={16} className="inline-block " /></span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t border-gray-100 pt-4 mt-4">
                      <span className="text-gray-900">{isRTL ? "الإجمالي" : "Total"}</span>
                      <div className="text-right">
                        <span className="text-[#2D3247]">{total.toFixed(2)} <SaudiRiyalIcon size={16} className="inline-block " /></span>
                        <p className="text-[10px] text-gray-400 font-normal">{isRTL ? "شامل الضريبة" : "VAT Included"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeCartItems.length === 0 ? (
                    <p className="text-gray-500 text-sm">{isRTL ? "السلة فارغة" : "No items in cart."}</p>
                  ) : (
                    <>
                      {/* List of Shop Items */}
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {safeCartItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <img src={item.coverImage} className="w-10 h-10 rounded border object-cover" alt={item.name} />
                              <div>
                                <p className="font-medium text-gray-800">{item.name}</p>
                                <p className="text-[10px] text-gray-400">× {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-gray-700 flex items-end gap-1">
                              {(item.price * item.quantity).toFixed(2)} <span className="text-[10px]"><SaudiRiyalIcon size={16} className="inline-block " /></span>
                            </span>
                          </div>
                        ))}
                      </div>

                      <hr className="my-4 border-gray-100" />

                      {/* Totals Breakdown */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                          <span>{subtotal.toFixed(2)} <SaudiRiyalIcon size={16} className="inline-block " /></span>
                        </div>

                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{isRTL ? "الضريبة (15%)" : "VAT (15%)"}</span>
                          <span>{vat.toFixed(2)} <SaudiRiyalIcon size={16} className="inline-block " /></span>
                        </div>

                        <div className="flex justify-between items-center text-lg font-bold border-t border-gray-100 pt-4 mt-4">
                          <span className="text-gray-900">{isRTL ? "الإجمالي" : "Total"}</span>
                          <div className="text-right">
                            <span className="text-[#2D3247]">{total.toFixed(2)} <SaudiRiyalIcon size={16} className="inline-block " /></span>
                            <p className="text-[10px] text-gray-400 font-normal">
                              {isRTL ? "شامل الضريبة" : "VAT Included"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* PAYMENT METHODS SELECTION */}
            <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">
                {checkout.payment.title}
              </h2>

              <div className="space-y-4">
                {/* PayTabs */}
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
                      <img src="/icons/visa.png" alt="Visa" className="h-5 object-contain" />
                      <img src="/icons/mastercard.png" alt="Mastercard" className="h-5 object-contain" />
                      <img src="/icons/mada.png" alt="Mada" className="h-5 object-contain" />
                    </div>
                  </div>
                </div>

                {/* Tabby */}
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
                      {/* FIX: Tabby name exactly as per requirements */}
                      <span className="font-bold text-sm">
                        {locale === "ar" ? "تابي" : "Tabby"}
                      </span>
                    </div>
                    <img src="/public/tabby.webp" alt="Tabby" className="h-6 object-contain" />
                  </div>
                  
                  {/* FIX: Tabby Checkout Promo Snippet */}
                  {selectedPayment === "tabby" && (
                    <div className="mt-4 pt-4 border-t border-[#3EEDBF]/30">
                       <div id="TabbyPromo"></div>
                    </div>
                  )}
                </div>

                {/* Tamara */}
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
                    <img src="/icons/tamara.png" alt="Tamara" className="h-6 object-contain" />
                  </div>
                </div>

                {/* Bank Transfer */}
                <div
                  onClick={() => setSelectedPayment("bank_transfer")}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "bank_transfer" ? "border-[#5e7e7d] bg-[#5e7e7d]/5 ring-1 ring-[#5e7e7d]" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={selectedPayment === "bank_transfer"} onChange={() => setSelectedPayment("bank_transfer")} className="accent-[#5e7e7d] w-4 h-4" />
                    <span className="font-medium text-sm">{isRTL ? "تحويل بنكي" : "Bank Transfer"}</span>
                    <Landmark size={20} className={`ms-auto ${selectedPayment === 'bank_transfer' ? 'text-[#5e7e7d]' : 'text-gray-400'}`} />
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
              {!customer?.id && <p className="text-[10px] text-center mt-2 text-red-400">{isRTL ? "يرجى تسجيل الدخول للمتابعة" : "Please login to proceed"}</p>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}