"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useCart } from "@/app/context/CartContext";
import { useState, useMemo, useEffect } from "react";
import { SaudiRiyal, Landmark, CheckCircle2 } from "lucide-react"; // Added Landmark icon

// --- HELPER: Fix Saudi Phone Numbers ---
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

  // Form States
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Payment State (Default: PayTabs)
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

  // Calculations
  const subtotal = useMemo(() => {
    if (cart.cartType === "package") {
      const numericPrice = Number(cart?.package?.price?.replace(/\D/g, "")) || 0;
      const extraFee = Number(cart?.extraFee) || 0;
      return numericPrice + extraFee;
    }
    return safeCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart, safeCartItems]);

  const shipping = cart.cartType === "package" ? 0 : (subtotal > 500 ? 0 : 25);
  const vat = subtotal * 0.15;
  const total = subtotal + shipping + vat;

  if (!checkout) return null;

  const handleCheckout = async () => {
    setErrorMsg("");
    setLoading(true);

    if (!name || !address || !phone || !email) {
      setErrorMsg(isRTL ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill all required fields");
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

    const orderPayload = cart.cartType === "package" ? {
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
    } : {
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
        price: i.price,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Order creation failed");

      // --- BANK TRANSFER LOGIC ---
      if (selectedPayment === "bank_transfer") {
        localStorage.removeItem("cart");
        // Redirect to a success page with order ID
        window.location.href = `/${locale}/order-success?orderId=${json.orderId}&method=bank`;
        return;
      }

      // --- ONLINE PAYMENT LOGIC ---
      let endpoint = "";
      if (selectedPayment === "paytabs") endpoint = "/api/paytabs/initiate";
      if (selectedPayment === "tabby") endpoint = "/api/tabby/initiate";
      if (selectedPayment === "tamara") endpoint = "/api/tamara/checkout";

      const paymentRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: json.orderId,
          firstName,
          lastName,
          phone: formattedPhone,
          email,
          amount: total,
          items: safeCartItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, sku: i.id }))
        }),
      });

      const paymentData = await paymentRes.json();
      const redirectUrl = paymentData.url || paymentData.redirectUrl;

      if (redirectUrl) {
        localStorage.removeItem("cart");
        window.location.href = redirectUrl;
      } else {
        throw new Error(paymentData.message || "Payment initiation failed");
      }

    } catch (err) {
      setErrorMsg(isRTL ? `حدث خطأ: ${err.message}` : `Payment Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="py-20 bg-gray-50">
      {!customer?.id && (
        <div className="max-w-6xl bg-[#2D3247] text-white p-2 mx-auto rounded-md mb-4 text-center text-sm">
          {isRTL ? "يرجى تسجيل الدخول قبل المتابعة" : "Please Login Before filling this form."}
        </div>
      )}

      <div className="max-w-6xl mx-4 md:mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        
        {/* LEFT: FORMS */}
        <div className="space-y-8">
          <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
            {errorMsg && <p className="text-red-600 mb-4 font-medium bg-red-50 p-3 rounded text-sm">{errorMsg}</p>}
            <h2 className="text-lg font-semibold mb-6">{checkout?.invoice?.title}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">{checkout.invoice.name}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={checkout.invoice.firstPlaceholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#2D3247] outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600">{checkout.invoice.location}</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={checkout.invoice.locationPlaceholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#2D3247] outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">{checkout.invoice.phone}</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#2D3247] outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">{checkout.invoice.email}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={checkout.invoice.emailPlaceholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#2D3247] outline-none" dir="ltr" />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{checkout.additional.title}</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={checkout.additional.placeholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none focus:border-[#2D3247] outline-none" />
          </div>
        </div>

        {/* RIGHT: SUMMARY & PAYMENT */}
        <div className="space-y-8">
          {/* Summary Box (Package or Shop) - Kept your existing logic */}
          <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
             {/* ... (Your existing summary code stays here) ... */}
             <h2 className="text-lg font-semibold mb-4">{isRTL ? "ملخص الطلب" : "Order Summary"}</h2>
             <div className="flex justify-between text-base font-bold text-[#2D3247]">
                <span>{isRTL ? "الإجمالي" : "Total"}</span>
                <span>{total.toFixed(2)} SAR</span>
             </div>
          </div>

          {/* PAYMENT SELECTION */}
          <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">{checkout.payment.title}</h2>
            <div className="space-y-3">
              
              {/* PayTabs */}
              <div onClick={() => setSelectedPayment("paytabs")} className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "paytabs" ? "border-[#2D3247] bg-gray-50 ring-1 ring-[#2D3247]" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={selectedPayment === "paytabs"} readOnly className="accent-[#2D3247]" />
                    <span className="font-medium text-sm">{isRTL ? "بطاقة ائتمان / مدى" : "Credit / Debit / Mada"}</span>
                  </div>
                  <div className="flex gap-1"><img src="/icons/visa.png" className="h-4" /><img src="/icons/mada.png" className="h-4" /></div>
                </div>
              </div>

              {/* Tabby */}
              <div onClick={() => setSelectedPayment("tabby")} className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "tabby" ? "border-[#3EEDBF] bg-emerald-50 ring-1 ring-[#3EEDBF]" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={selectedPayment === "tabby"} readOnly className="accent-[#3EEDBF]" />
                    <span className="font-medium text-sm">{isRTL ? "تابي" : "Tabby"}</span>
                  </div>
                  <img src="/icons/tabby.webp" className="h-6" />
                </div>
              </div>

              {/* Tamara */}
              <div onClick={() => setSelectedPayment("tamara")} className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "tamara" ? "border-[#E4806D] bg-orange-50 ring-1 ring-[#E4806D]" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={selectedPayment === "tamara"} readOnly className="accent-[#E4806D]" />
                    <span className="font-medium text-sm">{isRTL ? "تمارا" : "Tamara"}</span>
                  </div>
                  <img src="/icons/tamara.png" className="h-5" />
                </div>
              </div>

              {/* Bank Transfer */}
              <div 
                onClick={() => setSelectedPayment("bank_transfer")} 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "bank_transfer" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200"}`}
              >
                <div className="flex items-center gap-3">
                  <input type="radio" checked={selectedPayment === "bank_transfer"} readOnly className="accent-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{isRTL ? "تحويل بنكي" : "Bank Transfer"}</span>
                    <span className="text-[10px] text-gray-500">{isRTL ? "التحويل المباشر لحسابنا" : "Direct transfer to our account"}</span>
                  </div>
                  <Landmark size={20} className="ms-auto text-gray-400" />
                </div>

                {/* Bank Details Dropdown (Visible only when selected) */}
                {selectedPayment === "bank_transfer" && (
                  <div className="mt-4 pt-4 border-t border-blue-100 text-[11px] md:text-xs space-y-2 animate-fadeIn">
                    <div className="bg-white p-3 rounded border border-blue-100 space-y-1 text-gray-700">
                      <p className="font-bold text-blue-700 mb-1">{isRTL ? "تفاصيل الحساب:" : "Account Details:"}</p>
                      <p><strong>{isRTL ? "اسم الحساب:" : "NAME:"}</strong> مؤسسة محيط أطلس للديكور</p>
                      <p><strong>{isRTL ? "البنك:" : "BANK:"}</strong> SNB</p>
                      <p><strong>{isRTL ? "رقم الحساب:" : "ACC #:"}</strong> 01400024792710</p>
                      <p className="break-all font-mono"><strong>IBAN:</strong> SA2710000001400024792710</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <CheckCircle2 size={14} />
                      <p>{isRTL ? "يرجى مشاركة الإيصال عبر الواتساب:" : "Share receipt via WhatsApp:"} +966537878794</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !customer?.id}
              className="mt-8 w-full py-3 text-sm font-bold bg-[#2D3247] text-white rounded-md hover:bg-[#1e2231] transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                selectedPayment === "bank_transfer" ? (isRTL ? "تأكيد الطلب" : "Confirm Order") : checkout.payment.checkout
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}