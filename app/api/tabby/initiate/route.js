import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { orderId, lang = "en" } = await req.json();

    const tabbyKey = process.env.TABBY_SECRET_KEY;
    const merchantCode = process.env.TABBY_MERCHANT_CODE || "atlantis";

    if (!tabbyKey) {
      return NextResponse.json({ success: false, message: "Server Error: Key Missing" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // POINT 6 FIX: Logic for Loyalty Level & Buyer History
    let loyaltyLevel = 0;
    let registeredSince = order.createdAt.toISOString();
    
    if (order.customerId) {
        const pastOrders = await prisma.order.findMany({
            where: { 
                customerId: order.customerId, 
                id: { not: order.id },
                paymentStatus: { in: ['paid', 'AUTHORIZED', 'CLOSED'] } 
            }
        });
        loyaltyLevel = pastOrders.length;
        if (order.customer?.createdAt) {
          registeredSince = order.customer.createdAt.toISOString();
        }
    }

    // POINT 5 FIX: Category Mapping (Use high-level names like 'Home Improvement' or 'Furniture')
    const mapCategory = (cat) => {
        // Map your internal categories to Tabby's high-level requirements
        if (order.orderType === 'package') return "Home Services";
        return "Home Improvement"; 
    };

    const currentItems = order.items.length > 0 ? order.items.map(i => ({
        title: i.name,
        quantity: i.quantity,
        unit_price: i.price.toFixed(2),
        category: mapCategory(i.category) 
    })) : [{
        title: order.packageDetails?.title || "Project Deposit",
        quantity: 1,
        unit_price: order.total.toFixed(2),
        category: "Home Services"
    }];

    const payload = {
      payment: {
        amount: order.total.toFixed(2),
        currency: "SAR",
        description: `Order #${order.id} at Atlantis.sa`,
        buyer: {
          phone: order.customerPhone || "",
          email: order.customerEmail || "",
          name: order.customerName || "Guest",
        },
        buyer_history: {
          registered_since: registeredSince,
          loyalty_level: loyaltyLevel
        },
        shipping_address: {
          city: order.city || "Riyadh", // Point 7: Ensure city is present
          address: order.address || "Saudi Arabia",
          zip: order.zip || "12345",
        },
        order: {
          reference_id: order.id.toString(),
          items: currentItems
        }
      },
      lang: lang,
      merchant_code: merchantCode,
      merchant_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/order-success?orderId=${order.id}`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/order-failed?orderId=${order.id}`,
        cancel: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/checkout`, 
      }
    };

    const response = await fetch("https://api.tabby.ai/api/v2/checkout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tabbyKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === "rejected") {
       return NextResponse.json({ success: false, status: "rejected" });
    }

    if (data.configuration?.available_products?.installments?.[0]?.web_url) {
      return NextResponse.json({ 
        success: true, 
        redirectUrl: data.configuration.available_products.installments[0].web_url 
      });
    }

    return NextResponse.json({ success: false, message: "Tabby session failed" });

  } catch (error) {
    console.error("Tabby Initiate Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}