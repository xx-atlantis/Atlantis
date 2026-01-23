import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req) {
  try {
    // 1. Parse Data (Handle Form Data vs JSON automatically)
    const contentType = req.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else {
      // PayTabs standard format is Form Data
      const formData = await req.formData();
      formData.forEach((value, key) => (data[key] = value));
    }

    console.log("🔹 PayTabs Callback Received for Order:", data.cart_id);

    // 2. Validate Signature (Inline Logic)
    const serverKey = process.env.PAYTABS_SERVER_KEY;
    const requestSignature = data.signature;
    delete data.signature; // Remove signature from data for calculation

    // Sort keys alphabetically -> Map to values -> Join values
    const sortedKeys = Object.keys(data).sort();
    const queryStr = sortedKeys.map((key) => data[key]).join("");
    
    // HMAC SHA256 Calculation
    const calculatedSignature = crypto
      .createHmac("sha256", serverKey)
      .update(queryStr)
      .digest("hex");

    if (calculatedSignature !== requestSignature) {
      console.error("❌ PayTabs Signature Mismatch!");
      console.error("Calculated:", calculatedSignature);
      console.error("Received:", requestSignature);
      // Return 200 even on error to stop PayTabs from retrying endlessly
      return NextResponse.json({ message: "Invalid signature" }, { status: 200 });
    }

    // 3. Extract Status
    // PayTabs sends 'respStatus' ("A" = Success)
    // Or sometimes nested inside payment_result depending on integration type.
    // We check both for safety.
    const isSuccess = data.respStatus === "A" || data.payment_result?.response_status === "A";
    const orderId = data.cart_id;
    const transactionId = data.tran_ref;

    // 4. Update Database
    if (isSuccess) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (order && order.paymentStatus !== "PAID") {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",     // Matches your Schema (Uppercase)
            paymentMethod: "PAYTABS",  // Matches your Schema
            paymentId: transactionId,  // Matches your Schema (was transactionRef)
            orderStatus: "PROCESSING",
          },
        });
        console.log(`✅ Order ${orderId} PAID via PayTabs (${transactionId})`);
      }
    } else {
      console.warn(`⚠️ PayTabs Payment Failed for Order ${orderId}`);
      // Optional: Mark as failed in DB
      /*
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED" }
      });
      */
    }

    // 5. Respond OK
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ PayTabs Callback Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}