"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function usePageContent(page, locale) {
  const pathname = usePathname(); // ⬅ detect route

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdminRoute = pathname.includes("/admin"); // ⬅ check admin path

  useEffect(() => {
    if (!page || !locale || isAdminRoute) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/content?page=${page}&locale=${locale}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch content");

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, locale, isAdminRoute]);

  return { data, loading, error };
}
