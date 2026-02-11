import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in">
      {/* BACK BUTTON */}
      <Skeleton className="h-5 w-32 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT GALLERY */}
        <div>
          <Skeleton className="h-[420px] w-full rounded-xl" />

          <div className="grid grid-cols-4 gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* RIGHT INFO */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-24" /> {/* Category */}
          <Skeleton className="h-10 w-3/4" /> {/* Product Name */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" /> {/* Price */}
            <Skeleton className="h-5 w-28" /> {/* Reviews */}
          </div>
          <Skeleton className="h-20 w-full" /> {/* Description */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          {/* Quantity + Add to Cart */}
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
          <div className="flex gap-10 pt-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="border-t border-gray-100 mt-16 pt-12">
        <Skeleton className="h-8 w-48 mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 bg-white shadow border rounded-xl">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4 mt-4" />
              <Skeleton className="h-6 w-20 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
