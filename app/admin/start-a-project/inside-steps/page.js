"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SectionCard from "../../_components/SectionCard";
import FieldRenderer from "../../_components/FieldRenderer";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

/* ---------------------------------------------------------
   DUMMY DATA (EN + AR)
---------------------------------------------------------- */
const enTemplate = {
  kindImage: "/room.jpg",
  introTitle: "Your project",
  introSubtitle:
    "You can choose your preferred design type and we can combine more than one type to suit your needs, which we will discuss in detail in the initial consultation with our designers.",
  steps: [{ "title": "What design is best for you for this space?", 
    "options": [
     { "cardTitle": "Modern", "cardDescription": "", "cardImageUrl": "/modern.jpg", "cardName": "modern" }
     ,
     { "cardTitle": "ZEN", "cardDescription": "", "cardImageUrl": "/zen.jpg", "cardName": "zen" }
    ]},
    { "title": "What design is best for you for this space?", "options": [ { "cardTitle": "Modern", "cardDescription": "", "cardImageUrl": "/modern.jpg", "cardName": "modern" }, { "cardTitle": "ZEN", "cardDescription": "", "cardImageUrl": "/zen.jpg", "cardName": "zen" } ]},
        {
      "title": "عرّف احتياجاتك في هذه المساحة",
      "options": [
        { "cardTitle": "سرير", "cardDescription": "", "cardImageUrl": "/bedroom.jpg", "cardName": "bed" },
        { "cardTitle": "درج مكتب", "cardDescription": "", "cardImageUrl": "/dining.jpg", "cardName": "desk" },
        { "cardTitle": "مكتب", "cardDescription": "", "cardImageUrl": "/office.jpg", "cardName": "office" },
        { "cardTitle": "أريكة", "cardDescription": "", "cardImageUrl": "/mixed.jpg", "cardName": "sofa" },
        { "cardTitle": "تلفاز", "cardDescription": "", "cardImageUrl": "/classic.jpg", "cardName": "television" },
        { "cardTitle": "استوديو", "cardDescription": "", "cardImageUrl": "/hero.jpg", "cardName": "studio" }
      ]
    }],
  finalSteps: [{
      "title": "متى تريد إنجاز المشروع؟",
      "selectPlaceholder": "اختر المدة",
      "options": [
        { "label": "7 إلى 8 أيام", "value": "7to8" },
        { "label": "خلال شهر", "value": "month" },
        { "label": "1 إلى 3 أشهر", "value": "1to3" },
        { "label": "أخرى", "value": "another" }
      ]
    },{
      "title": "ما هي ميزانيتك؟",
      "selectPlaceholder": "اختر الميزانية",
      "options": [
        { "label": "أقل من 9000 ريال", "value": "lt9000" },
        { "label": "9000 إلى 15000 ريال", "value": "9to15" },
        { "label": "15000 إلى 25000 ريال", "value": "15to25" },
        { "label": "أكثر من 25000 ريال", "value": "gt25000" }
      ]
    }],
  submitLabel: "Proceed",
};

