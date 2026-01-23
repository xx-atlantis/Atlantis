"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function LanguageSwitcher({ locale }) {
  const pathname = usePathname();
  const other = locale === "ar" ? "en" : "ar";
  const newPath = pathname.replace(/^\/(en|ar)/, `/${other}`);

  return (
    <div className="absolute top-4 right-4">
      <Link
        href={newPath}
        className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-medium"
      >
        {locale === "ar" ? "English" : "العربية"}
      </Link>
    </div>
  );
}
