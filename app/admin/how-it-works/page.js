"use client";

import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

// 1. Import Toastify components
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("how-it-works");
    const { permissions, loading: authLoading } = useAdminAuth();
  
    const canUpdate = permissions.includes("content.update");
    const canDelete = permissions.includes("content.delete");

  const saveSection = async (key, locale, content) => {
    // 2. Wrap the fetch in a promise for Toastify
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      body: JSON.stringify({ page: "how-it-works", key, locale, content }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Update failed");
      return json;
    });

    // 3. Trigger the "Pretty" promise toast
    toast.promise(savePromise, {
      pending: {
        render: `Saving ${key.replace(/-/g, ' ')}...`,
        icon: "⏳",
      },
      success: {
        render() {
          return (
            <div className="flex flex-col">
              <span className="font-bold text-sm">Update Published!</span>
              <span className="text-xs opacity-90">
                {key.toUpperCase()} ({locale}) is now up to date.
              </span>
            </div>
          );
        },
        icon: "✨",
      },
      error: {
        render: `❌ Failed to save ${key}. Please try again.`,
      },
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="p-6">
      {/* 4. The Toast Container - Configured for a sleek look */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" 
      />

      <h1 className="text-2xl font-bold mb-8">How it Works CMS</h1>

      {Object.keys(data).map((key) => (
        <SectionWithTabs
          key={key}
          sectionKey={key}
          sectionData={data[key]}
          onSave={(locale, content) => saveSection(key, locale, content)}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ))}
    </main>
  );
}