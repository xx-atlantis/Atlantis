import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ShopSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
      {/* LEFT SIDEBAR */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" /> {/* Sidebar title */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* RIGHT GRID */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-3 border border-gray-100"
          >
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
