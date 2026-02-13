import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    // We now expect 'lang' from the frontend (Fix for Point 6)
    const { orderId, lang = "en" } = await req.json(); 

    const tabbyKey = process.env.TABBY_SECRET_KEY || "";
    const merchantCode = process.env.TABBY_MERCHANT_CODE || "ACI";

    if (!tabbyKey) {
      return NextResponse.json({ success: false, message: "Server Error: Key Missing" });
    }

    // Fetch order, including customer data for Tabby's buyer_history requirement
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: true,
        customer: true 
      } 
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // ==========================================
    // POINT 5 FIX: Prepare Order History & Buyer History
    // ==========================================
    let loyaltyLevel = 0;
    let registeredSince = order.createdAt.toISOString();
    let orderHistory = [];

    if (order.customerId && order.customer) {
        registeredSince = order.customer.createdAt.toISOString();
        
        // Fetch up to 10 past orders for this customer
        const pastOrders = await prisma.order.findMany({
            where: { customerId: order.customerId, id: { not: order.id } },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });

        // Loyalty level = number of successful past orders
        loyaltyLevel = pastOrders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'AUTHORIZED').length;

        orderHistory = pastOrders.map(o => ({
            purchased_at: o.createdAt.toISOString(),
            amount: o.total.toFixed(2),
            payment_method: o.paymentMethod || "unknown",
            // Map our DB status to Tabby's expected status strings
            status: o.paymentStatus === 'paid' ? "complete" : (o.paymentStatus === 'pending' ? "new" : "canceled"),
            buyer: {
                phone: o.customerPhone || order.customerPhone || "",
                email: o.customerEmail || order.customerEmail || "",
                name: o.customerName || order.customerName || "Guest"
            },
            shipping_address: {
                city: "Riyadh", // Defaulting to Riyadh. Tabby asks where this is from. Tell them: "As we provide digital/service packages nationwide, we default the city to our HQ (Riyadh) if a specific city isn't provided."
                address: o.address || "Riyadh",
                zip: "12345"
            },
            items: o.orderType === 'package' ? [{
                title: "Design Package",
                quantity: 1,
                unit_price: o.total.toFixed(2),
                category: "Services"
            }] : o.items.map(i => ({
                title: i.name,
                quantity: i.quantity,
                unit_price: i.price.toFixed(2),
                category: "Products"
            }))
        }));
    }

    // ==========================================
    // POINT 5 FIX: Format Current Order Items
    // ==========================================
    let currentItems = [];
    if (order.orderType === 'package') {
        // If it's a design package, create a generic item from the total
        currentItems = [{
            title: order.packageDetails?.title || "Design Package",
            quantity: 1,
            unit_price: order.total.toFixed(2),
            currency: "SAR",
            category: "Services"
        }];
    } else {
        // If it's a shop order, map the actual items
        currentItems = order.items.map(i => ({
            title: i.name,
            quantity: i.quantity,
            unit_price: i.price.toFixed(2),
            currency: "SAR",
            category: "Products"
        }));
    }

    // ==========================================
    // Create the Payload
    // ==========================================
    const payload = {
      payment: {
        amount: order.total.toFixed(2),
        currency: "SAR",
        description: `Order #${order.id}`,
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
          city: "Riyadh",
          address: order.address || "Riyadh",
          zip: "12345",
        },
        order: {
          tax_amount: order.vat ? order.vat.toFixed(2) : "0.00",
          shipping_amount: order.shipping ? order.shipping.toFixed(2) : "0.00",
          discount_amount: "0.00",
          updated_at: new Date().toISOString(),
          reference_id: order.id.toString(),
          items: currentItems // Inserted fixed items here
        },
        order_history: orderHistory // Inserted fixed history here
      },
      lang: lang, // Fixed Point 6
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

    // ==========================================
    // POINT 9 FIX: Handle Pre-scoring Rejection
    // ==========================================
    if (data.status === "rejected") {
       // If Tabby rejects them immediately, redirect to the failure URL
       return NextResponse.json({ 
         success: true, 
         redirectUrl: payload.merchant_urls.failure 
       });
    }

    if (data.status === "created" && data.configuration?.available_products?.installments?.[0]?.web_url) {
      return NextResponse.json({ 
        success: true, 
        redirectUrl: data.configuration.available_products.installments[0].web_url 
      });
    } else {
      console.error("Tabby Invalid Response:", JSON.stringify(data));
      return NextResponse.json({ 
        success: false, 
        message: "Tabby checkout creation failed", 
        debug: data 
      });
    }

  } catch (error) {
    console.error("Tabby Internal Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}