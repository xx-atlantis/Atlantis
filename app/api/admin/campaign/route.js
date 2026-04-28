import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === "465",
    auth: {
      type: "LOGIN",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function buildHtml({ subject, body, promoCode, ctaText, ctaUrl, primaryColor = "#2D3247" }) {
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
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* GET — return total customer count */
export async function GET() {
  try {
    const count = await prisma.customer.count();
    return NextResponse.json({ success: true, customerCount: count });
  } catch (err) {
    console.error("Campaign GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/* POST — send campaign emails */
export async function POST(req) {
  try {
    const body = await req.json();
    const { subject, bodyText, recipientMode, customEmails, promoCode, ctaText, ctaUrl, primaryColor } = body;

    if (!subject?.trim() || !bodyText?.trim()) {
      return NextResponse.json(
        { success: false, error: "Subject and body are required" },
        { status: 400 }
      );
    }

    let emails = [];

    if (recipientMode === "all") {
      const customers = await prisma.customer.findMany({ select: { email: true } });
      emails = customers.map((c) => c.email).filter(Boolean);
    } else {
      emails = (customEmails || "")
        .split(/[\n,;]+/)
        .map((e) => e.trim())
        .filter((e) => e.includes("@"));
    }

    if (emails.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid recipients found" },
        { status: 400 }
      );
    }

    const html = buildHtml({ subject, body: bodyText, promoCode, ctaText, ctaUrl, primaryColor });
    const transporter = makeTransporter();

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const email of emails) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject,
          html,
        });
        await prisma.emailLog.create({
          data: { recipient: email, template: "CAMPAIGN", status: "SENT" },
        });
        sent++;
      } catch (err) {
        await prisma.emailLog.create({
          data: { recipient: email, template: "CAMPAIGN", status: "FAILED", errorMsg: err.message },
        });
        failed++;
        errors.push(`${email}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, sent, failed, total: emails.length, errors });
  } catch (err) {
    console.error("Campaign POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
