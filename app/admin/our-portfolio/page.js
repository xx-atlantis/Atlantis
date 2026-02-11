"use client";

import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import ProjectsManager from "../_components/ProjectsManager";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("our-portfolio");
  const { permissions, loading: authLoading } = useAdminAuth();

  const canCreate = permissions.includes("portfolio.create");
  const canDelete = permissions.includes("portfolio.delete");
  const canUpdate = permissions.includes("portfolio.update");

  const saveSection = async (key, locale, content) => {
    const updatePromise = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch("/api/admin/content", {
          method: "PATCH",
          body: JSON.stringify({
            page: "our-portfolio",
            key,
            locale,
            content,
          }),
        });

        const json = await res.json();
        if (json.success) resolve(json);
        else reject(new Error("Save failed"));
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(updatePromise, {
      pending: {
        render: `Syncing ${key.toUpperCase()}...`,
        icon: "🔄",
      },
      success: {
        render: () => (
          <div className="flex flex-col">
            <span className="font-bold text-sm">Update Successful!</span>
            <span className="text-xs opacity-80">
              The {key} section is now live.
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        pauseOnHover
        theme="light"
      />

      <h1 className="text-2xl font-bold mb-8">Our Portfolio CMS</h1>

      {/* ===============================
          PAGE CONTENT CMS (PROJECTS REMOVED)
      =============================== */}
      {Object.keys(data).map((key) => {
        let sectionData = data[key];

        // 🚫 HARD REMOVE `items` FROM EACH LOCALE
        if (key === "ourPortfolio" && sectionData) {
          sectionData = Object.fromEntries(
            Object.entries(sectionData).map(([locale, content]) => {
              if (content && typeof content === "object") {
                const { items, ...rest } = content;
                return [locale, rest];
              }
              return [locale, content];
            })
          );
        }

        return (
          <SectionWithTabs
            key={key}
            sectionKey={key}
            sectionData={sectionData}
            onSave={(locale, content) => saveSection(key, locale, content)}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        );
      })}

      {/* ===============================
          PROJECT CRUD MANAGEMENT
      =============================== */}
      <ProjectsManager
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete} />
    </main>
  );
}
