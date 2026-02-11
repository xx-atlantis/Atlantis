"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";

/* -------------------------------------------
   STATIC LABELS
-------------------------------------------- */
const t = {
  section: "Our Styles",
  smallTitle: "Small Title",
  mainTitleNormal: "Main Title (Normal)",
  mainTitleHighlight: "Main Title (Highlight)",
  cta: "CTA Button",
  style: "Style",
  addStyle: "Add New Style",
  deleteStyle: "Delete Style",
  title: "Title",
  image: "Image",
  uploadNew: "Upload New Image",
  changeImg: "Change Image",
  save: "Save Content",
};

/* -------------------------------------------
   MULTI-LANGUAGE STRUCTURE
-------------------------------------------- */
const newStyle = () => ({
  title: { en: "", ar: "" },
  image: "",
});

const defaultStyles = {
  smallTitle: { en: "", ar: "" },
  mainTitle: {
    normal: { en: "", ar: "" },
    highlight: { en: "", ar: "" },
  },
  cta: { en: "", ar: "" },
  list: [],
};

/* -------------------------------------------
   FILE TO BASE64
-------------------------------------------- */
const fileToBase64 = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

/* -------------------------------------------
   ACCORDION CARD
-------------------------------------------- */
const SectionCard = ({ title, right, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-xl bg-white shadow-sm mb-6">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 font-semibold"
        >
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {title}
        </button>

        {right}
      </div>

      {open && <div className="p-5">{children}</div>}
    </div>
  );
};

/* -------------------------------------------
   MAIN COMPONENT
-------------------------------------------- */
export default function OurStylesCmsAdmin() {
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem("cms_styles");
    return stored ? JSON.parse(stored) : structuredClone(defaultStyles);
  });

  const [lang, setLang] = useState("en"); // ⭐ MULTI-LANG SWITCHER

  const [images, setImages] = useState(() => {
    const saved = localStorage.getItem("cms_styles_images");
    return saved ? JSON.parse(saved) : {};
  });

  const patch = (path, value) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const keys = path.split(".");
      let ref = cp;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys.at(-1)] = value;
      return cp;
    });
  };

  const addStyle = () => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp.list.push(newStyle());
      return cp;
    });
  };

  const deleteStyle = (index) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp.list.splice(index, 1);

      const newImgs = {};
      Object.entries(images).forEach(([k, v]) => {
        const idx = Number(k);
        if (idx < index) newImgs[idx] = v;
        if (idx > index) newImgs[idx - 1] = v;
      });

      setImages(newImgs);
      localStorage.setItem("cms_styles_images", JSON.stringify(newImgs));

      return cp;
    });
  };

  /* ---------------- IMAGE UPLOAD ---------------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState(null);

  const openImageModal = (index) => {
    setTargetIndex(index);
    setModalOpen(true);
  };

  const handleImageSelect = async (file) => {
    if (!file) return;
    const b64 = await fileToBase64(file);

    const updated = { ...images, [targetIndex]: b64 };
    setImages(updated);
    localStorage.setItem("cms_styles_images", JSON.stringify(updated));
    setModalOpen(false);
  };

  /* SAVE */
  const save = () => {
    localStorage.setItem("cms_styles", JSON.stringify(data));
    alert("Saved Styles Content");
  };

  return (
    <>
      {/* IMAGE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow p-6 w-96 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UploadCloud size={18} /> {t.uploadNew}
            </h3>

            <input
              type="file"
              accept="image/*"
              className="cursor-pointer border rounded-lg p-3 block w-full"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
            />
          </div>
        </div>
      )}

      {/* MAIN VIEW */}
      <main className="p-6">
        <h1 className="text-xl font-bold mb-6">{t.section} CMS</h1>

        <SectionCard
          title={t.section}
          right={
            <Button onClick={save} className="flex gap-2 items-center">
              <Save size={14} /> {t.save}
            </Button>
          }
        >
          {/* 🔥 LANGUAGE SWITCHER */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={lang === "en" ? "default" : "outline"}
              onClick={() => setLang("en")}
            >
              English
            </Button>
            <Button
              variant={lang === "ar" ? "default" : "outline"}
              onClick={() => setLang("ar")}
            >
              Arabic
            </Button>
          </div>

          {/* SMALL TITLE */}
          <label className="font-medium">
            {t.smallTitle} ({lang.toUpperCase()})
          </label>
          <Input
            className="mt-1 mb-4"
            value={data.smallTitle[lang]}
            onChange={(e) => patch(`smallTitle.${lang}`, e.target.value)}
          />

          {/* MAIN TITLES */}
          <label className="font-medium">
            {t.mainTitleNormal} ({lang.toUpperCase()})
          </label>
          <Input
            className="mt-1 mb-4"
            value={data.mainTitle.normal[lang]}
            onChange={(e) => patch(`mainTitle.normal.${lang}`, e.target.value)}
          />

          <label className="font-medium">
            {t.mainTitleHighlight} ({lang.toUpperCase()})
          </label>
          <Input
            className="mt-1 mb-6"
            value={data.mainTitle.highlight[lang]}
            onChange={(e) =>
              patch(`mainTitle.highlight.${lang}`, e.target.value)
            }
          />

          <label className="font-medium">
            {t.cta} ({lang.toUpperCase()})
          </label>
          <Input
            className="mt-1 mb-8"
            value={data.cta[lang]}
            onChange={(e) => patch(`cta.${lang}`, e.target.value)}
          />

          {/* ADD NEW STYLE */}
          <Button onClick={addStyle} className="flex items-center gap-2 mb-6">
            <Plus size={16} /> {t.addStyle}
          </Button>

          {/* STYLE ITEMS */}
          {data.list.map((style, index) => (
            <div
              key={index}
              className="border rounded-lg p-5 mb-8 bg-gray-50 shadow-sm"
            >
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {t.style} #{index + 1} ({lang.toUpperCase()})
                </h3>

                <button
                  onClick={() => deleteStyle(index)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 size={16} /> {t.deleteStyle}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium">{t.image}</label>
                  <div className="relative w-full h-56 rounded-lg border overflow-hidden shadow mt-2">
                    <Image
                      src={images[index] || "/placeholder.png"}
                      alt="Style"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => openImageModal(index)}
                      className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Pencil size={14} /> {t.changeImg}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-medium">
                    {t.title} ({lang.toUpperCase()})
                  </label>
                  <Input
                    className="mt-1"
                    value={style.title[lang]}
                    onChange={(e) =>
                      patch(`list.${index}.title.${lang}`, e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </SectionCard>
      </main>
    </>
  );
}
