"use client";

import { useState, useEffect } from "react";
import useAdminContent from "../../_hooks/useAdminContent";
import LoadingSkeleton from "../../_components/LoadingSkeleton";
import TabSections from "../../_components/TabSections";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminStartProjectPage() {
  const { data: step1Data, loading: loadingStep1 } = useAdminContent("start-a-project");
  
  const [activeKind, setActiveKind] = useState(null);
  const [currentFlowData, setCurrentFlowData] = useState(null);
  const [loadingFlow, setLoadingFlow] = useState(false);

  useEffect(() => {
    if (step1Data?.startproject?.en?.kinds?.length > 0 && !activeKind) {
      setActiveKind(step1Data.startproject.en.kinds[0].name); 
    }
  }, [step1Data, activeKind]);

  useEffect(() => {
    if (activeKind) {
      const fetchKindData = async () => {
        setLoadingFlow(true);
        try {
          const res = await fetch(`/api/admin/content?page=${activeKind}`);
          const json = await res.json();
          if (json.success) setCurrentFlowData(json.data);
        } catch (err) {
          toast.error(`Error loading ${activeKind} flow`);
        } finally {
          setLoadingFlow(false);
        }
      };
      fetchKindData();
    }
  }, [activeKind]);

  const saveSection = async (key, locale, content) => {
    try {
      const savePromise = fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: activeKind,
          key: key,
          locale: locale,
          content: content
        }),
      }).then(async (res) => {
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || "Save failed");
        }
        return json;
      });

      await toast.promise(savePromise, {
        pending: "Syncing changes...",
        success: "Database updated!",
        error: "Sync failed."
      });
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  if (loadingStep1) return <LoadingSkeleton />;

  return (
    <main className="min-h-screen bg-[#fafafa] p-8 space-y-8">
      <ToastContainer position="bottom-right" theme="light" />

      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Project Flows</h1>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-white border shadow-sm rounded-2xl">
          {step1Data?.startproject?.en?.kinds?.map((kind) => (
            <button
              key={kind.name}
              onClick={() => setActiveKind(kind.name)}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                activeKind === kind.name
                  ? "bg-black text-white"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {kind.title.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-10 pb-20">
        {loadingFlow ? (
          <LoadingSkeleton />
        ) : currentFlowData ? (
          Object.keys(currentFlowData).map((key) => (
            <TabSections
              key={`${activeKind}-${key}`}
              sectionKey={key}
              sectionData={currentFlowData[key]}
              onSave={saveSection}
            />
          ))
        ) : null}
      </div>
    </main>
  );
}