const arTemplate = {
  kindImage: "/room.jpg",
  introTitle: "مشروعك",
  introSubtitle:
    "يمكنك اختيار نوع التصميم المفضل لديك، ويمكننا دمج أكثر من نوع ليناسب احتياجاتك، وسيتم مناقشة ذلك بالتفصيل في الاستشارة الأولية مع مصممينا.",
  steps: [{ "title": "What design is best for you for this space?", 
    "options": [
     { "cardTitle": "Modern", "cardDescription": "", "cardImageUrl": "/modern.jpg", "cardName": "modern" }
     ,
     { "cardTitle": "ZEN", "cardDescription": "", "cardImageUrl": "/zen.jpg", "cardName": "zen" }
    ]},
    { "title": "What design is best for you for this space?", "options": [ { "cardTitle": "Modern", "cardDescription": "", "cardImageUrl": "/modern.jpg", "cardName": "modern" }, { "cardTitle": "ZEN", "cardDescription": "", "cardImageUrl": "/zen.jpg", "cardName": "zen" } ]},
        {
      "title": "عرّف احتياجاتك في هذه المساحة",
      "options": [
        { "cardTitle": "سرير", "cardDescription": "", "cardImageUrl": "/bedroom.jpg", "cardName": "bed" },
        { "cardTitle": "درج مكتب", "cardDescription": "", "cardImageUrl": "/dining.jpg", "cardName": "desk" },
        { "cardTitle": "مكتب", "cardDescription": "", "cardImageUrl": "/office.jpg", "cardName": "office" },
        { "cardTitle": "أريكة", "cardDescription": "", "cardImageUrl": "/mixed.jpg", "cardName": "sofa" },
        { "cardTitle": "تلفاز", "cardDescription": "", "cardImageUrl": "/classic.jpg", "cardName": "television" },
        { "cardTitle": "استوديو", "cardDescription": "", "cardImageUrl": "/hero.jpg", "cardName": "studio" }
      ]
    }],
  finalSteps: [{
      "title": "متى تريد إنجاز المشروع؟",
      "selectPlaceholder": "اختر المدة",
      "options": [
        { "label": "7 إلى 8 أيام", "value": "7to8" },
        { "label": "خلال شهر", "value": "month" },
        { "label": "1 إلى 3 أشهر", "value": "1to3" },
        { "label": "أخرى", "value": "another" }
      ]
    },{
      "title": "ما هي ميزانيتك؟",
      "selectPlaceholder": "اختر الميزانية",
      "options": [
        { "label": "أقل من 9000 ريال", "value": "lt9000" },
        { "label": "9000 إلى 15000 ريال", "value": "9to15" },
        { "label": "15000 إلى 25000 ريال", "value": "15to25" },
        { "label": "أكثر من 25000 ريال", "value": "gt25000" }
      ]
    }],
  submitLabel: "متابعة",
};

/* ---------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------- */
export default function AdminStartProjectPage() {
  const [data, setData] = useState({ types: [] });
      const { permissions, loading: authLoading } = useAdminAuth();
    
      const canUpdate = permissions.includes("project_request.update");
      const canDelete = permissions.includes("project_request.delete");

  // load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("startProjectCMS");
    if (saved) setData(JSON.parse(saved));
    else {
      const init = {
        types: [
          { typeName: "room", en: enTemplate, ar: arTemplate },
          { typeName: "villa", en: enTemplate, ar: arTemplate },
          { typeName: "apartment", en: enTemplate, ar: arTemplate },
        ],
      };
      setData(init);
      localStorage.setItem("startProjectCMS", JSON.stringify(init));
    }
  }, []);

  // const saveToLocal = () =>
  //   localStorage.setItem("startProjectCMS", JSON.stringify(data));

  const updateType = (index, locale, path, value) => {
    const clone = structuredClone(data);
    let ref = clone.types[index][locale];

    const keys = path.split(".");
    for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];

    ref[keys.at(-1)] = value;

    setData(clone);
  };

  const addType = () => {
    const newType = {
      typeName: "new-type",
      en: structuredClone(enTemplate),
      ar: structuredClone(arTemplate),
    };

    setData({ types: [...data.types, newType] });
  };

  const removeType = (index) => {
    const clone = [...data.types];
    clone.splice(index, 1);
    setData({ types: clone });
  };

  return (
    <main className="p-6 space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Start Project CMS</h1>
        <Button onClick={addType}>+ Add Type</Button>
      </div>

      {data.types.map((type, index) => (
        <SectionCard
          key={index}
          title={`Type: ${type.typeName}`}
          right={
           canDelete && ( 
            <div>
            <Button variant="destructive" onClick={() => removeType(index)}>
              Remove
            </Button> </div>)
          }
        >
          <div className="mb-4">
            <label className="font-medium">Type Name</label>
            <input
              className="border p-2 rounded w-full"
              value={type.typeName}
              onChange={(e) => {
                const clone = structuredClone(data);
                clone.types[index].typeName = e.target.value;
                setData(clone);
              }}
            />
          </div>

          <TypeEditor
            type={type}
            index={index}
            onChange={updateType}
            canUpdate = {canUpdate}
            canDelete = {canDelete}
          />
        </SectionCard>
      ))}

      {/* <Button className="w-full py-3 text-lg" onClick={saveToLocal}>
        Save All
      </Button> */}
    </main>
  );
}

/* ---------------------------------------------------------
   TABS FOR EN / AR
---------------------------------------------------------- */
function TypeEditor({ type, index, onChange , canUpdate, canDelete}) {
  const [tab, setTab] = useState("en");

  return (
    <div>
      <div className="flex gap-3 mb-4">
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

      <div className="border p-4 rounded bg-gray-50">
        <FieldRenderer
          value={type[tab]}
          path=""
          onChange={(path, val) => onChange(index, tab, path, val)}
          canUpdate = {canUpdate}
          canDelete = {canDelete}
        />
      </div>
    </div>
  );
}



// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import SectionCard from "../_components/SectionCard";
// import FieldRenderer from "../_components/FieldRenderer";
// import useAdminContent from "../_hooks/useAdminContent";

// /* -----------------------------------------------
//    ADMIN PAGE FOR START PROJECT STEPS
// -------------------------------------------------- */
// export default function AdminStartProjectPage() {
//   const { data, loading } = useAdminContent("startProject");

//   if (loading) return <div className="p-10">Loading...</div>;

//   const [localData, setLocalData] = useState(data);

//   /* Update nested field inside type:en or type:ar */
//   const patchType = (typeIndex, locale, path, value) => {
//     const clone = structuredClone(localData);
//     let ref = clone.types[typeIndex][locale];

//     const keys = path.split(".");
//     for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];

//     ref[keys.at(-1)] = value;

//     setLocalData(clone);
//   };

//   /* Add new type template */
//   const addType = () => {
//     const emptyTemplate = {
//       typeName: "new-type",
//       en: {
//         kindImage: "",
//         introTitle: "",
//         introSubtitle: "",
//         steps: [],
//         finalSteps: [],
//         submitLabel: ""
//       },
//       ar: {
//         kindImage: "",
//         introTitle: "",
//         introSubtitle: "",
//         steps: [],
//         finalSteps: [],
//         submitLabel: ""
//       }
//     };

//     setLocalData({ types: [...localData.types, emptyTemplate] });
//   };

//   /* Remove type */
//   const removeType = (index) => {
//     const clone = [...localData.types];
//     clone.splice(index, 1);
//     setLocalData({ types: clone });
//   };

//   /* Save whole section */
//   const saveSection = async () => {
//     const res = await fetch("/api/admin/content", {
//       method: "PATCH",
//       body: JSON.stringify({
//         page: "startProject",
//         key: "types",
//         locale: "both",
//         content: localData.types
//       })
//     });

//     const json = await res.json();
//     if (json.success) alert("Saved Successfully!");
//     else alert("Failed to Save");
//   };

//   return (
//     <main className="p-6 space-y-10">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Start Project (All Types)</h1>

//         <Button onClick={addType}>+ Add Type</Button>
//       </div>

//       {/* ------------------------------------------
//           RENDER EACH TYPE
//       ------------------------------------------- */}
//       {localData.types.map((type, index) => (
//         <SectionCard
//           key={index}
//           title={`Type: ${type.typeName}`}
//           right={
//             <Button
//               variant="destructive"
//               onClick={() => removeType(index)}
//             >
//               Remove Type
//             </Button>
//           }
//         >
//           {/* TYPE NAME EDITOR */}
//           <div className="mb-4">
//             <label className="font-medium">Type Name</label>
//             <input
//               className="border p-2 rounded w-full"
//               value={type.typeName}
//               onChange={(e) => {
//                 const clone = structuredClone(localData);
//                 clone.types[index].typeName = e.target.value;
//                 setLocalData(clone);
//               }}
//             />
//           </div>

//           {/* EN & AR TABS */}
//           <TypeTabs
//             type={type}
//             index={index}
//             onPatch={patchType}
//           />
//         </SectionCard>
//       ))}

//       {/* SAVE BUTTON */}
//       <div className="pt-6 border-t">
//         <Button className="w-full py-3 text-lg" onClick={saveSection}>
//           Save All Types
//         </Button>
//       </div>
//     </main>
//   );
// }

// /* =============================================================
//    TABS COMPONENT
// ============================================================= */
// function TypeTabs({ type, index, onPatch }) {
//   const [tab, setTab] = useState("en");

//   return (
//     <div>
//       <div className="flex gap-3 mb-4">
//         <Button
//           variant={tab === "en" ? "default" : "outline"}
//           onClick={() => setTab("en")}
//         >
//           English
//         </Button>
//         <Button
//           variant={tab === "ar" ? "default" : "outline"}
//           onClick={() => setTab("ar")}
//         >
//           Arabic
//         </Button>
//       </div>

//       {/* RENDER FIELDS USING FIELD RENDERER */}
//       <div className="border p-4 rounded-lg bg-gray-50">
//         <FieldRenderer
//           value={type[tab]}
//           path=""
//           onChange={(path, value) => onPatch(index, tab, path, value)}
//         />
//       </div>
//     </div>
//   );
// }
