"use client";

import useAdminContent from "../../_hooks/useAdminContent";
import PackageRenderer from "../../_components/PackageRenderer";
import LoadingSkeleton from "../../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  // Fetching the 'packages' page data
  const { data, loading, refetch } = useAdminContent("packages");
  const { permissions, loading: authLoading } = useAdminAuth();
  
  const canUpdate = permissions.includes("content.update");

  const handleFinalSave = async (locale, updatedPackageContent) => {
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        page: "packages", 
        key: "packages", // Targets only the packages object in your DB
        locale, 
        content: updatedPackageContent 
      }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Update failed");
      }
      return json;
    });

    toast.promise(savePromise, {
      pending: "Saving package changes...",
      success: {
        render: () => {
          refetch(); 
          return "Packages updated successfully! ✅";
        }
      },
      error: "Failed to save. Please check API logs. ❌",
    });
  };

  if (loading || authLoading) return <LoadingSkeleton />;

  return (
    <main className="p-8 bg-slate-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Package Management
          </h1>
          <p className="text-slate-500">
            Edit package types, pricing, features, and the golden guarantee text.
          </p>
        </header>

        {/* English Section */}
        <section className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
          <div className="px-8 py-4 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-blue-500"></span>
              <h2 className="font-bold text-slate-700">English Packages</h2>
            </div>
          </div>
          <PackageRenderer
            content={data}
            locale="en"
            readOnly={!canUpdate}
            onSave={(updatedContent) => handleFinalSave("en", updatedContent)}
          />
        </section>

        {/* Arabic Section */}
        <section className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
          <div className="px-8 py-4 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-green-500"></span>
              <h2 className="font-bold text-slate-700">Arabic Packages</h2>
            </div>
          </div>
          <PackageRenderer
            content={data}
            locale="ar"
            readOnly={!canUpdate}
            onSave={(updatedContent) => handleFinalSave("ar", updatedContent)}
          />
        </section>
      </div>
    </main>
  );
}