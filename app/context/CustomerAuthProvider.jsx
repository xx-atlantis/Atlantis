"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================================
  // LOAD CUSTOMER FROM localStorage
  // ================================
  useEffect(() => {
    try {
      const saved = localStorage.getItem("customer");
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Error loading stored customer:", err);
    }
    setLoading(false);
  }, []);

  // Save after login
  function saveCustomer(data) {
    setCustomer(data);
    localStorage.setItem("customer", JSON.stringify(data));
  }

  // Logout → clear all
  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("logout error:", err);
    }

    setCustomer(null);
    localStorage.removeItem("customer");
  }

  return (
    <CustomerAuthContext.Provider
      value={{ customer, saveCustomer, logout, loading }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
