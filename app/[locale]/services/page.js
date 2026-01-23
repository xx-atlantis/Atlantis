"use client";
import React from "react";
import Image from "next/image";
import { useLocale } from "@/app/components/LocaleProvider";
import { ArrowRight } from "lucide-react";
import { usePageContent } from "@/app/context/PageContentProvider";
import Link from "next/link";

export default function Services() {
  const { locale } = useLocale();
  const { data } = usePageContent();
  const isRTL = locale === "ar";

  const servicesData = data?.services;
  const services = servicesData?.items || [];
  const solutions = data?.solutions;

  if (!servicesData || !solutions) return null; // prevents crash on first load

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="py-14 sm:py-20 px-4 sm:px-8 md:px-16 bg-white flex flex-col justify-center"
    >
      {/* ===== Section Header ===== */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3 max-w-sm mx-auto">
          {servicesData.mainTitle}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          {servicesData.description}
        </p>
      </div>

      {/* ===== Services Grid ===== */}
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full mx-auto">
        {services.map((srv, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col"
          >
            <div className="relative w-full h-48 sm:h-52 md:h-56">
              <Image
                src={srv.image}
                alt={srv.title}
                fill
                className="object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex flex-col flex-1 p-4 sm:p-5">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-800 transition">
                {srv.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {srv.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Contact Button ===== */}
      <div className="text-center mt-10 sm:mt-12">
        <Link href={`/${locale}/contact-us`} className="bg-primary-btn text-white px-6 py-2.5 rounded-lg hover:bg-blue-900 transition text-sm sm:text-base font-medium">
          {servicesData.button}
        </Link>
      </div>

      {/* ===== Solutions Section ===== */}
      <div className="mt-20 text-center">
        <p className="text-xs sm:text-sm text-primary-theme uppercase tracking-wide font-medium mb-2">
          {solutions.smallTitle}
        </p>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          {solutions.mainTitle}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {solutions.items.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="mb-4 text-blue-800">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={50}
                    height={50}
                    className="opacity-90"
                  />
                </div>
                <h4 className="text-base font-semibold text-primary-theme mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <button className="bg-primary-btn text-white px-6 py-2.5 rounded-lg flex items-center gap-2 mx-auto hover:bg-blue-900 transition text-sm sm:text-base font-medium">
            {solutions.button}
          </button>
        </div>
      </div>
    </section>
  );
}
