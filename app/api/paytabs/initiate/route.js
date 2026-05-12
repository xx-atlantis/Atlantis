import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default billing details per GCC country
const COUNTRY_BILLING = {
  SA: { city: "Riyadh",      state: "Riyadh",      zip: "12345" },
  AE: { city: "Dubai",       state: "Dubai",        zip: "00000" },
  KW: { city: "Kuwait City", state: "Al Asimah",    zip: "00000" },
  QA: { city: "Doha",        state: "Ad Dawhah",    zip: "00000" },
  BH: { city: "Manama",      state: "Capital",      zip: "00000" },
  OM: { city: "Muscat",      state: "Muscat",       zip: "00000" },
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, currency, amount, countryCode } = body;

    // 1. Fetch order
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // 2. Resolve currency and amount
    //    Frontend passes converted amount; fall back to SAR order total if not provided
    const cartCurrency = currency || "SAR";
    const cartAmount   = amount   ?? order.total;
    const billing      = COUNTRY_BILLING[countryCode] || COUNTRY_BILLING.SA;
    const paytabsCountry = countryCode || "SA";

    // 3. Load keys
    const serverKey = (process.env.PAYTABS_SERVER_KEY || "").trim();
    const profileId = (process.env.PAYTABS_PROFILE_ID || "").trim();

    // 4. Build payload
    const payload = {
      profile_id:       profileId,
      tran_type:        "sale",
      tran_class:       "ecom",
      cart_id:          order.id,
      cart_description: `Order #${order.id}`,
      cart_currency:    cartCurrency,
      cart_amount:      cartAmount,
      callback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paytabs/callback`,
      return:   `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?orderId=${order.id}`,
      customer_details: {
        name:    order.customerName  || "Guest",
        email:   order.customerEmail || "no-email@example.com",
        phone:   order.customerPhone || "0000000000",
        street:  order.address       || billing.city,
        city:    billing.city,
        state:   billing.state,
        country: paytabsCountry,
        zip:     billing.zip,
        ip:      "1.1.1.1",
      },
      hide_shipping: true,
    };

    // 5. Call PayTabs
    const response = await fetch(`${process.env.PAYTABS_ENDPOINT}/payment/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": serverKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.redirect_url) {
      return NextResponse.json({ success: true, redirectUrl: data.redirect_url });
    } else {
      console.error("PayTabs Failed:", data);
      return NextResponse.json({ success: false, message: data.message || "PayTabs rejected the request" });
    }

  } catch (error) {
    console.error("PayTabs API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
