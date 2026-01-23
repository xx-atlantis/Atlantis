"use client";

import { createContext, useContext, useEffect, useState } from "react";
import LoadingScreen from "../components/Loading";

const PageContentContext = createContext(null);

export function PageContentProvider({ page, locale, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/content?page=${page}&locale=${locale}`);
        if (!res.ok) throw new Error("Failed to fetch page content");

        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, locale]);

  console.log("PageContentProvider Data:", data);

  // 🔥 GLOBAL LOADER HANDLING
  if (loading) return <LoadingScreen />;

  // 🔥 GLOBAL ERROR HANDLING
  if (error)
    return (
      <div className="text-center text-red-600 py-20 font-semibold">
        {error}
      </div>
    );

  return (
    <PageContentContext.Provider value={{ data }}>
      {children}
    </PageContentContext.Provider>
  );
}

export const usePageContent = () => useContext(PageContentContext);
