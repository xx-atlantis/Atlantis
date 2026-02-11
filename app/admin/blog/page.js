"use client";

import useAdminContent from "../_hooks/useAdminContent";
import SectionWithTabs from "../_components/SectionWithTabs";
import LoadingSkeleton from "../_components/LoadingSkeleton";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

export default function AdminHomePage() {
  const { data, loading } = useAdminContent("blog");
    const { permissions, loading: authLoading } = useAdminAuth();
  
    const canCreate = permissions.includes("blog.create");
    const canUpdate = permissions.includes("blog.update");
    const canDelete = permissions.includes("blog.delete");

  // call PATCH API
  const saveSection = async (key, locale, content) => {
    const res = await fetch("/api/admin/content", {
      method: "PATCH",
      body: JSON.stringify({ page: "blog", key, locale, content }),
    });

    const json = await res.json();
    if (json.success) alert(`Saved ${key} (${locale.toUpperCase()})`);
    else alert("❌ Save failed");
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-8">Blog CMS</h1>

      {/* Render sections: hero, howitworks, whybest, etc. */}
      {Object.keys(data).map((key) => (
        <SectionWithTabs
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
