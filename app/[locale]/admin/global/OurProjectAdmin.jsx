"use client";

import { useLocale } from "@/app/components/LocaleProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  ChevronDown,
  ChevronRight,
  Pencil,
  UploadCloud,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";

/* -------------------------------------------
   UI LABELS
-------------------------------------------- */
const UI = {
  en: {
    section: "Projects Showcase",
    smallTitle: "Small Title",
    mainTitleNormal: "Main Title (Normal)",
    mainTitleHighlight: "Main Title (Highlight)",

    project: "Project",
    newProject: "Add New Project",
    delete: "Delete Project",

    title: "Title",
    before: "Before Image",
    after: "After Image",

    review: "Review",
    reviewName: "Reviewer Name",
    reviewLocation: "Reviewer Location",
    reviewText: "Review Text",

    uploadNew: "Upload New Image",
    changeImg: "Change Image",
    save: "Save Content",
  },
  ar: {
    section: "عرض المشاريع",
    smallTitle: "العنوان الصغير",
    mainTitleNormal: "العنوان الرئيسي (عادي)",
    mainTitleHighlight: "العنوان الرئيسي (مميز)",

    project: "المشروع",
    newProject: "إضافة مشروع جديد",
    delete: "حذف المشروع",

    title: "العنوان",
    before: "صورة قبل",
    after: "صورة بعد",

    review: "التقييم",
    reviewName: "اسم المراجع",
    reviewLocation: "موقع المراجع",
    reviewText: "نص المراجعة",

    uploadNew: "رفع صورة جديدة",
    changeImg: "تغيير الصورة",
    save: "حفظ المحتوى",
  },
};

/* -------------------------------------------
   NEW EMPTY PROJECT TEMPLATE
-------------------------------------------- */
const newProjectTemplate = () => ({
  title: "",
  before: "",
  after: "",
  review: { name: "", location: "", text: "" },
});

