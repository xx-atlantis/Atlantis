"use client";

import { useEffect, useState, useCallback } from "react";

export function useVerifyCustomer() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to run the verification manually
  const verify = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        setCustomer(null);
        setError(data.error || "Unauthorized");
      } else {
        setCustomer(data.customer);
      }
    } catch (err) {
      setError("Failed to verify user.");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    verify();
  }, [verify]);

  return { customer, loading, error, refresh: verify };
}
