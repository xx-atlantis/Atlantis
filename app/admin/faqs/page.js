"use client";

import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

// 1. Import Toastify components and CSS
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("faqs");
  const { permissions, loading: authLoading } = useAdminAuth();
  
    const canUpdate = permissions.includes("content.update");
    const canDelete = permissions.includes("content.delete");

  const saveSection = async (key, locale, content) => {
    // 2. Create the promise logic
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      body: JSON.stringify({ page: "faqs", key, locale, content }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Failed");
      return json;
    });

    // 3. Trigger the "Pretty" Toast
    toast.promise(savePromise, {
      pending: {
        render: `Updating ${key.toUpperCase()}...`,
        icon: "⏳",
      },
      success: {
        render() {
          return (
            <div>
              <div className="font-bold">{key.toUpperCase()} updated!</div>
              <div className="text-xs opacity-80">The {locale} version is now live.</div>
            </div>
          );
        },
        icon: "✅",
      },
      error: {
        render: `❌ Error saving ${key}. Please try again.`,
      }
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="p-6">
      {/* 4. The Container - Configuration for "Pretty" looks */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // Use "dark" or "light" for different vibes
      />

      <h1 className="text-2xl font-bold mb-8 italic text-slate-800">Faqs CMS</h1>

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