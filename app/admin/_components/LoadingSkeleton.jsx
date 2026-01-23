"use client";

export default function HeroSkeleton() {
  return (
    <div className="bg-white p-3 rounded-md animate-pulse mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Image */}
      <div className="w-full h-[50vh] bg-gray-200 rounded-xl"></div>

      {/* Text */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
