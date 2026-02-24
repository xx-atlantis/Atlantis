"use client";

import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] py-10 animate-fadeIn">
      {/* Loading Image */}
      <div className="animate-bounce-slow">
        <Image
          src="/logo.png"
          alt="Loading..."
          width={90}
          height={90}
          className="rounded-full animate-spin-slow"
        />
      </div>
    </div>
  );
}
