// lib/emailService.js
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
      to: recipient,
      subject: personalizedSubject,
      html: personalizedHtml,
    });

    // 4. Log the success
    await prisma.emailLog.create({
      data: { recipient, template: triggerName, status: 'SENT' },
    });

    return info;

  } catch (error) {
    // Log the failure
    await prisma.emailLog.create({
      data: { recipient, template: triggerName, status: 'FAILED', errorMsg: error.message },
    });
    console.error("Email sending failed:", error);
  }
}