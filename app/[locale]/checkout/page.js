"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import { useCart } from "@/app/context/CartContext";
import { useState, useMemo, useEffect } from "react";
import { Landmark, CheckCircle2, CreditCard, Wallet } from "lucide-react";

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

  // Load customer and cart data from local storage
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

  // Logic: Calculate Deposit Percentage based on package title
  const depositPercentage = useMemo(() => {
    if (cart.cartType !== "package") return 100;
    
    const title = cart?.package?.title?.toLowerCase() || "";
    
    if (title.includes("room")) return 50;
    if (title.includes("villa")) return 25;
    if (title.includes("apartment")) return 40;
    
    return 100; // Fallback
  }, [cart]);

  // Logic: Calculate Subtotal, Shipping, VAT, Total
  const subtotal = useMemo(() => {
    let base = 0;
    if (cart.cartType === "package") {
      const numericPrice = Number(cart?.package?.price?.replace(/\D/g, "")) || 0;
      const extraFee = Number(cart?.extraFee) || 0;
      base = numericPrice + extraFee;
      
      // If deposit is selected, calculate the partial subtotal
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

    const orderPayload = {
      customerId: customer.id,
      orderType: cart.cartType || "shop",
      customerName: name,
      customerEmail: email,
      customerPhone: formattedPhone,
      address,
      notes,
      paymentMethod: selectedPayment,
      paymentPlan: paymentType, 
      depositPaid: paymentType === "deposit",
      subtotal,
      shipping,
      vat,
      total,
      ...(cart.cartType === "package" ? {
        packageDetails: cart.package,
        projectSteps: cart.steps,
      } : {
        items: safeCartItems.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          coverImage: i.coverImage,
        })),
      })
    };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Order creation failed");

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
          firstName,
          lastName,
          phone: formattedPhone,
          email,
          amount: total, 
          items: cart.cartType === "package" ? [{
            name: `${cart.package.title} (${paymentType === 'deposit' ? 'Deposit' : 'Full'})`,
            price: total,
            quantity: 1,
            sku: cart.package.id || "pkg"
          }] : safeCartItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, sku: i.id }))
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
      <div className="max-w-6xl mx-4 md:mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        
        {/* --- LEFT COLUMN: Forms & Details --- */}
        <div className="space-y-8">
          
          {/* 1. Payment Plan Selection (Only for Packages) */}
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

          {/* 3. Bank Transfer Details (Conditionally Rendered) */}
          {selectedPayment === "bank_transfer" && (
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3 mb-4 text-blue-800">
                <Landmark size={24} />
                <h2 className="text-lg font-bold">
                  {isRTL ? "تفاصيل التحويل البنكي" : "Bank Transfer Details"}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <p className="text-blue-600 font-medium">{isRTL ? "اسم الحساب" : "Account Name"}</p>
                  <p className="font-bold text-gray-800">مؤسسة محيط أطلس للديكور</p>
                </div>
                <div className="space-y-1">
                  <p className="text-blue-600 font-medium">{isRTL ? "البنك" : "Bank"}</p>
                  <p className="font-bold text-gray-800">SNB | البنك الأهلي السعودي</p>
                </div>
                <div className="space-y-1">
                  <p className="text-blue-600 font-medium">{isRTL ? "رقم الحساب" : "Account Number"}</p>
                  <p className="font-bold text-gray-800">01400024792710</p>
                </div>
                <div className="space-y-1">
                  <p className="text-blue-600 font-medium">{isRTL ? "الآيبان (IBAN)" : "IBAN"}</p>
                  <p className="font-bold text-gray-800" dir="ltr">SA27 1000 0001 4000 2479 2710</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  {isRTL 
                    ? "يرجى إرسال صورة إيصال التحويل عبر الواتساب لتأكيد الطلب: +966 53 787 8794" 
                    : "Please share the transfer receipt via WhatsApp to confirm your order: +966 53 787 8794"}
                </p>
              </div>
            </div>
          )}

          {/* 4. Additional Notes */}
          <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{checkout.additional.title}</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={checkout.additional.placeholder} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none focus:border-[#2D3247] outline-none" />
          </div>
        </div>

        {/* --- RIGHT COLUMN: Summary & Payment Methods --- */}
        <div className="space-y-8">
          <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
             <h2 className="text-lg font-semibold mb-4">{isRTL ? "ملخص الطلب" : "Order Summary"}</h2>
             <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>{subtotal.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? "الضريبة (15%)" : "VAT (15%)"}</span>
                  <span>{vat.toFixed(2)} SAR</span>
                </div>
             </div>
             <hr className="my-4 border-gray-100" />
             <div className="flex justify-between text-base font-bold text-[#2D3247]">
                <span>{isRTL ? "الإجمالي المستحق" : "Total Due"}</span>
                <span>{total.toFixed(2)} SAR</span>
             </div>
             {paymentType === "deposit" && (
               <p className="mt-4 text-[11px] text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                 {isRTL ? "ملاحظة: لقد اخترت دفع العربون فقط. سيتم طلب المبالغ المتبقية حسب تقدم المشروع." : "Note: You are paying the deposit only. Remaining balance will be requested as the project progresses."}
               </p>
             )}
          </div>

          <div className="border border-gray-200 bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">{checkout.payment.title}</h2>
            <div className="space-y-3">
              {/* PayTabs */}
              <div onClick={() => setSelectedPayment("paytabs")} className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "paytabs" ? "border-[#2D3247] bg-gray-50 ring-1 ring-[#2D3247]" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={selectedPayment === "paytabs"} readOnly className="accent-[#2D3247]" />
                    <span className="font-medium text-sm">{isRTL ? "بطاقة ائتمان / مدى" : "Credit / Debit / Mada"}</span>
                  </div>
                  <div className="flex gap-1"><img src="/icons/visa.png" className="h-4" alt="Visa" /><img src="/icons/mada.png" className="h-4" alt="Mada" /></div>
                </div>
              </div>
              
              {/* Tabby */}
              <div onClick={() => setSelectedPayment("tabby")} className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "tabby" ? "border-[#3EEDBF] bg-emerald-50 ring-1 ring-[#3EEDBF]" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={selectedPayment === "tabby"} readOnly className="accent-[#3EEDBF]" />
                    <span className="font-medium text-sm">{isRTL ? "تابي" : "Tabby"}</span>
                  </div>
                  <img src="/icons/tabby.webp" className="h-6" alt="Tabby" />
                </div>
              </div>

              {/* Tamara */}
              <div onClick={() => setSelectedPayment("tamara")} className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "tamara" ? "border-[#E4806D] bg-orange-50 ring-1 ring-[#E4806D]" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={selectedPayment === "tamara"} readOnly className="accent-[#E4806D]" />
                    <span className="font-medium text-sm">{isRTL ? "تمارا" : "Tamara"}</span>
                  </div>
                  <img src="/icons/tamara.png" className="h-5" alt="Tamara" />
                </div>
              </div>

              {/* Bank Transfer */}
              <div onClick={() => setSelectedPayment("bank_transfer")} className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === "bank_transfer" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" checked={selectedPayment === "bank_transfer"} readOnly className="accent-blue-600" />
                  <span className="font-medium text-sm">{isRTL ? "تحويل بنكي" : "Bank Transfer"}</span>
                  <Landmark size={20} className="ms-auto text-gray-400" />
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !customer?.id}
              className="mt-8 w-full py-4 text-sm font-bold bg-[#2D3247] text-white rounded-md hover:bg-[#1e2231] transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                isRTL ? "تأكيد والدفع" : "Confirm & Pay"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}