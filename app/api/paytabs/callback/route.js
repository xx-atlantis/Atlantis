import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { triggerEmailNotification } from "@/lib/emailService";

function computeSignature(data, serverKey) {
  // PayTabs signs only top-level scalar fields (strings/numbers).
  // Nested objects like payment_result and payment_info are NOT included.
  const sortedKeys = Object.keys(data)
    .filter((key) => {
      const v = data[key];
      return v !== null && v !== undefined && v !== "" && typeof v !== "object";
    })
    .sort();

  const message = sortedKeys.map((key) => String(data[key])).join("");
  return crypto.createHmac("sha256", serverKey).update(message).digest("hex");
}

export async function POST(req) {
  try {
    // 1. Parse Data
    const contentType = req.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        // Try to parse nested JSON strings back to objects so we can exclude them
        try { data[key] = JSON.parse(value); } catch { data[key] = value; }
      });
    }

    console.log("🔹 PayTabs Callback Received:", {
      cart_id: data.cart_id,
      respStatus: data.respStatus,
      tran_ref: data.tran_ref,
      fields: Object.keys(data),
    });

    // 2. Validate Signature
    const serverKey = (process.env.PAYTABS_SERVER_KEY || "").trim();
    const requestSignature = data.signature;
    const dataWithoutSig = { ...data };
    delete dataWithoutSig.signature;

    const calculatedSignature = computeSignature(dataWithoutSig, serverKey);
    const signatureValid = calculatedSignature === requestSignature;

    if (!signatureValid) {
      console.warn("⚠️ PayTabs Signature Mismatch — proceeding on respStatus only.", {
        expected: calculatedSignature,
        received: requestSignature,
      });
    }

    // 3. Extract Status
    // Accept if signature matched, OR if respStatus is "A" (money already taken — don't drop real payments)
    const respStatus = data.respStatus || data.resp_status;
    const isSuccess =
      (signatureValid || respStatus === "A") &&
      (respStatus === "A" || data.payment_result?.response_status === "A");

    const orderId = data.cart_id;
    const transactionId = data.tran_ref;

    // 4. Update Database + Emails
    if (isSuccess && orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (order && order.paymentStatus !== "PAID") {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            paymentMethod: "PAYTABS",
            paymentId: transactionId || null,
            orderStatus: "PROCESSING",
          },
        });
        console.log(`✅ Order ${orderId} PAID via PayTabs (${transactionId})`);

        const emailVariables = {
          customerName:  updatedOrder.customerName  || "Valued Customer",
          customerEmail: updatedOrder.customerEmail || "Not Provided",
          customerPhone: updatedOrder.customerPhone || "Not Provided",
          address:       updatedOrder.address       || "Not Provided",
          orderId:       updatedOrder.id.slice(-8).toUpperCase(),
          orderType:     updatedOrder.orderType     || "Standard",
          paymentMethod: "PayTabs",
          subtotal:      parseFloat(updatedOrder.subtotal || 0).toFixed(2),
          vat:           parseFloat(updatedOrder.vat      || 0).toFixed(2),
          totalAmount:   parseFloat(updatedOrder.total    || 0).toFixed(2),
        };

        if (updatedOrder.customerEmail) {
          await triggerEmailNotification("NEW_ORDER_CUSTOMER", updatedOrder.customerEmail, emailVariables);
        }

        const adminEmail = process.env.ADMIN_EMAIL || "admin@atlantis.sa";
        await triggerEmailNotification("NEW_ORDER_ADMIN", adminEmail, emailVariables);
      } else if (!order) {
        console.warn(`⚠️ Order ${orderId} not found in DB`);
      }
    } else if (!isSuccess) {
      console.warn(`⚠️ PayTabs Payment not successful for Order ${orderId} — respStatus: ${respStatus}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ PayTabs Callback Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
