"use client";

import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

// 1. Import Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("pricing-plans");
    const { permissions, loading: authLoading } = useAdminAuth();

  const canUpdate = permissions.includes("content.update");
  const canDelete = permissions.includes("content.delete");

  const saveSection = async (key, locale, content) => {
    // 2. Wrap fetch in a promise for the toast to track
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      body: JSON.stringify({ page: "pricing-plans", key, locale, content }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Update failed");
      return json;
    });

    // 3. Trigger the "Pretty" toast
    toast.promise(savePromise, {
      pending: {
        render: `Updating Pricing: ${key.replace(/-/g, ' ')}...`,
        icon: "💳",
      },
      success: {
        render() {
          return (
            <div className="flex flex-col">
              <span className="font-bold text-sm">Prices Updated!</span>
              <span className="text-xs opacity-90">
                The {key} plan ({locale.toUpperCase()}) is now live.
              </span>
            </div>
          );
        },
        icon: "💰",
      },
      error: {
        render: `❌ Could not save pricing for ${key}.`,
      },
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="p-6">
      {/* 4. The Toast Container */}
      <ToastContainer
        position="top-right" // Center top is often better for critical "Pricing" updates
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

      <h1 className="text-2xl font-bold mb-8">Plans & Pricing CMS</h1>

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