"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useCart } from "@/app/context/CartContext";
import { useState, useMemo, useEffect } from "react";
import { Landmark, CheckCircle2, CreditCard, Wallet, Sparkles, Box, ShieldCheck, Layers } from "lucide-react";

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
      try { setCustomer(JSON.parse(stored)); } catch (e) { console.error(e); }
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

  const shipping = cart.cartType === "package" ? 0 : (subtotal > 500 ? 0 : 25);
  const vat = subtotal * 0.15;
  const total = subtotal + shipping + vat;

  if (!checkout) return null;

  const handleCheckout = async () => {
    setErrorMsg("");
    setLoading(true);
    // ... (Keep existing handleCheckout logic from previous version)
  };

  return (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none" dir="ltr" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={checkout.invoice.emailPlaceholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none" dir="ltr" />
              </div>
            </div>
          </div>

          {/* 3. NEW BLOCK: Package Features Details (Collapsible) */}
          {cart.cartType === "package" && cart.package?.features && (
            <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-[#5e7e7d]" size={22} />
                  <h2 className="text-lg font-bold text-[#2D3247]">
                    {isRTL ? "ماذا تشمل هذه الباقة؟" : "What's Included in this Package?"}
                  </h2>
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {cart.package.type}
                </div>
              </div>

              {/* Quick Stats - Always Visible */}
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

              {/* Collapsible Features Grid */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {cart.package.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-50 bg-gray-50/30">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                      <span className="text-xs text-gray-600 leading-relaxed font-medium">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* 4. Additional Information */}
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

                {/* Package Header (Type, Name, Price) */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#5e7e7d] font-bold mb-1">
                      {isRTL ? "باقة تصميم" : "Design Package"}
                    </p>
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">
                      {cart.package?.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-[#2D3247]">
                      {cart.package?.price}
                    </span>
                  </div>
                </div>

                {/* Horizontal Quick Stats (3-4 points) */}


                {/* Additional Fee Logic */}
                {cart.extraFee > 0 && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                    <div>
                      <span className="text-amber-800 text-sm font-bold block">{isRTL ? "رسوم إضافية" : "Additional Fee"}</span>
                      <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">{cart.feeReason}</p>
                    </div>
                    <span className="font-bold text-amber-800 text-sm">+{cart.extraFee} SAR</span>
                  </div>
                )}

                <hr className="border-gray-100" />

                {/* PROJECT STEPS (Collapsible as requested) */}
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h2 className="font-bold text-sm text-gray-800">
                      {isRTL ? "اختياراتك للمشروع" : "Project Selections"}
                    </h2>
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

                <hr className="border-gray-100" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span>{subtotal.toFixed(2)} SAR</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{isRTL ? "الضريبة (15%)" : "VAT (15%)"}</span>
                    <span>{vat.toFixed(2)} SAR</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-5 mt-4">
                    <span className="text-lg font-bold text-gray-900">{isRTL ? "الإجمالي" : "Total"}</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[#2D3247]">{total.toFixed(2)} SAR</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm">No Package in Cart</div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 text-sm font-bold bg-[#2D3247] text-white rounded-md hover:bg-[#1e2231] transition disabled:opacity-50"
              >
                {loading ? "..." : (isRTL ? "تأكيد والدفع" : "Confirm & Pay")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}