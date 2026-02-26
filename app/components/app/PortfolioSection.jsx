"use client";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/app/components/LocaleProvider";

export default function PortfolioSection({ data }) {
  const { locale } = useLocale();
  const isRTL = locale === "ar";

  if (!data) return null;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="w-full mt-4 ">
      {/* ===== Intro Section ===== */}
      <div className="grid md:grid-cols-2 items-center gap-10 mb-20">
        <div className="flex flex-col justify-center items-center md:items-start">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-800  ">
            {data.title}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {data.description}
          </p>
          <Link
            href=""
            className="px-6 py-3 rounded-md bg-[#2D2E4E] text-white font-medium text-sm hover:bg-[#242545] transition "
          >
            {data.button}
          </Link>
        </div>

        <div className="flex justify-center">
          <div className="rounded-xl overflow-hidden shadow-md">
            <Image
              src={data.heroImg}
              alt={data.title}
              width={500}
              height={400}
              className="rounded-xl object-cover"
            />
          </div>
        </div>
      </div>


    </div>
  );
}
