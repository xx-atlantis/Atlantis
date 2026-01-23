"use client";

import { useState } from "react";
import { useLocale } from "@/app/components/LocaleProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    section: "Portfolio (Tabs & Sections)",
    tabsTitle: "Tabs",
    addTab: "Add New Tab",
    tabKey: "Tab Key (slug)",
    tabLabel: "Tab Label",

    sectionTitle: "Section Content",
    heroImage: "Hero Image",
    title: "Title",
    description: "Description",
    button: "Button Text",
    materialsTitle: "Materials Title",
    composition: "Composition Label",
    elements: "Elements Label",

    materials: "Materials",
    materialName: "Material Name",
    addMaterial: "Add Material",
    deleteTab: "Delete Tab",
    deleteMaterial: "Delete Material",

    uploadNew: "Upload New Image",
    changeImg: "Change Image",
    save: "Save Content",
  },
  ar: {
    section: "الملف التعريفي (التبويبات والأقسام)",
    tabsTitle: "التبويبات",
    addTab: "إضافة تبويب جديد",
    tabKey: "مفتاح التبويب (slug)",
    tabLabel: "اسم التبويب",

    sectionTitle: "محتوى القسم",
    heroImage: "صورة الهيرو",
    title: "العنوان",
    description: "الوصف",
    button: "نص الزر",
    materialsTitle: "عنوان المواد",
    composition: "تسمية التركيب",
    elements: "تسمية العناصر",

    materials: "المواد",
    materialName: "اسم المادة",
    addMaterial: "إضافة مادة",
    deleteTab: "حذف التبويب",
    deleteMaterial: "حذف المادة",

    uploadNew: "رفع صورة جديدة",
    changeImg: "تغيير الصورة",
    save: "حفظ المحتوى",
  },
};

/* ============================================================
   DEFAULT STRUCTURE
============================================================ */
const newMaterial = () => ({
  name: "",
  img: "",
});

const newSection = () => ({
  title: "",
  description: "",
  button: "",
  heroImg: "",
  materialsTitle: "",
  composition: "",
  elements: "",
  materials: [],
});

const defaultPortfolio = {
  // For admin UI we keep tabs as an array [{ key, label }]
  tabs: [],
  // Sections are an object mapping key -> section object
  sections: {},
};

/* ============================================================
   HELPERS
============================================================ */
const fileToBase64 = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

