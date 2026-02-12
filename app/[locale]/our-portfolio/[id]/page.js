"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "@/app/components/LocaleProvider";
import { ChevronLeft, ChevronRight, X, ZoomIn, Calendar, ArrowRight } from "lucide-react";

export default function PortfolioDetails() {
  const { locale } = useLocale();
  const { id } = useParams();
  const isRTL = locale === "ar";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProject() {
      try {
        const res = await fetch(`/api/our-portfolio/${id}?locale=${locale}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id, locale]);

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % project.cover.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + project.cover.length) % project.cover.length);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{isRTL ? "جارٍ التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-xl text-red-600">{isRTL ? "تعذر تحميل المشروع" : "Failed to load project"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section dir={isRTL ? "rtl" : "ltr"} className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header Section */}
          <header className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calendar size={16} />
              {project.publishedAt && new Date(project.publishedAt).toLocaleDateString(locale, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              {project.title}
            </h1>
            
            {project.excerpt && (
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {project.excerpt}
              </p>
            )}
          </header>

          {/* Gallery Section */}
          {project.cover && project.cover.length > 0 && (
            <section className="mb-16 space-y-4">
              <div className="relative group aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">
                <div className="absolute inset-0 opacity-30 blur-3xl transition-opacity duration-700">
                  <Image src={project.cover[selectedImage]} alt="blur-bg" fill className="object-cover" />
                </div>

                <Image
                  src={project.cover[selectedImage]}
                  alt={`${project.title} preview`}
                  fill
                  className="object-contain transition-all duration-500 ease-in-out scale-[0.98] group-hover:scale-100"
                  priority
                />

                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={prevImage}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-2xl transition-all hover:scale-110 active:scale-95 border border-white/20"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-2xl transition-all hover:scale-110 active:scale-95 border border-white/20"
                  >
                    <ChevronRight size={28} />
                  </button>
                </div>

                <div className="absolute top-6 right-6 flex gap-2">
                  <button
                    onClick={() => setLightbox(true)}
                    className="bg-white/10 backdrop-blur-xl hover:bg-white text-white hover:text-black p-3 rounded-xl transition-all shadow-xl border border-white/10"
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>

                <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-medium tracking-widest border border-white/10">
                  {selectedImage + 1} / {project.cover.length}
                </div>
              </div>

              {project.cover.length > 1 && (
                <div className="flex justify-center">
                  <div className="inline-flex gap-3 p-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-x-auto max-w-full no-scrollbar">
                    {project.cover.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                          selectedImage === i
                            ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                            : "opacity-60 hover:opacity-100 hover:scale-105"
                        }`}
                      >
                        <Image src={img} alt={`Slide ${i}`} fill className="object-cover" />
                        {selectedImage !== i && <div className="absolute inset-0 bg-slate-900/10" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Content Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 sm:p-12 space-y-8">
              {project.content?.map((block, index) => {
                switch (block.type) {
                  case "paragraph":
                    return (
                      <p key={index} className="text-lg leading-relaxed text-gray-700">
                        {block.text}
                      </p>
                    );

                  case "heading":
                    return (
                      <h2 key={index} className="text-3xl font-bold text-gray-900 mt-12 mb-6 pb-3 border-b-2 border-[#2d324733]">
                        {block.text}
                      </h2>
                    );

                  case "list":
                    return (
                      <ul key={index} className="space-y-3">
                        {block.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700">
                            <span className="flex-shrink-0 w-6 h-6 bg-[#2D3247] text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-lg">{item}</span>
                          </li>
                        ))}
                      </ul>
                    );

                  case "image":
                    return (
                      <div key={index} className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg my-10">
                        <Image src={block.src} alt={block.alt || project.title} fill className="object-cover" />
                      </div>
                    );

                  case "cta":
                    return (
                      <div key={index} className="my-10">
                        <Link
                          href={block.ctaLink || "#"}
                          target="_blank"
                          className="inline-flex items-center gap-2 bg-[#2D3247] text-white rounded-lg font-bold text-lg hover:bg-[#495170]  px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          {block.ctaText || "Learn More"}
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </div>
          </div>

        </article>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <X size={32} />
          </button>

          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 text-white hover:text-gray-300">
            <ChevronLeft size={48} />
          </button>

          <div className="relative w-full max-w-6xl h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={project.cover[selectedImage]} alt={project.title} fill className="object-contain" />
          </div>

          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 text-white hover:text-gray-300">
            <ChevronRight size={48} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {selectedImage + 1} / {project.cover.length}
          </div>
        </div>
      )}
    </>
  );
}