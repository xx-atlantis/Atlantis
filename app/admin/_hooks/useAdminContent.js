"use client";
import { useState, useEffect } from "react";

export default function useAdminContent(page) {
  const [data, setData] = useState(null); // { hero: {en,ar}, howItWorks: {…} }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!page) return; // prevent empty calls

    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/admin/content?page=${page}`, {
          cache: "no-store",
        });

        const json = await res.json();

        if (!json.success) {
          setData({});
          setLoading(false);
          return;
        }

        setData(json.data ?? {});
      } catch (err) {
        console.error("Admin content fetch failed:", err);
        setData(null);
      }

      setLoading(false);
    };

    fetchData();
  }, [page]);

  return { data, loading };
}
