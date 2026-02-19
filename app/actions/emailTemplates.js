// app/actions/emailTemplates.js
"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Fetch all templates to display in the admin list
export async function getEmailTemplates() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { triggerName: "asc" },
    });
    return templates;
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
}

// Update a specific template when the admin submits the form
export async function updateEmailTemplate(formData) {
  try {
    const id = formData.get("id");
    const subject = formData.get("subject");
    const bodyHtml = formData.get("bodyHtml");
    const isActive = formData.get("isActive") === "true";

    await prisma.emailTemplate.upsert({
      where: { id: id || "" },
      update: { subject, bodyHtml, isActive },
      create: {
        triggerName: formData.get("triggerName"),
        subject,
        bodyHtml,
        isActive,
      }
    });

    // Refresh the admin page data instantly
    revalidatePath("/admin/emails");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating template:", error);
    return { success: false, error: "Failed to update template" };
  }
}