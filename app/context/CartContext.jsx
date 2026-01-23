"use client";

import { createContext, useContext, useState, useEffect } from "react";

export const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 🟦 Load cart from LocalStorage safely
  useEffect(() => {
    const stored = localStorage.getItem("cart");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        // 🛑 CASE 1: Package Checkout → Do NOT load into shop cart
        if (parsed?.cartType === "package") {
          setCartItems([]); // empty cart for shop
        }
        // 🛑 CASE 2: Valid shop-cart (must be array)
        else if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
        // 🛑 Fallback
        else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Cart parse error:", err);
        setCartItems([]);
      }
    }
  }, []);

  // 🟦 Sync shop cart to LocalStorage
  useEffect(() => {
    // Only save if it's a normal cart array
    if (Array.isArray(cartItems)) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // 🟩 Add Product to Cart (Shop)
  const addToCart = (product, qty) => {
    setCartItems((prev) => {
      // 🛑 If prev is NOT an array → overwrite (package cart scenario)
      if (!Array.isArray(prev)) prev = [];

      const existing = prev.find(
        (i) =>
          i.id === product.id && i.variant?.value === product.variant?.value
      );

      if (existing) {
        return prev.map((i) =>
          i.id === product.id && i.variant?.value === product.variant?.value
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }

      return [...prev, { ...product, quantity: qty }];
    });

    setIsCartOpen(true);
  };

  // 🟩 Remove item
  const removeFromCart = (id, variant = null) =>
    setCartItems((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.filter((i) =>
        variant
          ? !(i.id === id && i.variant?.value === variant?.value)
          : i.id !== id
      );
    });

  // 🟩 Update quantity
  const updateQuantity = (id, qty, variant = null) =>
    setCartItems((prev) => {
      if (!Array.isArray(prev)) return prev;
      return prev.map((i) =>
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
        cartItems,
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
