"use client";

import useAdminContent from "./_hooks/useAdminContent";
import SectionWithTabs from "./_components/SectionWithTabs";
import LoadingSkeleton from "./_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

// 1. Import Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("home");
  const { permissions, loading: authLoading } = useAdminAuth();

  const canUpdate = permissions.includes("content.update");
  const canDelete = permissions.includes("content.delete");

  const saveSection = async (key, locale, content) => {
    // 2. Create the Save Functionality as a Promise
    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch("/api/admin/content", {
          method: "PATCH",
          body: JSON.stringify({ page: "home", key, locale, content }),
        });
        const json = await res.json();

        if (json.success) resolve(json);
        else reject(new Error("Save failed"));
      } catch (error) {
        reject(error);
      }
    });

    // 3. Trigger the Pretty Promise Toast
    toast.promise(updatePromise, {
      pending: {
        render: `Syncing ${key.toUpperCase()}...`,
        icon: "🔄",
      },
      success: {
        render: ({ data }) => (
          <div className="flex flex-col">
            <span className="font-bold text-sm">Update Successful!</span>
            <span className="text-xs opacity-80">
              The {key} section in {locale.toUpperCase()} is now live.
            </span>
          </div>
        ),
        icon: "🚀",
      },
      error: {
        render: `❌ Failed to update ${key}.`,
      },
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="p-6">
      {/* 4. The Toast Container - Modern configuration */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // Can be "dark", "light", or "colored"
      />

      <h1 className="text-2xl font-bold mb-8">Home CMS</h1>

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