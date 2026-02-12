"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import LoadingScreen from "@/app/components/Loading";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogDetails() {
  const { locale } = useLocale();
  const { id } = useParams();

  const isRTL = locale === "ar";

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blog/${id}?locale=${locale}`);

        if (!res.ok) {
          throw new Error("Failed to fetch blog");
        }

        const data = await res.json();
        setBlog(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [id, locale]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <LoadingScreen />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="py-20 text-center text-red-600">
        {isRTL ? "تعذر تحميل المقال" : "Failed to load blog"}
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
            {blog.title}
          </h1>

          {blog.publishedAt && (
            <p className="text-gray-500 text-sm">
              {new Date(blog.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* ===== Featured Image ===== */}
        {blog.cover && (
          <div className="relative w-full h-72 sm:h-80 md:h-[400px] mb-10 rounded-xl overflow-hidden shadow-sm">
            <Image
              src={blog.cover}
              alt={blog.title}
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
        )}

        {/* ===== Body Content ===== */}
        <div className="prose prose-gray max-w-none leading-relaxed text-gray-800 text-sm sm:text-base">
          {blog.content.map((block, index) => {
            switch (block.type) {
              case "paragraph":
                return (
                  <div key={index} className="markdown-container mb-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {block.text}
                    </ReactMarkdown>
                  </div>
                );

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
                  <ul key={index} className="list-disc list-inside space-y-2 mb-6">
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
                      alt={block.alt || blog.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                );

              case "cta":
                return (
                  <div key={index} className="flex justify-center my-12">
                    <Link
                      href={block.ctaLink || "#"}
                      target="_blank"
                      className="bg-[#2D3247] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#495170] transition-all hover:scale-105 shadow-lg"
                    >
                      {block.ctaText}
                    </Link>
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </article>

      {/* Basic Table Styling to fix the pipe characters */}
      <style jsx global>{`
        .markdown-container table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 0.9rem;
        }
        .markdown-container th, .markdown-container td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: ${isRTL ? 'right' : 'left'};
        }
        .markdown-container th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .markdown-container tr:nth-child(even) {
          background-color: #fcfcfc;
        }
        .markdown-container h3 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
      `}</style>
    </section>
  );
}