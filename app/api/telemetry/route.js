import { NextResponse } from 'next/server';

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
    
    const payload = {
      action: 'log_error',
      license_key: LICENSE_HUB_KEY,
      error_message: body.errorMessage || "Unknown Error",
      file: body.stackTrace || "Unknown File",
      line: 0
    };

    console.log("📡 TRANSMITTING TO PHP HUB:", payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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