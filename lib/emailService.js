import { prisma } from '@/lib/prisma';
import { transporter } from '@/lib/mailer';

export async function triggerEmailNotification(triggerName, recipient, variables = {}) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { triggerName },
    });

    if (!template || !template.isActive) {
      // No template configured — send a basic fallback for order notifications
      if (triggerName === 'NEW_ORDER_CUSTOMER' && recipient) {
        await sendFallbackOrderEmail(recipient, variables);
      } else if (triggerName === 'NEW_ORDER_ADMIN') {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@atlantis.sa';
        await sendFallbackAdminEmail(adminEmail, variables);
      }
      return null;
    }

    let finalRecipient = recipient;
    let stateObj = {};

    if (template.editorState) {
      try {
        stateObj = typeof template.editorState === 'string'
          ? JSON.parse(template.editorState)
          : template.editorState;
      } catch (e) {
        console.error("Failed to parse editor state:", e);
      }
    }

    // Admin routing override
    if (triggerName === 'NEW_ORDER_ADMIN' && stateObj.internalRecipients?.trim()) {
      finalRecipient = stateObj.internalRecipients.trim();
    }

    // Calendly block injection for package orders
    let calendlyHtml = "";
    if (triggerName === 'NEW_ORDER_CUSTOMER' && variables.orderType === 'package' && stateObj.calendlyUrl) {
      const btnColor = stateObj.primaryColor || '#2C3654';
      calendlyHtml = `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
          <tr>
            <td align="center" style="padding: 30px;">
              <h2 style="margin: 0 0 10px 0; font-size: 18px; color: ${btnColor};">Schedule Your Design Consultation</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563;">Please select a time that works best for you to kick off your project.</p>
              <a href="${stateObj.calendlyUrl}" style="display: inline-block; background-color: ${btnColor}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">Book Meeting on Calendly</a>
            </td>
          </tr>
        </table>
      `;
    }
    variables.calendlyBlock = calendlyHtml;

    // Replace placeholders
    let personalizedHtml = template.bodyHtml;
    let personalizedSubject = template.subject;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalizedHtml = personalizedHtml.replace(regex, value || '');
      personalizedSubject = personalizedSubject.replace(regex, value || '');
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: finalRecipient,
      subject: personalizedSubject,
      html: personalizedHtml,
    });

    await prisma.emailLog.create({
      data: { recipient: finalRecipient, template: triggerName, status: 'SENT' },
    });

    return info;

  } catch (error) {
    console.error("Email sending failed:", error);
    try {
      await prisma.emailLog.create({
        data: { recipient, template: triggerName, status: 'FAILED', errorMsg: error.message },
      });
    } catch (_) {}
  }
}

async function sendFallbackOrderEmail(recipient, vars) {
  const orderId = vars.orderId || '—';
  const customerName = vars.customerName || 'Valued Customer';
  const totalAmount = vars.totalAmount || '—';
  const paymentMethod = vars.paymentMethod || 'Online Payment';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="background-color:#2D3247;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">Order Confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">
              <p>Hi ${customerName},</p>
              <p>Thank you for your order. We've received your payment and are processing your order now.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <tr style="background-color:#f9fafb;">
                  <td style="padding:12px 16px;font-weight:bold;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Order Details</td>
                </tr>
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:4px 0;"><strong>Order ID:</strong> #${orderId}</p>
                    <p style="margin:4px 0;"><strong>Amount Paid:</strong> ${totalAmount} SAR</p>
                    <p style="margin:4px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
                  </td>
                </tr>
              </table>
              <p>Our team will be in touch with you shortly. If you have any questions, feel free to reply to this email.</p>
              <p>Warm regards,<br><strong>Atlantis Design Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;">
              You are receiving this email because you placed an order with Atlantis.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipient,
    subject: `Order Confirmation – #${orderId} | Atlantis`,
    html,
  });

  await prisma.emailLog.create({
    data: { recipient, template: 'NEW_ORDER_CUSTOMER_FALLBACK', status: 'SENT' },
  });
}

async function sendFallbackAdminEmail(recipient, vars) {
  const orderId = vars.orderId || '—';
  const customerName = vars.customerName || '—';
  const customerEmail = vars.customerEmail || '—';
  const customerPhone = vars.customerPhone || '—';
  const totalAmount = vars.totalAmount || '—';
  const orderType = vars.orderType || 'shop';
  const paymentMethod = vars.paymentMethod || '—';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="background-color:#2D3247;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">New Order Received</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Type:</strong> ${orderType}</p>
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Phone:</strong> ${customerPhone}</p>
              <p><strong>Total:</strong> ${totalAmount} SAR</p>
              <p><strong>Payment:</strong> ${paymentMethod}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipient,
    subject: `New Order #${orderId} – ${customerName}`,
    html,
  });

  await prisma.emailLog.create({
    data: { recipient, template: 'NEW_ORDER_ADMIN_FALLBACK', status: 'SENT' },
  });
}
