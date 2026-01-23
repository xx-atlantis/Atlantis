"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function SectionCard({ title, right, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-xl bg-white shadow-sm mb-6">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 font-semibold"
        >
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {title}
        </button>

        {right}
      </div>

      {open && <div className="p-5">{children}</div>}
    </div>
  );
}
