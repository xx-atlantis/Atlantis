import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    // --- DIAGNOSTIC LOGS ---
    // We use the SECRET key for backend API calls
    const tabbyKey = process.env.TABBY_SECRET_KEY || "";
    const merchantCode = process.env.TABBY_MERCHANT_CODE || "ACI";

    console.log("--- DEBUGGING KEYS ---");
    console.log("Tabby Key Length:", tabbyKey.length);
    // This must start with 'sk_test_' for the backend API
    console.log("Tabby Key Starts With:", tabbyKey.substring(0, 8)); 
    console.log("Merchant Code:", merchantCode);
    console.log("----------------------");

    if (!tabbyKey) {
      console.error("CRITICAL: Tabby Secret Key is MISSING");
      return NextResponse.json({ success: false, message: "Server Error: Key Missing" });
    }
    // --------------------------------------------------

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true } 
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Prepare the payload based on Tabby V2 documentation
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
          reference_id: order.id.toString(), // Ensure string
          items: order.items ? order.items.map(item => ({
            title: item.name,
            quantity: item.quantity,
            unit_price: item.price.toFixed(2),
            currency: "SAR",
            category: "General"
          })) : []
        },
      },
      lang: "ar",
      merchant_code: merchantCode, // Added from email details
      merchant_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?orderId=${order.id}`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?orderId=${order.id}`,
        cancel: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
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

    // Robust check for the redirect URL
    if (data.status === "created" && data.configuration?.available_products?.installments?.[0]?.web_url) {
      return NextResponse.json({ 
        success: true, 
        redirectUrl: data.configuration.available_products.installments[0].web_url 
      });
    } else {
      console.error("Tabby Rejected or Invalid Response:", JSON.stringify(data));
      // Return the specific rejection reason from Tabby if available
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