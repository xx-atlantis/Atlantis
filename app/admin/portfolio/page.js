"use client";

import { useMemo } from "react";
import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("portfolio");
  const { permissions, loading: authLoading } = useAdminAuth();

  // Memoize permissions for performance
  const canUpdate = useMemo(() => permissions?.includes("content.update"), [permissions]);
  const canDelete = useMemo(() => permissions?.includes("content.delete"), [permissions]);

  const saveSection = async (sectionKey, locale, content) => {
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        page: "portfolio", 
        key: sectionKey, 
        locale, 
        content 
      }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Update failed");
      }
      return json;
    });

    toast.promise(savePromise, {
      pending: {
        render: `Saving ${sectionKey.toUpperCase()}...`,
        icon: "💾",
      },
      success: {
        render: () => (
          <div className="flex flex-col">
            <span className="font-bold text-sm">Update Successful!</span>
            <span className="text-xs opacity-90">
              {sectionKey} ({locale.toUpperCase()}) is now live.
            </span>
          </div>
        ),
        icon: "✅",
      },
      error: {
        render: ({ data }) => `❌ Error: ${data.message || "Save failed"}`,
      },
    });
  };

  if (loading || authLoading) return <LoadingSkeleton />;
  if (!data) return <div className="p-6">No data found for this page.</div>;

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio CMS</h1>
        <p className="text-gray-500 mt-1">Manage sections, projects, and localized content.</p>
      </div>

      <div className="space-y-10">
        {Object.keys(data).map((key) => (
          <SectionWithTabs
            // Use the data key as the React key for stable identity
            key={`section-${key}`} 
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