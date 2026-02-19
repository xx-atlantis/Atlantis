// app/actions/emailTemplates.js
"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getEmailTemplates() {
  return await prisma.emailTemplate.findMany({ orderBy: { triggerName: "asc" } });
}

// NEW: Fetch Stats
export async function getEmailStats() {
  const total = await prisma.emailLog.count();
  const sent = await prisma.emailLog.count({ where: { status: 'SENT' } });
  const failed = await prisma.emailLog.count({ where: { status: 'FAILED' } });
  return { total, sent, failed };
}

export async function updateEmailTemplate(data) {
  try {
    await prisma.emailTemplate.upsert({
      where: { triggerName: data.triggerName },
      update: { 
        subject: data.subject, 
        bodyHtml: data.bodyHtml, 
        editorState: data.editorState,
        isActive: data.isActive 
      },
      create: {
        triggerName: data.triggerName,
        subject: data.subject,
        bodyHtml: data.bodyHtml,
        editorState: data.editorState,
        isActive: data.isActive,
      }
    });

    revalidatePath("/admin/emails");
    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, error: "Failed to save" };
  }
}