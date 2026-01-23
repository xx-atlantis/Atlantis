"use client";

import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

// 1. Import Toastify components
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("privacy-policy");
      const { permissions, loading: authLoading } = useAdminAuth();
    
      const canUpdate = permissions.includes("content.update");
      const canDelete = permissions.includes("content.delete");

  // call PATCH API
  const saveSection = async (key, locale, content) => {
    // 2. Wrap your fetch in a promise for Toastify to track
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      body: JSON.stringify({ page: "privacy-policy", key, locale, content }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Update failed");
      return json;
    });

    // 3. Trigger the "Pretty" toast
    toast.promise(savePromise, {
      pending: {
        render: `Saving ${key.toUpperCase()}...`,
        icon: "💾",
      },
      success: {
        render() {
          return (
            <div className="flex flex-col">
              <span className="font-bold text-sm">Privacy Policy Updated!</span>
              <span className="text-xs opacity-90">
                The {key} ({locale.toUpperCase()}) data is now live.
              </span>
            </div>
          );
        },
        icon: "🎨",
      },
      error: {
        render: `❌ Save failed for ${key}.`,
      },
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="p-6">
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
        theme="light" 
      />
      <h1 className="text-2xl font-bold mb-8">Privacy Policy CMS</h1>

      {/* Render sections: hero, howitworks, whybest, etc. */}
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
