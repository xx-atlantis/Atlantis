"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/app/components/LocaleProvider";
import { usePageContent } from "@/app/context/PageContentProvider";
import Image from "next/image";
import Link from "next/link";

export default function BlogSection() {
  const { locale } = useLocale();
  const { data } = usePageContent();

  const isRTL = locale === "ar";

  const section = data?.blog?.section;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch blogs from API
  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch(`/api/blog?locale=${locale}`);
        const json = await res.json();
        setPosts(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, [locale]);

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full py-12 sm:py-16 px-4 sm:px-8 md:px-16 flex flex-col items-center bg-white"
    >
      {/* ===== Section Header (CMS) ===== */}
      <div className="text-center mb-10 max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-[#5E7E7D] uppercase mb-2 tracking-wide">
          {section?.tag || (isRTL ? "مدونة" : "Blog")}
        </p>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-snug">
          {section?.title || (isRTL ? "آخر المقالات" : "Recent Stories")}
        </h2>
      </div>

      {/* ===== Loading ===== */}
      {loading && (
        <p className="text-gray-500 py-10">
          {isRTL ? "جارٍ التحميل..." : "Loading blogs..."}
        </p>
      )}

      {/* ===== Blog Grid ===== */}
      {!loading && (
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${locale}/blog/${post.id}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col"
            >
              {/* Blog Image */}
              <div className="relative w-full h-48 sm:h-52 md:h-56">
                <Image
                  src={post.cover || "/blog-img.png"}
                  alt={post.title}
                  fill
                  className="object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Blog Content */}
              <div className="flex flex-col flex-1 p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 line-clamp-3 group-hover:text-[#5E7E7D] transition-colors">
                  {post.title}
                </h3>

                <span className="text-xs sm:text-sm text-gray-500 mt-auto">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
