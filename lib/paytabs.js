// lib/paytabs.js
import crypto from 'crypto';

const PAYTABS_ENDPOINT = 'https://secure.paytabs.sa/payment/request';

// Added "selectedMethod" parameter
export const initiatePayment = async (paymentData, selectedMethod = null) => {
  
  // 1. Base Payload
  const payload = {
    profile_id: parseInt(process.env.PAYTABS_PROFILE_ID),
    tran_type: "sale",
    tran_class: "ecom",
    cart_id: paymentData.cart_id,
    cart_currency: "SAR",
    cart_amount: paymentData.amount,
    cart_description: paymentData.description,
    paypage_lang: "en",
    callback: `${process.env.BASE_URL}/api/paytabs/callback`,
    return: `${process.env.BASE_URL}/payment/result`,
    customer_details: paymentData.customer_details,
    hide_shipping: true,
  };

  // 2. Filter Payment Methods (The Magic Part)
  // If user selected specific method, force PayTabs to use it.
  if (selectedMethod) {
    if (selectedMethod === 'tabby') {
      payload.payment_methods = ['tabby']; 
    } else if (selectedMethod === 'tamara') {
      payload.payment_methods = ['tamara'];
    } else if (selectedMethod === 'card') {
      payload.payment_methods = ['creditcard', 'mada', 'applepay'];
    }
    // If null/bank, we let PayTabs show everything
  }

  const response = await fetch(PAYTABS_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: process.env.PAYTABS_SERVER_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayTabs Error: ${errorText}`);
  }

  return await response.json();
};

export const verifySignature = (data, signature, serverKey) => {
  const sortedKeys = Object.keys(data)
    .filter((key) => key !== 'signature' && data[key] !== '' && data[key] !== null && data[key] !== undefined)
    .sort();

  const query = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');

  const hashed = crypto.createHmac('sha256', serverKey).update(query).digest('hex');

  return hashed === signature;
};