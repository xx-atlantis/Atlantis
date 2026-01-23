import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const h = await headers(); // ✅ must await it
  const langHeader = h.get("accept-language") || "";

  const prefersArabic = langHeader.toLowerCase().startsWith("ar");
  redirect(prefersArabic ? "/ar" : "/en");
}
