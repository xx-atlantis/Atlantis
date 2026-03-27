"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

  // Always render children immediately — never block with a full-page loader.
  // The hero is server-rendered and must be visible on first paint.
  // Consumers use `loading` / optional-chaining to handle their own empty states.
  return (
    <PageContentContext.Provider value={{ data, loading, error }}>
      {children}
    </PageContentContext.Provider>
  );
}

export const usePageContent = () => useContext(PageContentContext);
