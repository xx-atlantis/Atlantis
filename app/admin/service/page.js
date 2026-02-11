"use client";

import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

// 1. Import Toastify components
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("services");
    const { permissions, loading: authLoading } = useAdminAuth();
  
    const canUpdate = permissions.includes("content.update");
    const canDelete = permissions.includes("content.delete");

  const saveSection = async (key, locale, content) => {
    // 2. Wrap the fetch in a promise
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      body: JSON.stringify({ page: "services", key, locale, content }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Failed");
      return json;
    });

    // 3. Trigger the Pretty Promise Toast
    toast.promise(savePromise, {
      pending: {
        render: `Updating ${key.replace(/-/g, ' ')}...`,
        icon: "🛠️",
      },
      success: {
        render() {
          return (
            <div>
              <div className="font-bold text-sm">Service Updated!</div>
              <div className="text-xs opacity-80">
                Changes to {key} ({locale.toUpperCase()}) are now live.
              </div>
            </div>
          );
        },
        icon: "✅",
      },
      error: {
        render: `❌ Error updating service: ${key}`,
      }
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="p-6">
      {/* 4. The Toast Container - Set to 'dark' for a high-end look */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="light" 
        pauseOnHover
      />

      <h1 className="text-2xl font-bold mb-8 text-slate-800">Our Service CMS</h1>

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