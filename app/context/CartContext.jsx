"use client";

import { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";

export const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isInitialMount = useRef(true);

  // 🛡️ Helper to ensure we always work with an array
  // This prevents the ".reduce is not a function" error in Header
  const safeCart = useMemo(() => (Array.isArray(cartItems) ? cartItems : []), [cartItems]);

  // 🟦 1. Load cart from LocalStorage safely on Mount
  useEffect(() => {
    const stored = localStorage.getItem("cart");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        // CASE 1: Package Checkout → Keep shop context state empty []
        if (parsed?.cartType === "package") {
          setCartItems([]);
        }
        // CASE 2: Valid shop-cart (array)
        else if (Array.isArray(parsed)) {
          setCartItems(parsed);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Cart parse error:", err);
        setCartItems([]);
      }
    }
    isInitialMount.current = false;
  }, []);

  // 🟦 2. Sync shop cart to LocalStorage
  useEffect(() => {
    if (isInitialMount.current) return;

    const existingData = localStorage.getItem("cart");
    let isPackage = false;
    try {
      const parsed = JSON.parse(existingData);
      isPackage = parsed?.cartType === "package";
    } catch (e) {}

    // If a package is being processed, don't let the shop state overwrite it
    if (isPackage) return;

    // Sync only if it's a valid array
    if (Array.isArray(cartItems)) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // 🟩 Add Product to Cart (Shop)
  const addToCart = (product, qty) => {
    // Adding a shop item overrides any package checkout
    const existingData = localStorage.getItem("cart");
    try {
        if (JSON.parse(existingData)?.cartType === "package") {
            localStorage.removeItem("cart");
        }
    } catch(e) {}

    setCartItems((prev) => {
      const currentItems = Array.isArray(prev) ? prev : [];
      const existing = currentItems.find(
        (i) => i.id === product.id && i.variant?.value === product.variant?.value
      );

      if (existing) {
        return currentItems.map((i) =>
          i.id === product.id && i.variant?.value === product.variant?.value
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...currentItems, { ...product, quantity: qty }];
    });

    setIsCartOpen(true);
  };

  // 🟩 Remove item
  const removeFromCart = (id, variant = null) =>
    setCartItems((prev) => {
      const currentItems = Array.isArray(prev) ? prev : [];
      return currentItems.filter((i) =>
        variant
          ? !(i.id === id && i.variant?.value === variant?.value)
          : i.id !== id
      );
    });

  // 🟩 Update quantity
  const updateQuantity = (id, qty, variant = null) =>
    setCartItems((prev) => {
      const currentItems = Array.isArray(prev) ? prev : [];
      return currentItems.map((i) =>
        variant
          ? i.id === id && i.variant?.value === variant?.value
            ? { ...i, quantity: qty }
            : i
          : i.id === id
          ? { ...i, quantity: qty }
          : i
      );
    });

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        cartItems: safeCart, // Always return an array to components
        addToCart,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        toggleCart,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};