"use client";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export const FloatingCartButton = () => {
  const { cartItems, toggleCart, setCartItems } = useCart();

  const [loaded, setLoaded] = useState(false);
  const [isPackageCart, setIsPackageCart] = useState(false);

  // 🔥 Load cart from localStorage on mount
  useEffect(() => {
    if (!loaded) {
      const stored = localStorage.getItem("cart");

      if (stored) {
        const parsed = JSON.parse(stored);

        // 🛑 Detect package-cart → Hide floating button
        if (parsed?.cartType === "package") {
          setIsPackageCart(true);
        } else {
          // Normal cart items array
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            cartItems.length === 0
          ) {
            setCartItems(parsed);
          }
        }
      }

      setLoaded(true);
    }
  }, [loaded, cartItems, setCartItems]);

  // While hydrating
  if (!loaded) return null;

  // 🛑 Package-cart? → No floating button
  if (isPackageCart) return null;

  // If no regular shop-cart items
  if (!Array.isArray(cartItems) || cartItems.length === 0) return null;

  // Total quantity
  const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <button
      onClick={toggleCart}
      className="
        fixed bottom-6 left-6 z-50
        bg-[#2D3247] text-white
        w-14 h-14 rounded-full shadow-xl
        flex items-center justify-center
        hover:bg-[#3b4060] transition
      "
    >
      <div className="relative">
        <ShoppingBag size={26} />
        <span
          className="
            absolute -top-2 -right-2 bg-red-500 text-white
            text-xs rounded-full w-5 h-5 flex items-center justify-center
            font-medium
          "
        >
          {count}
        </span>
      </div>
    </button>
  );
};
