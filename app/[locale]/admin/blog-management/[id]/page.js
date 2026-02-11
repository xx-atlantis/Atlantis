"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogEditor from "@/app/components/admin/BlogEditor";

export default function EditBlogPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const en = await fetch(`/api/blog/${id}?locale=en`).then((r) => r.json());
      const ar = await fetch(`/api/blog/${id}?locale=ar`).then((r) => r.json());
      setData({ en, ar });
    }
    load();
  }, [id]);

  if (!data) return <p className="p-6">Loading blog...</p>;

  return <BlogEditor mode="edit" blogId={id} initialData={data} />;
}
