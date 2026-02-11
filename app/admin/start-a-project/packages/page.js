"use client";

import useAdminContent from "../../_hooks/useAdminContent";
import PackageRenderer from "../../_components/PackageRenderer";
import LoadingSkeleton from "../../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("packages");
  const { permissions, loading: authLoading } = useAdminAuth();
  const canUpdate = permissions.includes("content.update");

  const handleFinalSave = async (locale, updatedContent) => {
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "packages", key: "packages", locale, content: updatedContent }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Update failed");
      return json;
    });

    toast.promise(savePromise, {
      pending: "Saving to database...",
      success: "Successfully updated live site! ✅",
      error: "Failed to save. Please try again. ❌",
    });
  };

  if (loading || authLoading) return <LoadingSkeleton />;

  return (
    <main className="p-8 bg-slate-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      <div className="max-w-7xl mx-auto space-y-12">
        {/* English Section */}
        <section className="bg-white rounded-[2rem] border shadow-sm">
          <PackageRenderer
            content={data?.packages?.en}
            locale="en"
            readOnly={!canUpdate}
            onSave={(content) => handleFinalSave("en", content)}
          />
        </section>

        {/* Arabic Section */}
        <section className="bg-white rounded-[2rem] border shadow-sm">
          <PackageRenderer
            content={data?.packages?.ar}
            locale="ar"
            readOnly={!canUpdate}
            onSave={(content) => handleFinalSave("ar", content)}
          />
        </section>
      </div>
    </main>
  );
}