"use client";

import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

// 1. Import Toastify components and CSS
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHomePage() {
  // Note: I added `refresh` or `mutate` here assuming your hook supports refetching. 
  // If it doesn't, you may need to manage local state or reload the page.
  const { data, loading, refresh } = useAdminContent("faqs");
  const { permissions, loading: authLoading } = useAdminAuth();
  
  const canUpdate = permissions.includes("content.update");
  const canDelete = permissions.includes("content.delete");
  const canCreate = permissions.includes("content.create"); // Optional: if you have a create permission

  // --- SAVE SECTION ---
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
      pending: { render: `Updating ${key.toUpperCase()}...`, icon: "⏳" },
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
      error: { render: `❌ Error saving ${key}. Please try again.` }
    });
  };

  // --- ADD NEW SECTION ---
  const addSection = async () => {
    // Generate a unique key for the new FAQ (e.g., faq_1684829394)
    const newKey = `faq_${Date.now()}`; 
    const defaultContent = { question: "New Question", answer: "New Answer" }; // Adjust to your schema

    const addPromise = fetch("/api/admin/content", {
      method: "POST", // Or PATCH, depending on how your backend handles creation
      body: JSON.stringify({ page: "faqs", key: newKey, content: defaultContent }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Failed");
      if (refresh) refresh(); // Refetch data to show the new FAQ
      return json;
    });

    toast.promise(addPromise, {
      pending: "Creating new FAQ...",
      success: "New FAQ created! You can now edit it.",
      error: "❌ Error creating FAQ."
    });
  };

  // --- DELETE SECTION ---
  const deleteSection = async (key) => {
    // Optional: Add a confirmation prompt before deleting
    if (!window.confirm(`Are you sure you want to delete ${key}?`)) return;

    const deletePromise = fetch("/api/admin/content", {
      method: "DELETE", 
      body: JSON.stringify({ page: "faqs", key }),
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Failed");
      if (refresh) refresh(); // Refetch data to remove the FAQ from UI
      return json;
    });

    toast.promise(deletePromise, {
      pending: `Deleting ${key}...`,
      success: `${key} deleted successfully!`,
      error: `❌ Error deleting ${key}.`
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="p-6">
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
        theme="light"
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold italic text-slate-800">Faqs CMS</h1>
        
        {/* ADD BUTTON */}
        {(canCreate || canUpdate) && (
          <button 
            onClick={addSection}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition-colors"
          >
            + Add New FAQ
          </button>
        )}
      </div>

      {data && Object.keys(data).length > 0 ? (
        Object.keys(data).map((key) => (
          <SectionWithTabs
            key={key}
            sectionKey={key}
            sectionData={data[key]}
            onSave={(locale, content) => saveSection(key, locale, content)}
            onDelete={() => deleteSection(key)} // Pass delete handler to child component
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        ))
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-lg text-gray-500">
          No FAQs found. Click "Add New FAQ" to get started.
        </div>
      )}
    </main>
  );
}