"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

/**
 * Breadcrumb — renders a simple breadcrumb trail.
 *
 * @param {Array<{ label: string, href?: string }>} items - ordered from root to current
 * @param {boolean} isRTL
 */
export default function Breadcrumb({ items = [], isRTL = false }) {
  if (!items.length) return null;

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <nav
      aria-label="breadcrumb"
      dir={isRTL ? "rtl" : "ltr"}
      className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap"
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <Chevron size={14} className="text-gray-400 flex-shrink-0" />}
            {isLast || !item.href ? (
              <span className={isLast ? "font-medium text-gray-800 truncate max-w-[200px]" : ""}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-[#2D3247] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
