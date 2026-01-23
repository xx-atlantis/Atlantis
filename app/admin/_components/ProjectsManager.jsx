"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { Trash2, Pencil, RefreshCcw } from "lucide-react";

export default function ProjectsManager({
  canCreate = true, 
  canUpdate = true, 
  canDelete = true}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= FETCH ================= */
  const fetchProjects = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch("/api/our-portfolio?locale=en");

      if (!res.ok) throw new Error("Failed to fetch projects");

      const data = await res.json();
      setProjects(data);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ================= DELETE ================= */
  const deleteProject = async (id) => {
    if (!confirm("Delete this project permanently?")) return;

    const optimistic = projects.filter((p) => p.id !== id);
    setProjects(optimistic);

    try {
      const res = await fetch(`/api/our-portfolio/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
      fetchProjects(true); // rollback
    }
  };

  if (loading) {
    return <p className="text-gray-500 mt-10">Loading projects...</p>;
  }

  return (
    <section className="mt-16 border-t pt-10">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Portfolio Projects</h2>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchProjects(true);
            }}
            className="px-3 py-2 border rounded-md text-sm flex items-center gap-1"
          >
            <RefreshCcw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
          {canCreate && (
          <Link
            href="/admin/our-portfolio/new"
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            + Add Project
          </Link>)}
        </div>
      </div>

      {/* ================= EMPTY ================= */}
      {!projects.length && (
        <div className="text-center py-12 text-gray-500">
          No projects yet. Click <strong>“Add Project”</strong> to create one.
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!!projects.length && (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Project</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t">
                  {/* Project */}
                  <td className="p-3 flex items-center gap-3">
                    {p.cover && (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={p.cover}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.id}</div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="p-3 text-gray-500">{p.slug}</td>

                  {/* Actions */}
                  <td className="p-3 text-center space-x-3">
                    {canUpdate && (
                    <Link
                      href={`/admin/our-portfolio/${p.id}`}
                      className="inline-flex items-center gap-1 text-blue-600"
                    >
                      <Pencil size={14} /> Edit
                    </Link>)}
                    {canDelete && (
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="inline-flex items-center gap-1 text-red-600"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
