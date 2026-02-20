"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Save, X, Plus } from "lucide-react";
import ImageUploader from "@/app/admin/_components/ImageUploader";

/* ================= HELPERS ================= */
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const emptyBlock = (type = "paragraph") => {
  if (type === "list") return { type, items: [""] };
  if (type === "image") return { type, src: "", alt: "" };
  if (type === "cta") return { type, ctaText: "", ctaLink: "" }; // Added CTA type
  return { type, text: "" };
};

const emptyLang = {
  title: "",
  excerpt: "",
  content: [],
};

export default function ProjectEditor({ mode = "create", projectId }) {
  const [active, setActive] = useState("en");
  const [slug, setSlug] = useState("");
  const [cover, setCover] = useState([]);
  const [data, setData] = useState({
    en: structuredClone(emptyLang),
    ar: structuredClone(emptyLang),
  });

  const current = data[active];

  /* ================= LOAD (EDIT MODE) ================= */
  useEffect(() => {
    if (!projectId) return;

    async function load() {
      const en = await fetch(`/api/our-portfolio/${projectId}?locale=en`).then((r) => r.json());
      const ar = await fetch(`/api/our-portfolio/${projectId}?locale=ar`).then((r) => r.json());

      setSlug(en.slug);
      setCover(Array.isArray(en.cover) ? en.cover : en.cover ? [en.cover] : []);
      setData({
        en: { title: en.title || "", excerpt: en.excerpt || "", content: en.content || [] },
        ar: { title: ar.title || "", excerpt: ar.excerpt || "", content: ar.content || [] },
      });
    }

    load();
  }, [projectId]);

  /* ================= PATCH ================= */
  const patch = (key, value) => {
    setData((prev) => ({
      ...prev,
      [active]: { ...prev[active], [key]: value },
    }));
  };

  /* ================= AUTO SLUG (EN ONLY) ================= */
  useEffect(() => {
    if (!data.en.title || mode !== "create") return;
    setSlug(slugify(data.en.title));
  }, [data.en.title, mode]);

  /* ================= SAVE ================= */
  const save = async () => {
    if (!data.en.title || !data.en.content.length || !data.ar.title || !data.ar.content.length) {
      alert("Both EN and AR must have title and content");
      return;
    }

    const payload = {
      slug,
      cover,
      published: true,
      translations: [
        { locale: "en", ...data.en },
        { locale: "ar", ...data.ar },
      ],
    };

    const res = await fetch(
      mode === "create" ? "/api/our-portfolio" : `/api/our-portfolio/${projectId}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      alert("Failed to save project");
      return;
    }

    alert("Project saved successfully (EN + AR)");
  };

  /* ================= RENDER ================= */
  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm bg-white p-6 rounded-2xl border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "create" ? "Create Project" : "Edit Project"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage your portfolio content in multiple languages</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={active === "en" ? "default" : "outline"}
            onClick={() => setActive("en")}
            className="min-w-[70px]"
          >
            English
          </Button>
          <Button
            variant={active === "ar" ? "default" : "outline"}
            onClick={() => setActive("ar")}
            className="min-w-[70px]"
          >
            Arabic
          </Button>
        </div>
      </div>

      {/* Shared Section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-500 rounded"></span>
          Common Settings
        </h2>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Project Slug</label>
            <Input value={slug} disabled className="bg-gray-50" placeholder="Generated automatically" />
          </div>

          {/* Gallery Images */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Cover Gallery Images
            </label>

            {/* Display existing gallery images */}
            {cover && cover.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
                {cover.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      className="w-full h-28 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                      alt={`Gallery ${i + 1}`}
                    />
                    <button
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      onClick={() => setCover(cover.filter((_, idx) => idx !== i))}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new gallery image */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition">
              <ImageUploader
                label="Add Cover Image"
                value=""
                onChange={(url) => {
                  const newImages = [...(cover || []), url];
                  setCover(newImages);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Language Meta */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-green-500 rounded"></span>
          {active === "en" ? "English Content" : "Arabic Content"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
            <Input
              placeholder="Enter project title"
              value={current.title}
              onChange={(e) => patch("title", e.target.value)}
              className="text-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Excerpt</label>
            <Textarea
              placeholder="Brief project description"
              value={current.excerpt}
              onChange={(e) => patch("excerpt", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Content Blocks */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="font-semibold text-xl mb-4 text-gray-800 flex items-center gap-2">
          <span className="w-1 h-6 bg-purple-500 rounded"></span>
          Content Blocks
        </h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {["paragraph", "heading", "list", "image", "cta"].map((t) => (
            <Button
              key={t}
              size="sm"
              variant="outline"
              onClick={() => patch("content", [...current.content, emptyBlock(t)])}
              className="capitalize"
            >
              <Plus size={14} className="mr-1" /> {t}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {current.content.map((block, i) => (
            <div key={i} className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:border-gray-300 transition">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {block.type}
                </span>
                <button
                  onClick={() => {
                    const cp = [...current.content];
                    cp.splice(i, 1);
                    patch("content", cp);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {block.type === "paragraph" && (
                <Textarea
                  value={block.text}
                  placeholder="Enter paragraph text..."
                  onChange={(e) => {
                    const cp = [...current.content];
                    cp[i].text = e.target.value;
                    patch("content", cp);
                  }}
                  rows={4}
                />
              )}

              {block.type === "heading" && (
                <Input
                  value={block.text}
                  placeholder="Enter heading..."
                  onChange={(e) => {
                    const cp = [...current.content];
                    cp[i].text = e.target.value;
                    patch("content", cp);
                  }}
                  className="font-semibold text-lg"
                />
              )}

              {block.type === "list" &&
                block.items.map((item, idx) => (
                  <Input
                    key={idx}
                    className="mb-2"
                    value={item}
                    placeholder={`List item ${idx + 1}`}
                    onChange={(e) => {
                      const cp = [...current.content];
                      cp[i].items[idx] = e.target.value;
                      patch("content", cp);
                    }}
                  />
                ))}

              {block.type === "image" && (
                <ImageUploader
                  value={block.src}
                  onChange={(url) => {
                    const cp = [...current.content];
                    cp[i].src = url;
                    patch("content", cp);
                  }}
                />
              )}

              {/* CTA Block Added Here */}
              {block.type === "cta" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Button Label</label>
                    <Input
                      value={block.ctaText}
                      placeholder="e.g. View Project"
                      onChange={(e) => {
                        const cp = [...current.content];
                        cp[i].ctaText = e.target.value;
                        patch("content", cp);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">URL Link</label>
                    <Input
                      value={block.ctaLink}
                      placeholder="https://..."
                      onChange={(e) => {
                        const cp = [...current.content];
                        cp[i].ctaLink = e.target.value;
                        patch("content", cp);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {current.content.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No content blocks yet. Add some using the buttons above.</p>
            </div>
          )}
        </div>
      </section>

      <Button onClick={save} size="lg" className="w-full flex items-center justify-center gap-2 text-lg py-6">
        <Save size={18} /> Publish Project (EN + AR)
      </Button>
    </main>
  );
}