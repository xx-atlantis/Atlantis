"use client";

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
   STATIC LABELS
-------------------------------------------- */
const t = {
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
};

/* -------------------------------------------
   EMPTY PROJECT TEMPLATE (MULTI-LANG)
-------------------------------------------- */
const newProjectTemplate = () => ({
  title: { en: "", ar: "" },
  before: "",
  after: "",
  review: {
    name: { en: "", ar: "" },
    location: { en: "", ar: "" },
    text: { en: "", ar: "" },
  },
});

/* -------------------------------------------
   DEFAULT MULTI-LANGUAGE STRUCTURE
-------------------------------------------- */
const defaultProjects = {
  smallTitle: { en: "", ar: "" },
  mainTitle: {
    normal: { en: "", ar: "" },
    highlight: { en: "", ar: "" },
  },
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
   SECTION CARD
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
   MAIN COMPONENT
-------------------------------------------- */
export default function ProjectsCmsAdmin() {
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem("cms_projects");
    return stored ? JSON.parse(stored) : structuredClone(defaultProjects);
  });

  const [images, setImages] = useState(() => {
    const stored = localStorage.getItem("cms_projects_images");
    return stored ? JSON.parse(stored) : {};
  });

  const [lang, setLang] = useState("en"); // 🔥 LANGUAGE SWITCH

  /* -------------------------------------------
     NESTED PATCH
  -------------------------------------------- */
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

  const addProject = () => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp.list.push(newProjectTemplate());
      return cp;
    });
  };

  const deleteProject = (index) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp.list.splice(index, 1);

      const newImgs = {};
      Object.keys(images).forEach((k) => {
        const key = parseInt(k);
        if (key < index) newImgs[key] = images[key];
        else if (key > index) newImgs[key - 1] = images[key];
      });

      setImages(newImgs);
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

    const updated = { ...images };
    if (!updated[projectIndex]) updated[projectIndex] = {};
    updated[projectIndex][type] = b64;

    setImages(updated);
    localStorage.setItem("cms_projects_images", JSON.stringify(updated));

    setShowUploadModal(false);
  };

  const save = () => {
    localStorage.setItem("cms_projects", JSON.stringify(data));
    alert("Saved Projects Content");
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

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
              className="cursor-pointer border rounded-lg p-3 block w-full"
            />
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <main className="p-6">
        <h1 className="text-xl font-bold mb-6">{t.section} CMS</h1>

        <SectionCard
          title={t.section}
          right={
            <Button onClick={save} className="flex items-center gap-2">
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
          <label className="font-medium">{t.smallTitle} ({lang.toUpperCase()})</label>
          <Input
            className="mt-1 mb-4"
            value={data.smallTitle[lang]}
            onChange={(e) => patch(`smallTitle.${lang}`, e.target.value)}
          />

          {/* MAIN TITLE NORMAL */}
          <label className="font-medium">{t.mainTitleNormal} ({lang.toUpperCase()})</label>
          <Input
            className="mt-1 mb-4"
            value={data.mainTitle.normal[lang]}
            onChange={(e) => patch(`mainTitle.normal.${lang}`, e.target.value)}
          />

          {/* MAIN TITLE HIGHLIGHT */}
          <label className="font-medium">{t.mainTitleHighlight} ({lang.toUpperCase()})</label>
          <Input
            className="mt-1 mb-6"
            value={data.mainTitle.highlight[lang]}
            onChange={(e) => patch(`mainTitle.highlight.${lang}`, e.target.value)}
          />

          {/* ADD PROJECT */}
          <Button onClick={addProject} className="flex items-center gap-2 mb-6">
            <Plus size={16} /> {t.newProject}
          </Button>

          {/* PROJECT LIST */}
          {data.list.map((proj, i) => (
            <div key={i} className="border rounded-lg p-5 mb-8 bg-gray-50 shadow-sm">
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold text-lg">
                  {t.project} {i + 1} ({lang.toUpperCase()})
                </h3>

                <button
                  onClick={() => deleteProject(i)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 size={16} /> {t.delete}
                </button>
              </div>

              {/* BEFORE / AFTER IMAGES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="font-medium block mb-1">{t.before}</label>
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden shadow">
                    <Image
                      src={images[i]?.before || "/placeholder.png"}
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

                <div>
                  <label className="font-medium block mb-1">{t.after}</label>
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden shadow">
                    <Image
                      src={images[i]?.after || "/placeholder.png"}
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

              {/* TITLE */}
              <label className="font-medium">{t.title} ({lang.toUpperCase()})</label>
              <Input
                className="mt-1 mb-4"
                value={proj.title[lang]}
                onChange={(e) => patch(`list.${i}.title.${lang}`, e.target.value)}
              />

              <h4 className="font-semibold mt-4 mb-2">{t.review} ({lang.toUpperCase()})</h4>

              <label>{t.reviewName}</label>
              <Input
                className="mt-1 mb-3"
                value={proj.review.name[lang]}
                onChange={(e) =>
                  patch(`list.${i}.review.name.${lang}`, e.target.value)
                }
              />

              <label>{t.reviewLocation}</label>
              <Input
                className="mt-1 mb-3"
                value={proj.review.location[lang]}
                onChange={(e) =>
                  patch(`list.${i}.review.location.${lang}`, e.target.value)
                }
              />

              <label>{t.reviewText}</label>
              <Textarea
                rows={4}
                className="mt-1"
                value={proj.review.text[lang]}
                onChange={(e) =>
                  patch(`list.${i}.review.text.${lang}`, e.target.value)
                }
              />
            </div>
          ))}
        </SectionCard>
      </main>
    </>
  );
}
