// app/api/tamara/checkout/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    // In App Router, we must await .json()
    const body = await request.json();
    const { firstName, lastName, phone, email, amount, items, orderId } = body;

    // Construct Tamara Payload
    const payload = {
      total_amount: { amount: parseFloat(amount), currency: "SAR" },
      shipping_amount: { amount: 0, currency: "SAR" },
      tax_amount: { amount: 0, currency: "SAR" }, // Adjust if you have tax logic
      order_reference_id: orderId, // Use the ID from your DB
      order_number: orderId,
      discount: { name: "None", amount: { amount: 0, currency: "SAR" } },
      consumer: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone, // Must be +966...
        email: email
      },
      country_code: "SA",
      description: `Order ${orderId}`,
      merchant_url: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        cancel: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
        notification: `${process.env.NEXT_PUBLIC_BASE_URL}/api/tamara/webhook`
      },
      items: items.map(item => ({
        reference_id: item.sku || "ITEM",
        type: "physical",
        name: item.name,
        sku: item.sku || "GENERIC",
        quantity: item.quantity || 1,
        total_amount: { amount: parseFloat(item.price), currency: "SAR" }
      })),
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        line1: "Riyadh",
        city: "Riyadh",
        country_code: "SA",
        phone_number: phone
      }
    };

    const response = await axios.post(
      `${process.env.TAMARA_API_URL}/checkout`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.TAMARA_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({ url: response.data.checkout_url });

  } catch (error) {
    console.error("Tamara Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Tamara checkout failed", details: error.response?.data },
      { status: 400 }
    );
  }
}