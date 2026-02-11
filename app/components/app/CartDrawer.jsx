"use client";
import React, { useEffect, useState } from "react";
import { Minus, Plus, Trash2, SaudiRiyal } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useLocale } from "@/app/components/LocaleProvider";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";

export const CartDrawer = () => {
  const { locale } = useLocale();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    isCartOpen,
    toggleCart,
    cartItems,
    removeFromCart,
    updateQuantity,
    setCartItems,
  } = useCart();

  const isArabic = locale === "ar";

  const t = {
    en: {
      yourCart: "Your Cart",
      empty: "Your cart is empty",
      emptySub: "Looks like you haven't added anything yet.",
      startShopping: "Start Shopping",
      subtotal: "Subtotal",
      shipping: "Shipping",
      shippingCalc: "Calculated at checkout",
      total: "Total",
      checkout: "Proceed to Checkout",
      variant: "Variant",
      material: "Material",
      validating: "Customer session validating...",
      authSuccess: "Session verified! Redirecting...",
      authError: "Please login to continue.",
    },
    ar: {
      yourCart: "سلة المشتريات",
      empty: "سلتك فارغة",
      emptySub: "يبدو أنك لم تضف أي منتج بعد.",
      startShopping: "ابدأ التسوق",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      shippingCalc: "يُحسب عند الدفع",
      total: "الإجمالي",
      checkout: "إتمام الشراء",
      variant: "الخيار",
      material: "الخامة",
      validating: "جاري التحقق من الجلسة...",
      authSuccess: "تم التحقق! جاري التوجيه...",
      authError: "يرجى تسجيل الدخول للمتابعة.",
    },
  }[locale];

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored && cartItems.length === 0) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  /* =====================================================
      IGNORE PACKAGE CART → Treat as empty cart
  ====================================================== */
  const isPackageCart = cartItems?.cartType === "package";

  // Force displayCart to empty array for package carts
  const displayCart = isPackageCart ? [] : cartItems;

  const subtotal = displayCart.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0
  );

  /* =====================================================
      CHECKOUT WITH TOAST PROMISE
  ====================================================== */
/* =====================================================
      CHECKOUT WITH TOAST PROMISE & REDIRECT LOGIC
  ====================================================== */
  const goToCheckout = async () => {
    if (isVerifying) return;

    const validateSession = async () => {
      const res = await fetch("/api/customer-token");
      const data = await res.json();
      
      if (data.success && data.token) {
        return data;
      } else {
        // Capture current path to return after login
        const currentPath = window.location.pathname;
        // Redirect to login with the redirect param
        router.push(`/${locale}/login?redirect=${encodeURIComponent(currentPath)}`);
        throw new Error("Unauthorized");
      }
    };

    setIsVerifying(true);

    toast.promise(
      validateSession(),
      {
        pending: t.validating,
        success: {
          render() {
            toggleCart(); // Close drawer on success
            router.push(`/${locale}/checkout`);
            return t.authSuccess;
          },
        },
        error: {
          render() {
            setIsVerifying(false);
            return t.authError;
          },
        },
      },
      {
        position: isArabic ? "bottom-center" : "bottom-center",
        autoClose: 3000,
      }
    );
  };

  return (
    <>
      <ToastContainer position="bottom-center" autoClose={3000} theme="light" />
      <Sheet open={isCartOpen} onOpenChange={toggleCart}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>
              {t.yourCart} ({displayCart.length})
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {displayCart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900">{t.empty}</p>
                <p className="text-sm text-gray-500">{t.emptySub}</p>
                <Button variant="link" onClick={toggleCart}>
                  {t.startShopping}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {displayCart.map((item) => (
                <div
                  key={`${item.id}-${item.variant?.value}`}
                  className="flex gap-4"
                >
                  {/* IMAGE */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.coverImage || item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between font-medium text-gray-900 text-sm">
                          <h3 className="line-clamp-1">{item.name}</h3>
                          <p className="flex items-center gap-1">
                            <SaudiRiyal size={12} />
                            {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.category?.[locale] || ""}
                        </p>

                      {/* VARIANT / MATERIAL */}
                      {(item.variant?.value || item.material) && (
                        <p className="mt-1 text-xs text-gray-500">
                          {item.variant?.value
                            ? `${t.variant}: ${item.variant.value}`
                            : ""}
                          {item.material
                            ? `  •  ${t.material}: ${item.material}`
                            : ""}
                        </p>
                      )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-md h-8">
                          <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1),
                              item.variant
                            )
                          }
                            className="px-2 hover:bg-gray-100 h-full flex items-center"
                          >
                            <Minus size={12} />
                          </button>

                        <span className="px-2 text-xs font-medium">
                          {item.quantity}
                        </span>

                          <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1,
                              item.variant
                            )
                          }
                            className="px-2 hover:bg-gray-100 h-full flex items-center"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                        onClick={() =>
                          removeFromCart(item.id, item.variant || null)
                        }
                          className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {displayCart.length > 0 && (
            <div className="border-t bg-gray-50/50 p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.subtotal}</span>
                <span className="font-medium text-gray-900 flex items-center gap-1">
                  <SaudiRiyal size={14} /> {subtotal.toFixed(2)}
                </span>
              </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t.shipping}</span>
              <span className="text-gray-500">{t.shippingCalc}</span>
            </div>

              <Separator />
              <div className="flex justify-between text-base font-medium">
                <span>{t.total}</span>
                <span className="flex items-center gap-1">
                  <SaudiRiyal size={16} /> {subtotal.toFixed(2)}
                </span>
              </div>

              <Button
                className="w-full text-base py-6 shadow-md"
                onClick={goToCheckout}
                disabled={isVerifying}
              >
                {t.checkout}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
