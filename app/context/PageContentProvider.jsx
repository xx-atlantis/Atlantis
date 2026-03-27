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
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, locale]);

  if (loading) return <LoadingScreen />;

  if (error)
    return (
      <div className="text-center text-red-600 py-20 font-semibold">
        {error}
      </div>
    );

  return (
    <PageContentContext.Provider value={{ data, loading, error }}>
      {children}
    </PageContentContext.Provider>
  );
}

export const usePageContent = () => useContext(PageContentContext);
