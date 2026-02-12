"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { Trash2, Pencil, RefreshCcw, Plus, Eye, Calendar, ImageIcon } from "lucide-react";

export default function ProjectsManager({
  canCreate = true,
  canUpdate = true,
  canDelete = true
}) {
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

      toast.success("Project deleted successfully");
    } catch {
      toast.error("Failed to delete project");
      fetchProjects(true);
    }
  };

  if (loading) {
    return (
      <div className="mt-16 flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-12">
      {/* ================= HEADER ================= */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Portfolio Projects</h2>
            <p className="text-sm text-gray-600 mt-1">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} total
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchProjects(true);
              }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            {canCreate && (
              <Link
                href="/admin/our-portfolio/new"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={16} />
                Add Project
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {!projects.length && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first portfolio project</p>
          {canCreate && (
            <Link
              href="/admin/our-portfolio/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Create First Project
            </Link>
          )}
        </div>
      )}

      {/* ================= GRID VIEW ================= */}
      {!!projects.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Project Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {p.cover && p.cover.length > 0 ? (
                  <Image
                    src={p.cover[0]}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <ImageIcon size={48} />
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                  {p.title}
                </h3>
                
                {p.excerpt && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {p.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Calendar size={12} />
                  {new Date(p.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="font-mono truncate">/{p.slug}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/our-portfolio/${p.slug}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                  
                  {canUpdate && (
                    <Link
                      href={`/admin/our-portfolio/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}