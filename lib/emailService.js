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
    // 1. Fetch the active template from the database
    const template = await prisma.emailTemplate.findUnique({
      where: { triggerName },
    });

    if (!template || !template.isActive) return null;

    // 🔥 FOOLPROOF ADMIN ROUTING OVERRIDE 🔥
    let finalRecipient = recipient; // Starts as the fallback passed from the API route
    
    if (triggerName === 'NEW_ORDER_ADMIN' && template.editorState) {
      try {
        // Handle MongoDB/Prisma JSON quirks (sometimes it's a string, sometimes an object)
        const stateObj = typeof template.editorState === 'string' 
          ? JSON.parse(template.editorState) 
          : template.editorState;
        
        // If an email exists in the settings tab, use it instead!
        if (stateObj.internalRecipients && stateObj.internalRecipients.trim() !== '') {
          finalRecipient = stateObj.internalRecipients.trim();
          console.log(`[Email Service] Routing Admin notification to custom emails: ${finalRecipient}`);
        }
      } catch (parseError) {
        console.error("Failed to parse custom admin email settings:", parseError);
      }
    }

    // 2. Replace placeholders (e.g., {{orderId}}) with actual data
    let personalizedHtml = template.bodyHtml;
    let personalizedSubject = template.subject;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalizedHtml = personalizedHtml.replace(regex, value);
      personalizedSubject = personalizedSubject.replace(regex, value);
    }

    // 3. Send the email via Poste.io
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: finalRecipient, // Uses the freshly overridden recipient
      subject: personalizedSubject,
      html: personalizedHtml,
    });

    // 4. Log the success
    await prisma.emailLog.create({
      data: { recipient: finalRecipient, template: triggerName, status: 'SENT' },
    });

    return info;

  } catch (error) {
    // Log the failure
    await prisma.emailLog.create({
      // Fallback to the requested recipient if it failed before finalRecipient was set
      data: { recipient: recipient, template: triggerName, status: 'FAILED', errorMsg: error.message },
    });
    console.error("Email sending failed:", error);
  }
}