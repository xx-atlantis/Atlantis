"use client";

import { useParams } from "next/navigation";
import ProjectEditor from "@/app/components/admin/ProjectEditor";

export default function EditProjectPage() {
  const { id } = useParams();

  return <ProjectEditor mode="edit" projectId={id} />;
}
