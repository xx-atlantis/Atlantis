"use client";

import { useMemo } from "react";
import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminStartPage() {
  // 1. Fetch data specifically for the "start-a-project" page
  const { data, loading } = useAdminContent("start-a-project");
  const { permissions, loading: authLoading } = useAdminAuth();

  const canUpdate = useMemo(() => permissions?.includes("content.update"), [permissions]);
  const canDelete = useMemo(() => permissions?.includes("content.delete"), [permissions]);

  // 2. Reuse your centralized Save logic
  const saveSection = async (sectionKey, locale, content) => {
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        page: "start-a-project", // Target page
        key: sectionKey, 
        locale, 
        content 
      }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Update failed");
      return json;
    });

    toast.promise(savePromise, {
      pending: `Saving ${sectionKey}...`,
      success: "Content updated successfully! 🎉",
      error: {
        render: ({ data }) => `❌ Save failed: ${data.message}`,
      },
    });
  };

  if (loading || authLoading) return <LoadingSkeleton />;
  if (!data) return <div className="p-6 text-center">No content found for this page.</div>;

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8">
      <ToastContainer position="top-right" theme="light" />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Onboarding CMS</h1>
        <p className="text-gray-500 mt-1">Manage the steps users see when starting a design project.</p>
      </div>

      <div className="space-y-10">
        {/* Since 'start-a-project' might have multiple sections 
           (like 'hero', 'steps', 'propertyTypes'), we map through them.
        */}
        {Object.keys(data).map((key) => (
          <SectionWithTabs
            key={`start-${key}`}
            sectionKey={key}
            sectionData={data[key]}
            onSave={(locale, content) => saveSection(key, locale, content)}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        ))}
      </div>
    </main>
  );
}