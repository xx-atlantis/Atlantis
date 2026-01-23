"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminBlogListing() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-6">Loading blogs...</div>;
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Management</h1>

        <Link href="/admin/blogs/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} /> Add Blog
          </Button>
        </Link>
      </div>

      {/* ===== Blog Table ===== */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title (EN)</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Published</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {blogs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No blogs found
                </td>
              </tr>
            )}

            {blogs.map((blog) => (
              <tr key={blog.id} className="border-t">
                <td className="p-3 font-medium">{blog.title || "—"}</td>

                <td className="p-3 text-gray-500">{blog.slug}</td>

                <td className="p-3 text-center">
                  {blog.published ? "✅ Yes" : "❌ No"}
                </td>

                <td className="p-3 text-right space-x-2">
                  <Link href={`/admin/blogs/${blog.id}`}>
                    <Button size="sm" variant="outline">
                      <Pencil size={14} />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteBlog(blog.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
