"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

export default function AdminBlogListing() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { permissions, loading: authLoading } = useAdminAuth();

  const canCreate = permissions.includes("blog.create");
  const canUpdate = permissions.includes("blog.update");
  const canDelete = permissions.includes("blog.delete");

  const fetchBlogs = async () => {
    setLoading(true);
    const res = await fetch("/api/blog?locale=en");
    const data = await res.json();
    setBlogs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const deleteBlog = async (id) => {
    const ok = confirm("Are you sure you want to delete this blog?");
    if (!ok) return;

    await fetch(`/api/blog/${id}`, { method: "DELETE" });
    fetchBlogs();
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* ===== Page Header ===== */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, and manage blog posts
          </p>
        </div>
        {canCreate && (
          <Link href="/admin/blog-management/new">
            <Button className="flex items-center gap-2">
              <Plus size={16} /> New Blog
            </Button>
          </Link>)}
      </div>

      {/* ===== Card Container ===== */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {/* ===== Table ===== */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-left text-gray-600">
                <th className="px-5 py-4 font-medium">Title (EN)</th>
                <th className="px-5 py-4 font-medium">Slug</th>
                <th className="px-5 py-4 font-medium text-center">Status</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* ===== Loading State ===== */}
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading blogs…
                  </td>
                </tr>
              )}

              {/* ===== Empty State ===== */}
              {!loading && blogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="text-gray-500 mb-4">No blogs found</p>
                    {canCreate && (
                      <Link href="/admin/blog-management/new">
                        <Button variant="outline">
                          <Plus size={16} className="mr-2" />
                          Create your first blog
                        </Button>
                      </Link>)}
                  </td>
                </tr>
              )}

              {/* ===== Rows ===== */}
              {!loading &&
                blogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {blog.title || "—"}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-500">
                        {blog.slug}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      {blog.published ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-xs font-medium">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                        <Link href={`/admin/blog-management/${blog.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Pencil size={14} />
                            Edit
                          </Button>
                        </Link>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteBlog(blog.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>)}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
