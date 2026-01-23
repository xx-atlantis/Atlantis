"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Save } from "lucide-react";
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
  return { type, text: "" };
};

const emptyLang = {
  title: "",
  publishedAt: "",
  metaTitle: "",
  metaDescription: "",
  content: [],
};

export default function BlogEditor({ mode = "create", blogId }) {
  const [active, setActive] = useState("en");

  const [slug, setSlug] = useState("");
  const [cover, setCover] = useState("");

  const [data, setData] = useState({
    en: structuredClone(emptyLang),
    ar: structuredClone(emptyLang),
  });

  const current = data[active];

  /* ================= LOAD (EDIT MODE) ================= */
  useEffect(() => {
    if (!blogId) return;

    async function load() {
      const en = await fetch(`/api/blog/${blogId}?locale=en`).then((r) =>
        r.json()
      );
      const ar = await fetch(`/api/blog/${blogId}?locale=ar`).then((r) =>
        r.json()
      );

      setSlug(en.slug);
      setCover(en.cover);

      setData({
        en: {
          title: en.title || "",
          publishedAt: en.publishedAt?.slice(0, 10) || "",
          metaTitle: en.metaTitle || "",
          metaDescription: en.metaDescription || "",
          content: en.content || [],
        },
        ar: {
          title: ar.title || "",
          publishedAt: ar.publishedAt?.slice(0, 10) || "",
          metaTitle: ar.metaTitle || "",
          metaDescription: ar.metaDescription || "",
          content: ar.content || [],
        },
      });
    }

    load();
  }, [blogId]);

  /* ================= PATCH ================= */
  const patch = (key, value) => {
    setData((prev) => ({
      ...prev,
      [active]: { ...prev[active], [key]: value },
    }));
  };

  /* ================= AUTO SLUG (EN ONLY) ================= */
  useEffect(() => {
    if (!data.en.title) return;
    setSlug(slugify(data.en.title));
  }, [data.en.title]);

  /* ================= SAVE (BOTH LANGUAGES) ================= */
  const save = async () => {
    // Validation
    if (
      !data.en.title ||
      !data.en.content.length ||
      !data.ar.title ||
      !data.ar.content.length
    ) {
      alert("Both EN and AR must have title and content");
      return;
    }

    const payload = {
      slug,
      cover,
      en: data.en,
      ar: data.ar,
    };

    const res = await fetch(
      mode === "create" ? "/api/blog" : `/api/blog/${blogId}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      alert("Failed to save blog");
      return;
    }

    alert("Blog saved successfully (EN + AR)");
  };

  /* ================= RENDER ================= */
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "Create Blog" : "Edit Blog"}
        </h1>

        <div className="flex gap-2">
          <Button
            variant={active === "en" ? "default" : "outline"}
            onClick={() => setActive("en")}
          >
            EN
          </Button>
          <Button
            variant={active === "ar" ? "default" : "outline"}
            onClick={() => setActive("ar")}
          >
            AR
          </Button>
        </div>
      </div>

      {/* Shared Meta */}
      <section className="bg-white border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">Common Things</h2>

        <Input value={slug} disabled />

        <ImageUploader label="Cover Image" value={cover} onChange={setCover} />
      </section>

      {/* Language Meta */}
      <section className="bg-white border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-lg">
          {active === "en" ? "English Content" : "Arabic Content"}
        </h2>

        <Input
          placeholder="Title"
          value={current.title}
          onChange={(e) => patch("title", e.target.value)}
        />

        <Input
          type="date"
          value={current.publishedAt}
          onChange={(e) => patch("publishedAt", e.target.value)}
        />

        <Input
          placeholder="Meta Title"
          value={current.metaTitle}
          onChange={(e) => patch("metaTitle", e.target.value)}
        />

        <Textarea
          placeholder="Meta Description"
          value={current.metaDescription}
          onChange={(e) => patch("metaDescription", e.target.value)}
        />
      </section>

      {/* Content */}
      <section className="bg-white border rounded-2xl p-6">
        <div className="flex gap-2 mb-4">
          {["paragraph", "heading", "list", "image"].map((t) => (
            <Button
              key={t}
              size="sm"
              onClick={() =>
                patch("content", [...current.content, emptyBlock(t)])
              }
            >
              + {t}
            </Button>
          ))}
        </div>

        {current.content.map((block, i) => (
          <div key={i} className="border rounded-xl p-4 mb-4 bg-gray-50">
            <div className="flex justify-between mb-2">
              <strong>{block.type}</strong>
              <button
                onClick={() => {
                  const cp = [...current.content];
                  cp.splice(i, 1);
                  patch("content", cp);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {block.type === "paragraph" && (
              <Textarea
                value={block.text}
                onChange={(e) => {
                  const cp = [...current.content];
                  cp[i].text = e.target.value;
                  patch("content", cp);
                }}
              />
            )}

            {block.type === "heading" && (
              <Input
                value={block.text}
                onChange={(e) => {
                  const cp = [...current.content];
                  cp[i].text = e.target.value;
                  patch("content", cp);
                }}
              />
            )}

            {block.type === "list" &&
              block.items.map((item, idx) => (
                <Input
                  key={idx}
                  className="mb-2"
                  value={item}
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
          </div>
        ))}
      </section>

      <Button onClick={save} className="w-full flex gap-2">
        <Save size={16} /> Publish Blog (EN + AR)
      </Button>
    </main>
  );
}
