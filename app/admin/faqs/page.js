"use client";

import useAdminContent from "../_hooks/useAdminContent";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import FaqSectionManager from "../_components/FaqSectionManager";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("faqs");
  const { permissions, loading: authLoading } = useAdminAuth();

  const canCreate = permissions.includes("content.create");
  const canUpdate = permissions.includes("content.update");
  const canDelete = permissions.includes("content.delete");

  const saveSection = async (key, locale, content) => {
    const savePromise = fetch("/api/admin/content", {
      method: "PATCH",
      body: JSON.stringify({ page: "faqs", key, locale, content }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Failed");
      return json;
    });

    toast.promise(savePromise, {
      pending: {
        render: `Saving ${key.toUpperCase()} (${locale.toUpperCase()})…`,
        icon: "⏳",
      },
      success: {
        render() {
          return (
            <div>
              <div className="font-bold">{key.toUpperCase()} saved!</div>
              <div className="text-xs opacity-80">
                {content.length} FAQ{content.length !== 1 ? "s" : ""} live in {locale.toUpperCase()}.
              </div>
            </div>
          );
        },
        icon: "✅",
      },
      error: {
        render: `❌ Error saving ${key}. Please try again.`,
      },
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="p-6 max-w-7xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-1 rounded-full bg-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">FAQs CMS</h1>
        </div>
        <p className="text-sm text-slate-400 ml-4 pl-3">
          Manage frequently asked questions — add, reorder, edit, and publish in English & Arabic.
        </p>
      </div>

      {/* FAQ Sections */}
      {Object.keys(data).map((key) => (
        <FaqSectionManager
          key={key}
          sectionKey={key}
          sectionData={data[key]}
          onSave={(locale, content) => saveSection(key, locale, content)}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ))}
    </main>
  );
}