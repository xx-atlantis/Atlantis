import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, userEmail, userName, orderId } = body;

    // 1. Prepare the payload for PayTabs
    const payload = {
      profile_id: process.env.PAYTABS_PROFILE_ID,
      tran_type: "sale",
      tran_class: "ecom",
      cart_id: orderId, // Must be unique for every order
      cart_description: "Order #" + orderId,
      cart_currency: "SAR",
      cart_amount: amount,
      callback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
      return: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`, // Page to show after success
      "customer_details": {
        "name": userName,
        "email": userEmail,
        "street1": "Riyadh",
        "city": "Riyadh",
        "state": "Riyadh",
        "country": "SA",
        "ip": "1.1.1.1" // Pass actual IP if possible
      }
    };

    // 2. Send request to PayTabs KSA Endpoint
    const response = await fetch('https://secure.paytabs.sa/payment/request', {
      method: 'POST',
      headers: {
        'authorization': process.env.PAYTABS_SERVER_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // 3. Check if PayTabs accepted the request
    if (data.redirect_url) {
      return NextResponse.json({ url: data.redirect_url });
    } else {
      console.error("PayTabs Error:", data);
      return NextResponse.json({ error: "Failed to initiate payment", details: data }, { status: 400 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}