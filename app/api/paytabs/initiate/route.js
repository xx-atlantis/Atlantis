import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    // 1. Fetch Order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // 2. Load and Clean Keys
    const serverKey = (process.env.PAYTABS_SERVER_KEY || "").trim();
    const profileId = (process.env.PAYTABS_PROFILE_ID || "").trim();

    // 3. Prepare Payload
    const payload = {
      profile_id: profileId,
      tran_type: "sale",
      tran_class: "ecom",
      cart_id: order.id,
      cart_description: `Order #${order.id}`,
      cart_currency: "SAR",
      cart_amount: order.total,
      callback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paytabs/callback`,
      
      // ✅ FIX IS HERE: Point to the new Unified Success Page AND pass the orderId
      return: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?orderId=${order.id}`,
      
      customer_details: {
        name: order.customerName || "Guest",
        email: order.customerEmail || "no-email@example.com",
        phone: order.customerPhone || "0000000000",
        street: order.address || "Riyadh",
        city: "Riyadh",
        state: "Riyadh",
        country: "SA",
        zip: "12345",
        ip: "1.1.1.1",
      },
      hide_shipping: true,
    };

    // 4. Send to PayTabs (Saudi Endpoint)
    const response = await fetch("https://secure.paytabs.sa/payment/request", {
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
      return NextResponse.json({ success: false, message: "PayTabs rejected the request" });
    }
  
  } catch (error) {
    console.error("PayTabs API Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}