/* -------------------------------------------
   DEFAULT STRUCTURE
-------------------------------------------- */
const defaultProjects = {
  smallTitle: "",
  mainTitle: { normal: "", highlight: "" },
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

/* -------------------------------------------
   MAIN CMS COMPONENT
-------------------------------------------- */
export default function ProjectsCmsAdmin() {
  const { locale } = useLocale();
  const t = UI[locale];

  const [data, setData] = useState({
    en: structuredClone(defaultProjects),
    ar: structuredClone(defaultProjects),
  });

  const [sharedImages, setSharedImages] = useState(() => {
    const saved = localStorage.getItem("cms_projects_images");
    return saved ? JSON.parse(saved) : {};
  });

  const current = data[locale];

  /* -------------------------------------------
     PATCH TEXT
-------------------------------------------- */
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

  /* -------------------------------------------
     ADD NEW PROJECT
-------------------------------------------- */
  const addProject = () => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp[locale].list.push(newProjectTemplate());
      return cp;
    });
  };

  /* -------------------------------------------
     DELETE PROJECT
-------------------------------------------- */
  const deleteProject = (index) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp[locale].list.splice(index, 1);

      // Remove shared images for this project
      const imgs = structuredClone(sharedImages);
      delete imgs[index];

      // Reindex shared images
      const newImgs = {};
      cp.en.list.forEach((_, i) => {
        if (imgs[i]) newImgs[i] = imgs[i];
      });

      setSharedImages(newImgs);
      localStorage.setItem("cms_projects_images", JSON.stringify(newImgs));

      return cp;
    });
  };

  /* -------------------------------------------
     IMAGE MODAL
-------------------------------------------- */
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [imageTarget, setImageTarget] = useState(null);

  const openImageModal = (projectIndex, type) => {
    setImageTarget({ projectIndex, type });
    setShowUploadModal(true);
  };

  const handleImageSelect = async (file) => {
    if (!file || !imageTarget) return;

    const b64 = await fileToBase64(file);
    const { projectIndex, type } = imageTarget;

    const updated = structuredClone(sharedImages);
    if (!updated[projectIndex]) updated[projectIndex] = {};
    updated[projectIndex][type] = b64;

    setSharedImages(updated);
    localStorage.setItem("cms_projects_images", JSON.stringify(updated));

    setShowUploadModal(false);
  };

  /* -------------------------------------------
     SAVE TEXT DATA
-------------------------------------------- */
  const save = () => {
    localStorage.setItem(
      `cms_projects_${locale}`,
      JSON.stringify(current)
    );
    alert(`Saved Projects (${locale})`);
  };

  return (
    <>
      {/* IMAGE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UploadCloud size={18} /> {t.uploadNew}
            </h3>

            <div className="border rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e.target.files?.[0])}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="p-6">
        <h1 className="text-xl font-bold mb-6">
          {t.section} CMS ({locale.toUpperCase()})
        </h1>

        <SectionCard
          title={t.section}
          right={
            <Button onClick={save} className="flex items-center gap-2">
              <Save size={14} />
              {t.save}
            </Button>
          }
        >
          {/* SMALL TITLE */}
          <div className="mb-4">
            <label className="font-medium">{t.smallTitle}</label>
            <Input
              className="mt-1"
              value={current.smallTitle}
              onChange={(e) => patch("smallTitle", e.target.value)}
            />
          </div>

          {/* MAIN TITLE */}
          <div className="mb-4">
            <label className="font-medium">{t.mainTitleNormal}</label>
            <Input
              className="mt-1"
              value={current.mainTitle.normal}
              onChange={(e) => patch("mainTitle.normal", e.target.value)}
            />
          </div>
          <div className="mb-8">
            <label className="font-medium">{t.mainTitleHighlight}</label>
            <Input
              className="mt-1"
              value={current.mainTitle.highlight}
              onChange={(e) => patch("mainTitle.highlight", e.target.value)}
            />
          </div>

          {/* ADD NEW PROJECT BUTTON */}
          <Button
            onClick={addProject}
            className="flex items-center gap-2 mb-6"
          >
            <Plus size={16} /> {t.newProject}
          </Button>

          {/* PROJECT LIST */}
          {current.list.map((proj, i) => (
            <div
              key={i}
              className="border rounded-lg p-5 mb-8 bg-gray-50 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">
                  {t.project} {i + 1}
                </h3>
                <button
                  onClick={() => deleteProject(i)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 size={16} /> {t.delete}
                </button>
              </div>

              {/* BEFORE / AFTER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* BEFORE IMAGE */}
                <div>
                  <label className="font-medium block mb-1">{t.before}</label>

                  <div className="relative w-full h-48 border rounded-lg overflow-hidden shadow">
                    <Image
                      src={sharedImages[i]?.before || "/placeholder.png"}
                      alt="Before"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => openImageModal(i, "before")}
                      className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      <Pencil size={14} /> {t.changeImg}
                    </button>
                  </div>
                </div>

                {/* AFTER IMAGE */}
                <div>
                  <label className="font-medium block mb-1">{t.after}</label>

                  <div className="relative w-full h-48 border rounded-lg overflow-hidden shadow">
                    <Image
                      src={sharedImages[i]?.after || "/placeholder.png"}
                      alt="After"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => openImageModal(i, "after")}
                      className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      <Pencil size={14} /> {t.changeImg}
                    </button>
                  </div>
                </div>
              </div>

              {/* TITLE INPUT */}
              <div className="mb-3">
                <label className="font-medium">{t.title}</label>
                <Input
                  className="mt-1"
                  value={proj.title}
                  onChange={(e) =>
                    patch(`list.${i}.title`, e.target.value)
                  }
                />
              </div>

              {/* REVIEW SECTION */}
              <h4 className="font-semibold mt-4 mb-2">{t.review}</h4>

              <label className="text-sm font-medium">{t.reviewName}</label>
              <Input
                className="mt-1 mb-3"
                value={proj.review.name}
                onChange={(e) =>
                  patch(`list.${i}.review.name`, e.target.value)
                }
              />

              <label className="text-sm font-medium">{t.reviewLocation}</label>
              <Input
                className="mt-1 mb-3"
                value={proj.review.location}
                onChange={(e) =>
                  patch(`list.${i}.review.location`, e.target.value)
                }
              />

              <label className="text-sm font-medium">{t.reviewText}</label>
              <Textarea
                rows={4}
                className="mt-1"
                value={proj.review.text}
                onChange={(e) =>
                  patch(`list.${i}.review.text`, e.target.value)
                }
              />
            </div>
          ))}
        </SectionCard>
      </main>
    </>
  );
}
