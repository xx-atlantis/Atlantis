"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Sync check: If middleware redirected with ?logout=true, clear everything
  useEffect(() => {
    if (searchParams.get("logout") === "true") {
      logout();
      router.replace(window.location.pathname); // Clean URL
    }
  }, [searchParams]);

  useEffect(() => {
    async function validateSession() {
      try {
        const saved = localStorage.getItem("customer");
        
        // Call your "me" or validation endpoint
        const res = await fetch("/api/auth/me"); // Replace with your customer check endpoint
        
        if (res.ok) {
          const data = await res.json();
          setCustomer(data.customer);
          localStorage.setItem("customer", JSON.stringify(data.customer));
        } else {
          // If server says no session, clear local data
          logout();
        }
      } catch (err) {
        console.error("Validation error:", err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    validateSession();
  }, []);

  function saveCustomer(data) {
    setCustomer(data);
    localStorage.setItem("customer", JSON.stringify(data));
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {}
    setCustomer(null);
    localStorage.removeItem("customer");
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, saveCustomer, logout, loading }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}