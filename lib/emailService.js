import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function triggerEmailNotification(triggerName, recipient, variables = {}) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { triggerName },
    });

    if (!template || !template.isActive) return null;

    let finalRecipient = recipient;
    let stateObj = {};

    // Safely parse the editor settings
    if (template.editorState) {
      try {
        stateObj = typeof template.editorState === 'string' 
          ? JSON.parse(template.editorState) 
          : template.editorState;
      } catch (e) {
        console.error("Failed to parse editor state:", e);
      }
    }
    
    // 1. Admin Routing Override
    if (triggerName === 'NEW_ORDER_ADMIN' && stateObj.internalRecipients?.trim()) {
      finalRecipient = stateObj.internalRecipients.trim();
    }

    // 🔥 2. CONDITIONAL CALENDLY INJECTION 🔥
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
    
    // Add it to our variables list so the replacer catches it
    variables.calendlyBlock = calendlyHtml;

    // 3. Replace placeholders with actual data
    let personalizedHtml = template.bodyHtml;
    let personalizedSubject = template.subject;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalizedHtml = personalizedHtml.replace(regex, value || '');
      personalizedSubject = personalizedSubject.replace(regex, value || '');
    }

    // 4. Send the email
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
    await prisma.emailLog.create({
      data: { recipient: recipient, template: triggerName, status: 'FAILED', errorMsg: error.message },
    });
    console.error("Email sending failed:", error);
  }
}