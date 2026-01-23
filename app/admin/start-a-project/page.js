"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SectionCard from "../_components/SectionCard";
import FieldRenderer from "../_components/FieldRenderer";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

/* ---------------------------------------------------------
   ENGLISH DUMMY DATA
---------------------------------------------------------- */
const EN_DUMMY = {
  backgroundImage: "/hero.jpg",
  mainTitle: "Start Your Interior Design Project",
  subtitle: "Choose the type of property you want to design.",
  kinds: [
    {
      title: "Room",
      subtitle: "Perfect for redesigning individual spaces.",
      image: "/room.jpg",
      name: "room",
    },
    {
      title: "Villa",
      subtitle: "Ideal for full-scale luxury home design.",
      image: "/villa.jpg",
      name: "villa",
    },
    {
      title: "Apartment",
      subtitle: "Smart and beautiful designs for apartments of any size.",
      image: "/apartment.jpg",
      name: "apartment",
    },
  ],
};

/* ---------------------------------------------------------
   ARABIC DUMMY DATA
---------------------------------------------------------- */
const AR_DUMMY = {
  backgroundImage: "/hero.jpg",
  mainTitle: "ابدأ مشروع التصميم الداخلي الخاص بك",
  subtitle: "اختر نوع العقار الذي تريد تصميمه.",
  kinds: [
    {
      title: "غرفة",
      subtitle: "مثالي لتجديد مساحة واحدة.",
      image: "/room.jpg",
      name: "room",
    },
    {
      title: "فيلا",
      subtitle: "مناسب لتصميم المنازل الفاخرة بالكامل.",
      image: "/villa.jpg",
      name: "villa",
    },
    {
      title: "شقة",
      subtitle: "تصاميم أنيقة وذكية للشقق بجميع أحجامها.",
      image: "/apartment.jpg",
      name: "apartment",
    },
  ],
};

/* ---------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------- */
export default function AdminStartPage() {
  const [data, setData] = useState({ en: EN_DUMMY, ar: AR_DUMMY });
    const { permissions, loading: authLoading } = useAdminAuth();
  
    const canUpdate = permissions.includes("project_request.update");
    const canDelete = permissions.includes("project_request.delete");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("startPageCMS");
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      localStorage.setItem("startPageCMS", JSON.stringify(data));
    }
  }, []);

  // const saveToLocal = () => {
  //   localStorage.setItem("startPageCMS", JSON.stringify(data));
  //   alert("Saved to LocalStorage!");
  // };

  // Update nested field
  const patch = (locale, path, value) => {
    const clone = structuredClone(data);
    let ref = clone[locale];

    const keys = path.split(".");
    for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
    ref[keys.at(-1)] = value;

    setData(clone);
  };

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Start a Project — Step 1 CMS</h1>

      <LocaleTabs data={data} onPatch={patch} canUpdate={canUpdate} canDelete={canDelete} />

      {/* <Button onClick={saveToLocal} className="w-full py-3 text-lg">
        Save All
      </Button> */}
    </main>
  );
}

/* ---------------------------------------------------------
   LOCALE TABS COMPONENT
---------------------------------------------------------- */
function LocaleTabs({ data, onPatch , canUpdate, canDelete}) {
  const [tab, setTab] = useState("en");

  return (
    <SectionCard
      title={`Edit Content (${tab.toUpperCase()})`}
      right={
        <div className="flex gap-3">
          <Button
            variant={tab === "en" ? "default" : "outline"}
            onClick={() => setTab("en")}
          >
            English
          </Button>
          <Button
            variant={tab === "ar" ? "default" : "outline"}
            onClick={() => setTab("ar")}
          >
            Arabic
          </Button>
        </div>
      }
    >
      <div className="border p-4 rounded bg-gray-50">
        <FieldRenderer
          value={data[tab]}
          path=""
          onChange={(path, value) => onPatch(tab, path, value)}
          canUpdate = {canUpdate}
          canDelete = {canDelete}
        />
      </div>
    </SectionCard>
  );
}