const SectionCard = ({ title, right, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-xl bg-white shadow-sm mb-6">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <button
          onClick={() => setOpen((o) => !o)}
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
   MAIN CMS COMPONENT
============================================================ */
export default function PortfolioCmsAdmin() {
  const { locale } = useLocale();
  const t = UI[locale];

  const [data, setData] = useState({
    en: structuredClone(defaultPortfolio),
    ar: structuredClone(defaultPortfolio),
  });

  const current = data[locale];

  // =============== PATCH HELPER (TEXT / STRUCTURE) ===============
  const patch = (path, value) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const keys = path.split(".");
      let ref = cp[locale];
      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
      }
      ref[keys.at(-1)] = value;
      return cp;
    });
  };

  // =============== TABS LOGIC ===============
  const addTab = () => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const tabs = cp[locale].tabs;
      // Generate a simple slug
      let base = "style";
      let index = tabs.length + 1;
      let key = `${base}-${index}`;
      const existingKeys = new Set(tabs.map((t) => t.key));
      while (existingKeys.has(key)) {
        index++;
        key = `${base}-${index}`;
      }

      tabs.push({ key, label: "" });
      cp[locale].sections[key] = newSection();
      return cp;
    });
  };

  const deleteTab = (idx) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const tabs = cp[locale].tabs;
      const removed = tabs[idx];
      tabs.splice(idx, 1);

      if (removed?.key && cp[locale].sections[removed.key]) {
        delete cp[locale].sections[removed.key];
      }

      return cp;
    });
  };

  const handleTabKeyChange = (idx, newKey) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const tabs = cp[locale].tabs;
      const oldKey = tabs[idx].key;

      if (!oldKey || oldKey === newKey) return prev;

      tabs[idx].key = newKey;

      // Move section under new key
      const sec = cp[locale].sections[oldKey];
      if (sec) {
        cp[locale].sections[newKey] = sec;
        delete cp[locale].sections[oldKey];
      }

      return cp;
    });
  };

  const handleTabLabelChange = (idx, label) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      cp[locale].tabs[idx].label = label;
      return cp;
    });
  };

  // =============== MATERIALS LOGIC ===============
  const addMaterial = (sectionKey) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const sec = cp[locale].sections[sectionKey];
      if (!sec) return prev;
      sec.materials.push(newMaterial());
      return cp;
    });
  };

  const deleteMaterial = (sectionKey, mIdx) => {
    setData((prev) => {
      const cp = structuredClone(prev);
      const sec = cp[locale].sections[sectionKey];
      if (!sec) return prev;
      sec.materials.splice(mIdx, 1);
      return cp;
    });
  };

  // =============== IMAGE MODAL LOGIC ===============
  const [imageModal, setImageModal] = useState(null);
  // imageModal = { type: 'hero' | 'material', sectionKey, materialIndex? }

  const openHeroModal = (sectionKey) => {
    setImageModal({ type: "hero", sectionKey });
  };

  const openMaterialModal = (sectionKey, materialIndex) => {
    setImageModal({ type: "material", sectionKey, materialIndex });
  };

  const handleImageSelect = async (file) => {
    if (!file || !imageModal) return;
    const b64 = await fileToBase64(file);
    const { type, sectionKey, materialIndex } = imageModal;

    if (type === "hero") {
      patch(`sections.${sectionKey}.heroImg`, b64);
    } else if (type === "material" && typeof materialIndex === "number") {
      patch(`sections.${sectionKey}.materials.${materialIndex}.img`, b64);
    }

    setImageModal(null);
  };

  // =============== SAVE ===============
  const save = () => {
    // Convert tabs array -> object shape like common.js
    const tabsObj = {};
    current.tabs.forEach((t) => {
      if (t.key) tabsObj[t.key] = t.label || "";
    });

    const sectionsObj = {};
    Object.entries(current.sections).forEach(([key, sec]) => {
      sectionsObj[key] = sec;
    });

    const payload = {
      tabs: tabsObj,
      sections: sectionsObj,
    };

    localStorage.setItem(
      `cms_portfolio_${locale}`,
      JSON.stringify(payload)
    );
    alert(`Saved Portfolio (${locale})`);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      {/* IMAGE UPLOAD MODAL */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 relative">
            <button
              onClick={() => setImageModal(null)}
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UploadCloud size={18} /> {UI[locale].uploadNew}
            </h3>

            <div className="border rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="p-6">
        <h1 className="text-xl font-bold mb-6">
          {t.section} ({locale.toUpperCase()})
        </h1>

        <SectionCard
          title={t.tabsTitle}
          right={
            <Button onClick={save} className="flex items-center gap-2">
              <Save size={14} /> {t.save}
            </Button>
          }
        >
          {/* ADD TAB BUTTON */}
          <Button onClick={addTab} className="flex items-center gap-2 mb-6">
            <Plus size={16} /> {t.addTab}
          </Button>

          {/* TABS + SECTIONS */}
          {current.tabs.map((tab, idx) => {
            const sec = current.sections[tab.key] || newSection();
            const sectionKey = tab.key;

            return (
              <div
                key={idx}
                className="border rounded-lg p-5 mb-8 bg-gray-50 shadow-sm"
              >
                {/* TAB HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <h2 className="font-semibold text-lg">
                    Tab #{idx + 1}
                  </h2>
                  <button
                    onClick={() => deleteTab(idx)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                  >
                    <Trash2 size={16} /> {t.deleteTab}
                  </button>
                </div>

                {/* TAB FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="font-medium text-sm">{t.tabKey}</label>
                    <Input
                      className="mt-1"
                      value={tab.key}
                      onChange={(e) =>
                        handleTabKeyChange(idx, e.target.value.trim())
                      }
                    />
                  </div>
                  <div>
                    <label className="font-medium text-sm">{t.tabLabel}</label>
                    <Input
                      className="mt-1"
                      value={tab.label}
                      onChange={(e) =>
                        handleTabLabelChange(idx, e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* SECTION CONTENT */}
                <h3 className="font-semibold mb-3 text-base">
                  {t.sectionTitle}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* HERO IMAGE LEFT */}
                  <div>
                    <label className="font-medium text-sm">
                      {t.heroImage}
                    </label>
                    <div className="relative w-full h-56 mt-2 rounded-xl overflow-hidden border shadow">
                      <Image
                        src={sec.heroImg || "/placeholder.png"}
                        alt={sec.title || "Hero image"}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => openHeroModal(sectionKey)}
                        className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-md flex items-center gap-1"
                      >
                        <Pencil size={12} /> {t.changeImg}
                      </button>
                    </div>
                  </div>

                  {/* TEXT FIELDS RIGHT */}
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-sm">{t.title}</label>
                      <Input
                        className="mt-1"
                        value={sec.title}
                        onChange={(e) =>
                          patch(
                            `sections.${sectionKey}.title`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="font-medium text-sm">
                        {t.description}
                      </label>
                      <Textarea
                        rows={4}
                        className="mt-1"
                        value={sec.description}
                        onChange={(e) =>
                          patch(
                            `sections.${sectionKey}.description`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="font-medium text-sm">{t.button}</label>
                      <Input
                        className="mt-1"
                        value={sec.button}
                        onChange={(e) =>
                          patch(
                            `sections.${sectionKey}.button`,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-medium text-xs">
                          {t.materialsTitle}
                        </label>
                        <Input
                          className="mt-1"
                          value={sec.materialsTitle}
                          onChange={(e) =>
                            patch(
                              `sections.${sectionKey}.materialsTitle`,
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="font-medium text-xs">
                          {t.composition}
                        </label>
                        <Input
                          className="mt-1"
                          value={sec.composition}
                          onChange={(e) =>
                            patch(
                              `sections.${sectionKey}.composition`,
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="font-medium text-xs">
                          {t.elements}
                        </label>
                        <Input
                          className="mt-1"
                          value={sec.elements}
                          onChange={(e) =>
                            patch(
                              `sections.${sectionKey}.elements`,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* MATERIALS LIST */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-sm">
                      {t.materials}
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => addMaterial(sectionKey)}
                      className="flex items-center gap-1"
                    >
                      <Plus size={14} /> {t.addMaterial}
                    </Button>
                  </div>

                  {sec.materials?.map((mat, mIdx) => (
                    <div
                      key={mIdx}
                      className="border rounded-lg p-3 mb-3 bg-white flex flex-col md:flex-row gap-3"
                    >
                      {/* IMAGE LEFT */}
                      <div className="relative w-full md:w-48 h-40 rounded-lg overflow-hidden border shadow">
                        <Image
                          src={mat.img || "/placeholder.png"}
                          alt={mat.name || "Material"}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() =>
                            openMaterialModal(sectionKey, mIdx)
                          }
                          className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1"
                        >
                          <Pencil size={12} /> {t.changeImg}
                        </button>
                      </div>

                      {/* TEXT RIGHT */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-medium text-sm">
                            {t.materialName}
                          </label>
                          <button
                            onClick={() =>
                              deleteMaterial(sectionKey, mIdx)
                            }
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                          >
                            <Trash2 size={12} /> {t.deleteMaterial}
                          </button>
                        </div>
                        <Input
                          value={mat.name}
                          onChange={(e) =>
                            patch(
                              `sections.${sectionKey}.materials.${mIdx}.name`,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </SectionCard>
      </main>
    </>
  );
}
