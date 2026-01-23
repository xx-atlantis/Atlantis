"use client";

import { useAdminAuth } from "@/app/context/AdminAuthContext";

export function useCan(permissionKey) {
  const { permissions } = useAdminAuth();
  return permissions.includes(permissionKey);
}
