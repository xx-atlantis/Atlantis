"use client";

import { useLocale } from "@/app/components/LocaleProvider";
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

/* ============================================================
   UI LABELS
============================================================ */
const UI = {
  en: {
    section: "Our Styles",
    smallTitle: "Small Title",
    mainTitleNormal: "Main Title (Normal)",
    mainTitleHighlight: "Main Title (Highlight)",
    cta: "CTA Button",
    list: "Style List",
    addStyle: "Add New Style",
    deleteStyle: "Delete Style",
    title: "Title",
    image: "Image",
    uploadNew: "Upload New Image",
    changeImg: "Change Image",
    save: "Save Content",
  },

  ar: {
    section: "أنماطنا",
    smallTitle: "العنوان الصغير",
    mainTitleNormal: "العنوان الرئيسي (عادي)",
    mainTitleHighlight: "العنوان الرئيسي (مميز)",
    cta: "زر الدعوة",
    list: "قائمة الأنماط",
    addStyle: "إضافة نمط جديد",
    deleteStyle: "حذف النمط",
    title: "العنوان",
    image: "الصورة",
    uploadNew: "رفع صورة جديدة",
    changeImg: "تغيير الصورة",
    save: "حفظ المحتوى",
  },
};

/* ============================================================
   DEFAULT STRUCTURE
============================================================ */
const newStyle = () => ({
  title: "",
  image: "",
});

const defaultStyles = {
  smallTitle: "",
  mainTitle: { normal: "", highlight: "" },
  cta: "",
  list: [],
};

/* ============================================================
   FILE -> BASE64
============================================================ */
const fileToBase64 = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

/* ============================================================
   ACCORDION CARD
============================================================ */
const SectionCard = ({ title, right, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-xl bg-white shadow-sm">
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

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function OurStylesCmsAdmin() {
  const { locale } = useLocale();
  const t = UI[locale];

  const [data, setData] = useState({
    en: structuredClone(defaultStyles),
    ar: structuredClone(defaultStyles),
  });

  const [sharedImages, setSharedImages] = useState(() => {
    const saved = localStorage.getItem("cms_styles_images");
    return saved ? JSON.parse(saved) : {};
  });

  const current = data[locale];

  /* ---------------- PATCH FUNCTION ---------------- */
  const patch = (path, value) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const keys = path.split(".");
      let ref = cp[locale];
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys.at(-1)] = value;
      return cp;
    });
  };

  /* ---------------- ADD / REMOVE STYLE ---------------- */
  const addStyle = () => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp[locale].list.push(newStyle());
      return cp;
    });
  };

  const deleteStyle = (index) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp[locale].list.splice(index, 1);

      // Delete shared images
      const imgs = structuredClone(sharedImages);
      delete imgs[index];

      // Reindex
      const newImgs = {};
      cp.en.list.forEach((_, i) => {
        if (imgs[i]) newImgs[i] = imgs[i];
      });

      setSharedImages(newImgs);
      localStorage.setItem("cms_styles_images", JSON.stringify(newImgs));

      return cp;
    });
  };

  /* ---------------- IMAGE MODAL ---------------- */
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState(null);

  const openImageModal = (index) => {
    setTarget(index);
    setModalOpen(true);
  };

  const handleImageSelect = async (file) => {
    if (!file) return;

    const b64 = await fileToBase64(file);

    const updated = structuredClone(sharedImages);
    updated[target] = b64;

    setSharedImages(updated);
    localStorage.setItem("cms_styles_images", JSON.stringify(updated));

    setModalOpen(false);
  };

  /* ---------------- SAVE ---------------- */
  const save = () => {
    localStorage.setItem(
      `cms_styles_${locale}`,
      JSON.stringify(current)
    );
    alert(`Saved Styles (${locale})`);
  };

  return (
    <>
      {/* IMAGE UPLOAD MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-96 relative shadow-lg">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UploadCloud size={18} /> {t.uploadNew}
            </h3>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
              className="block w-full"
            />
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="p-6">
        <h1 className="text-xl font-bold mb-6">
          {t.section} CMS ({locale.toUpperCase()})
        </h1>

        <SectionCard
          title={t.section}
          right={
            <Button onClick={save} className="flex items-center gap-2">
              <Save size={14} /> {t.save}
            </Button>
          }
        >
          {/* Small Title */}
          <div className="mb-4">
            <label className="font-medium">{t.smallTitle}</label>
            <Input
              className="mt-1"
              value={current.smallTitle}
              onChange={(e) => patch("smallTitle", e.target.value)}
            />
          </div>

          {/* Main Title Normal */}
          <div className="mb-4">
            <label className="font-medium">{t.mainTitleNormal}</label>
            <Input
              className="mt-1"
              value={current.mainTitle.normal}
              onChange={(e) => patch("mainTitle.normal", e.target.value)}
            />
          </div>

          {/* Main Title Highlight */}
          <div className="mb-8">
            <label className="font-medium">{t.mainTitleHighlight}</label>
            <Input
              className="mt-1"
              value={current.mainTitle.highlight}
              onChange={(e) => patch("mainTitle.highlight", e.target.value)}
            />
          </div>

          {/* CTA */}
          <div className="mb-8">
            <label className="font-medium">{t.cta}</label>
            <Input
              className="mt-1"
              value={current.cta}
              onChange={(e) => patch("cta", e.target.value)}
            />
          </div>

          {/* Add New Style Button */}
          <Button onClick={addStyle} className="flex items-center gap-2 mb-6">
            <Plus size={16} /> {t.addStyle}
          </Button>

          {/* Styles List */}
          {current.list.map((style, index) => (
            <div
              key={index}
              className="border rounded-lg p-5 mb-8 bg-gray-50 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">
                  {t.list} #{index + 1}
                </h3>

                <button
                  onClick={() => deleteStyle(index)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 size={16} /> {t.deleteStyle}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT IMAGE */}
                <div>
                  <label className="font-medium">{t.image}</label>

                  <div className="relative w-full h-56 border rounded-lg overflow-hidden mt-2 shadow">
                    <Image
                      src={sharedImages[index] || "/placeholder.png"}
                      alt="Style image"
                      fill
                      className="object-cover"
                    />

                    <button
                      onClick={() => openImageModal(index)}
                      className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-3 py-1 rounded-md flex items-center gap-1"
                    >
                      <Pencil size={14} /> {t.changeImg}
                    </button>
                  </div>
                </div>

                {/* RIGHT INPUTS */}
                <div>
                  {/* Title */}
                  <label className="font-medium">{t.title}</label>
                  <Input
                    className="mt-1"
                    value={style.title}
                    onChange={(e) =>
                      patch(`list.${index}.title`, e.target.value)
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
