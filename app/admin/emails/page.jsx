// app/admin/emails/page.jsx
import { getEmailTemplates, getEmailStats } from "@/app/actions/emailTemplates";
import EmailEditor from "./EmailEditor";

export default async function EmailManagerPage() {
  const templates = await getEmailTemplates();
  const stats = await getEmailStats();

  return <EmailEditor templates={templates} stats={stats} />;
}