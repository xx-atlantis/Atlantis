import { NextResponse } from 'next/server';

// =========================================================
// SECURITY: PAYLOAD SIGNING FUNCTION
// =========================================================
async function signPayload(payloadObject) {
  // Pulls the shared secret from your .env file
  const secret = process.env.SIGNING_SECRET || "mg_core_super_secret_keychain_998877"; 
  const payloadString = JSON.stringify(payloadObject);
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  
  // Create a Web Crypto Key
  const cryptoKey = await crypto.subtle.importKey(
    "raw", 
    keyData, 
    { name: "HMAC", hash: "SHA-256" }, 
    false, 
    ["sign"]
  );
  
  // Sign the payload
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC", 
    cryptoKey, 
    encoder.encode(payloadString)
  );
  
  // Convert buffer to hex string
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request) {
  const LICENSE_HUB_KEY = process.env.LICENSE_HUB_KEY;
  const API_URL = 'https://license.themgdev.com/index.php';

  console.log("-----------------------------------------");
  console.log("🚨 TELEMETRY API ENDPOINT HIT");

  if (!LICENSE_HUB_KEY) {
    console.error("❌ ABORTED: LICENSE_HUB_KEY is missing!");
    return NextResponse.json({ error: "Missing Key" }, { status: 500 });
  }

  try {
    const body = await request.json();
    
    // 1. Build the exact payload
    const payload = {
      action: 'log_error',
      license_key: LICENSE_HUB_KEY,
      domain_name: 'atlantis.sa',
      error_message: body.errorMessage || "Unknown Error",
      file: body.stackTrace || "Unknown File",
      line: 0
    };

    // 2. 🔐 Generate the cryptographic signature for the payload
    const signature = await signPayload(payload);

    console.log("📡 TRANSMITTING TO PHP HUB WITH SIGNATURE:", payload);

    // 3. Send the payload AND the seal
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Signature': signature // 🔐 Attach the seal here!
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(4000)
    });

    const responseText = await response.text();
    console.log("✅ PHP HUB REPLIED:", responseText);
    console.log("-----------------------------------------");

    return NextResponse.json({ success: true, hub_response: responseText });

  } catch (error) {
    console.error("❌ API ROUTE FAILED:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}