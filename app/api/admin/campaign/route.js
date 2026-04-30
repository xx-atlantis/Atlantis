import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer";
import { randomUUID } from "crypto";

function buildHtml({ subject, body, promoCode, ctaText, ctaUrl, primaryColor = "#2D3247", trackingUrl }) {
  const promoBlock = promoCode
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <div style="display:inline-block;background:#f9fafb;border:2px dashed ${primaryColor};border-radius:8px;padding:16px 32px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Promo Code</p>
              <p style="margin:0;font-size:24px;font-weight:bold;color:${primaryColor};letter-spacing:4px;">${promoCode}</p>
            </div>
          </td>
        </tr>
      </table>`
    : "";

  const ctaBlock = ctaText && ctaUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <a href="${ctaUrl}" style="display:inline-block;background-color:${primaryColor};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:16px;">${ctaText}</a>
          </td>
        </tr>
      </table>`
    : "";

  const pixelTag = trackingUrl
    ? `<img src="${trackingUrl}" width="1" height="1" style="display:none;border:0;" alt="" />`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="background-color:${primaryColor};padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">${subject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">
              ${body.replace(/\n/g, "<br>")}
              ${promoBlock}
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;">
              You are receiving this email because you signed up with Atlantis.
              ${pixelTag}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* GET — customer count OR campaign email logs */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get("logs") === "1") {
      const page   = Math.max(1, parseInt(searchParams.get("page")   || "1"));
      const limit  = Math.min(200, parseInt(searchParams.get("limit") || "100"));
      const skip   = (page - 1) * limit;
      const status = searchParams.get("status"); // SENT | FAILED | OPENED | null

      let where = { template: "CAMPAIGN" };
      if (status === "SENT")   where = { ...where, status: "SENT", openedAt: null };
      if (status === "FAILED") where = { ...where, status: "FAILED" };
      if (status === "OPENED") where = { ...where, status: "SENT", openedAt: { not: null } };

      const [logs, total, sentCount, failedCount, openedCount] = await Promise.all([
        prisma.emailLog.findMany({ where, orderBy: { sentAt: "desc" }, skip, take: limit }),
        prisma.emailLog.count({ where }),
        prisma.emailLog.count({ where: { template: "CAMPAIGN", status: "SENT" } }),
        prisma.emailLog.count({ where: { template: "CAMPAIGN", status: "FAILED" } }),
        prisma.emailLog.count({ where: { template: "CAMPAIGN", status: "SENT", openedAt: { not: null } } }),
      ]);

      return NextResponse.json({ success: true, logs, total, sentCount, failedCount, openedCount, page, limit });
    }

    const count = await prisma.customer.count();
    return NextResponse.json({ success: true, customerCount: count });
  } catch (err) {
    console.error("Campaign GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/* POST — stream sending progress via Server-Sent Events */
export async function POST(req) {
  const encoder = new TextEncoder();
  const push = (controller, data) =>
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

  const body = await req.json();
  const {
    subject, bodyText, recipientMode, customEmails,
    promoCode, ctaText, ctaUrl, primaryColor,
    batchSize    = 20,
    batchDelayMs = 3000,
  } = body;

  if (!subject?.trim() || !bodyText?.trim()) {
    return NextResponse.json({ success: false, error: "Subject and body are required" }, { status: 400 });
  }

  // Derive base URL for tracking pixel
  const host     = req.headers.get("host") || "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const baseUrl  = `${protocol}://${host}`;

  let emails = [];
  try {
    if (recipientMode === "all") {
      const customers = await prisma.customer.findMany({ select: { email: true } });
      emails = customers.map((c) => c.email).filter(Boolean);
    } else {
      emails = (customEmails || "")
        .split(/[\n,;]+/)
        .map((e) => e.trim())
        .filter((e) => e.includes("@"));
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }

  if (emails.length === 0) {
    return NextResponse.json({ success: false, error: "No valid recipients found" }, { status: 400 });
  }

  const safeBatch = Math.max(1, Math.min(50, batchSize));
  const safeDelay = Math.max(1000, Math.min(30000, batchDelayMs));

  const stream = new ReadableStream({
    async start(controller) {
      push(controller, { type: "start", total: emails.length });

      let sent = 0;
      let failed = 0;
      const errors = [];

      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        const logId = randomUUID();
        const trackingUrl = `${baseUrl}/api/admin/campaign/track?id=${logId}`;
        const html = buildHtml({ subject, body: bodyText, promoCode, ctaText, ctaUrl, primaryColor, trackingUrl });

        try {
          await transporter.sendMail({ from: process.env.SMTP_FROM, to: email, subject, html });
          await prisma.emailLog.create({
            data: { id: logId, recipient: email, template: "CAMPAIGN", status: "SENT" },
          });
          sent++;
          push(controller, { type: "progress", index: i, email, status: "SENT", sent, failed, remaining: emails.length - i - 1 });
        } catch (err) {
          await prisma.emailLog.create({
            data: { id: logId, recipient: email, template: "CAMPAIGN", status: "FAILED", errorMsg: err.message },
          });
          failed++;
          errors.push({ email, error: err.message });
          push(controller, { type: "progress", index: i, email, status: "FAILED", sent, failed, remaining: emails.length - i - 1 });
        }

        const endOfBatch = (i + 1) % safeBatch === 0 && i + 1 < emails.length;
        if (endOfBatch) {
          push(controller, { type: "pause", delayMs: safeDelay });
          await new Promise((r) => setTimeout(r, safeDelay));
          push(controller, { type: "resume" });
        }
      }

      push(controller, { type: "done", sent, failed, total: emails.length, errors });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
