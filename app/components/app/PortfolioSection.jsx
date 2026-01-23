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
            href="#"
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

      {/* ===== Materials Section ===== */}
      <div className="flex flex-col items-center">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          {data.materialsTitle}
        </p>
        <h3 className="text-2xl font-semibold mb-10 text-center">
          {data.composition}{" "}
          <span className="text-[#2D2E4E] font-bold">{data.elements}</span>
        </h3>

        {/* ===== PERFECT CENTERED 4 + 3 GRID ===== */}
        <div className="grid grid-cols-12 gap-6 mx-auto w-full">
          {data.materials.map((item, idx) => {
            let position = "";

            // 4-item top row arrangement
            if (idx === 0) position = "col-start-1 col-span-2";
            if (idx === 1) position = "col-start-4 col-span-2";
            if (idx === 2) position = "col-start-7 col-span-2";
            if (idx === 3) position = "col-start-10 col-span-2";

            // 3-item centered second row
            if (idx === 4) position = "col-start-2 col-span-2";
            if (idx === 5) position = "col-start-5 col-span-2";
            if (idx === 6) position = "col-start-8 col-span-2";

            return (
              <div
                key={idx}
                className={`relative w-28 md:w-48 h-60 overflow-hidden rounded-xl shadow-md hover:scale-[1.03] transition ${position}`}
              >
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover"  
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  <span className="text-white font-medium text-sm">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
