"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";

export default function PortfolioDetails() {
  const { locale } = useLocale();
  const { id } = useParams(); // project ID or slug
  const isRTL = locale === "ar";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 Fetch single portfolio project
  useEffect(() => {
    if (!id) return;

    async function fetchProject() {
      try {
        const res = await fetch(`/api/our-portfolio/${id}?locale=${locale}`);

        if (!res.ok) {
          throw new Error("Failed to fetch project");
        }

        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id, locale]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        {isRTL ? "جارٍ التحميل..." : "Loading project..."}
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-20 text-center text-red-600">
        {isRTL ? "تعذر تحميل المشروع" : "Failed to load project"}
      </div>
    );
  }

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full py-12 sm:py-16 px-4 sm:px-8 md:px-16 bg-white flex justify-center"
    >
      <article className="max-w-3xl w-full">
        {/* ===== Header ===== */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {project.title}
          </h1>

          {project.publishedAt && (
            <p className="text-gray-500 text-sm">
              {new Date(project.publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* ===== Featured Image ===== */}
        {project.cover && (
          <div className="relative w-full h-72 sm:h-80 md:h-[400px] mb-10 rounded-xl overflow-hidden shadow-sm">
            <Image
              src={project.cover}
              alt={project.title}
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
        )}

        {/* ===== Body Content ===== */}
        <div className="prose prose-gray max-w-none leading-relaxed text-gray-800 text-sm sm:text-base">
          {project.content?.map((block, index) => {
            switch (block.type) {
              case "paragraph":
                return <p key={index}>{block.text}</p>;

              case "heading":
                return (
                  <h2
                    key={index}
                    className="text-xl sm:text-2xl font-semibold mt-8 mb-4"
                  >
                    {block.text}
                  </h2>
                );

              case "list":
                return (
                  <ul key={index} className="list-disc list-inside space-y-2">
                    {block.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                );

              case "image":
                return (
                  <div
                    key={index}
                    className="relative w-full h-72 sm:h-80 md:h-[400px] my-8 rounded-xl overflow-hidden shadow-sm"
                  >
                    <Image
                      src={block.src}
                      alt={block.alt || project.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </article>
    </section>
  );
}
