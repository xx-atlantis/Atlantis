"use client";

import BlogEditor from "@/app/components/admin/BlogEditor";

export default function NewBlogPage() {
  return (
    <BlogEditor
      mode="create"
      initialData={{
        en: null,
        ar: null,
      }}
    />
  );
}
