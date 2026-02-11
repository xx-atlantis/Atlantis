"use client";

import React from "react";
import Image from "next/image";

export default function WhatsAppFloatingIcon({ 
  phoneNumber = "966595742424", 
  message = "Hello! I have a question about my design project." 
}) {
  
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-center group">
      {/* Tooltip/Label */}
      <span className="mb-2 px-3 py-1 bg-white text-[#25D366] text-xs font-bold rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-100 pointer-events-none">
        Chat with us
      </span>

      {/* Floating Button */}
      <button
        onClick={handleClick}
        aria-label="Contact us on WhatsApp"
        className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 ease-in-out overflow-hidden"
      >
        {/* Pulse Effect Animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
        
        {/* Custom WhatsApp Icon Image */}
        <div className="relative w-8 h-8">
          <Image 
            src="/icons/whatsapp.png" 
            alt="WhatsApp" 
            fill
            className="object-contain"
          />
        </div>
      </button>
    </div>
  );
}