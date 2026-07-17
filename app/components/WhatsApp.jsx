"use client";

import React from "react";
import Image from "next/image";

export default function WhatsAppFloatingIcon({ 
  phoneNumber = "966537878794", 
  message = "Hello! I have a question about my design project." 
}) {
  
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-2 right-2 z-[9999] flex flex-col items-center group">
      <span className="mb-1.5 px-2 py-0.5 bg-white text-[#25D366] text-xs font-bold rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-100 pointer-events-none whitespace-nowrap">
        Chat with us
      </span>
      <button
        onClick={handleClick}
        aria-label="Contact us on WhatsApp"
        className="relative w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all duration-300 ease-in-out overflow-hidden"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
        <div className="relative w-5 h-5">
          <Image src="/icons/whatsapp.png" alt="WhatsApp" fill sizes="20px" className="object-contain" />
        </div>
      </button>
    </div>
  );
}