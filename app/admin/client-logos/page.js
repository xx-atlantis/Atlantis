"use client";

import { useState, useEffect } from "react";
import { Trash2, GripVertical, Plus, Loader2, Save } from "lucide-react";
import Image from "next/image";
import MediaPicker from "@/app/admin/_components/MediaPicker";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientLogosAdmin() {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [adding, setAdding] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  useEffect(() => {
    fetch("/api/admin/client-logos")
      .then((r) => r.json())
      .then(({ data }) => setLogos(data || []))
      .catch(() => toast.error("Failed to load logos"))
      .finally(() => setLoading(false));
  }, []);

  const addLogo = async () => {
    if (!newUrl) return toast.error("Please select an image first");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/client-logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, alt: newAlt }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setLogos((prev) => [...prev, json.data]);
      setNewUrl("");
      setNewAlt("");
      toast.success("Logo added!");
    } catch (err) {
      toast.error(err.message || "Failed to add logo");
    } finally {
      setAdding(false);
    }
  };

  const deleteLogo = async (id) => {
    if (!confirm("Remove this logo?")) return;
    try {
      const res = await fetch("/api/admin/client-logos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setLogos((prev) => prev.filter((l) => l.id !== id));
      toast.success("Logo removed");
    } catch (err) {
      toast.error(err.message || "Failed to remove logo");
    }
  };

  const saveOrder = async () => {
    try {
      const res = await fetch("/api/admin/client-logos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logos }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Order saved!");
    } catch (err) {
      toast.error(err.message || "Failed to save order");
    }
  };

  // Drag-and-drop reorder
  const onDragStart = (i) => setDragIdx(i);
  const onDragOver = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const updated = [...logos];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(i, 0, moved);
    setLogos(updated);
    setDragIdx(i);
  };
  const onDragEnd = () => setDragIdx(null);

  return (
    <main className="min-h-screen bg-[#fafafa] p-8">
      <ToastContainer position="bottom-right" theme="light" />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Logos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the logos displayed in the scrolling carousel on the homepage.
          </p>
        </div>
        <button
          onClick={saveOrder}
          className="flex items-center gap-2 bg-[#2D3247] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1e2231] transition"
        >
          <Save size={16} /> Save Order
        </button>
      </div>

      {/* ── Add new logo ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4 text-lg">Add New Logo</h2>
        <div className="flex gap-6 items-end flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <MediaPicker
              label="Logo Image"
              value={newUrl}
              onChange={setNewUrl}
              aspect="auto"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Company Name (alt text)
            </label>
            <input
              value={newAlt}
              onChange={(e) => setNewAlt(e.target.value)}
              placeholder="e.g. Saudi Aramco"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
            />
          </div>
          <button
            onClick={addLogo}
            disabled={adding || !newUrl}
            className="flex items-center gap-2 bg-[#6D9494] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#5a7e7e] disabled:opacity-50 transition"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add Logo
          </button>
        </div>
      </div>

      {/* ── Logo grid ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : logos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No logos yet. Add your first client logo above.
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">Drag rows to reorder, then click Save Order.</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {logos.map((logo, i) => (
              <div
                key={logo.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={(e) => onDragOver(e, i)}
                onDragEnd={onDragEnd}
                className={`flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 cursor-grab active:cursor-grabbing transition ${
                  dragIdx === i ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <GripVertical size={18} className="text-gray-300 shrink-0" />
                <div className="w-24 h-12 relative rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                  <Image
                    src={logo.url}
                    alt={logo.alt || "Client logo"}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1">
                  <input
                    value={logo.alt}
                    onChange={(e) =>
                      setLogos((prev) =>
                        prev.map((l) => (l.id === logo.id ? { ...l, alt: e.target.value } : l))
                      )
                    }
                    placeholder="Company name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
                  />
                </div>
                <span className="text-xs text-gray-400 shrink-0">#{i + 1}</span>
                <button
                  onClick={() => deleteLogo(logo.id)}
                  className="text-red-400 hover:text-red-600 shrink-0 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
