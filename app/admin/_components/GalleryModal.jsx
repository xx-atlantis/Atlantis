"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { X, Search, Check, Loader2, ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";

export default function GalleryModal({ onSelect, onClose }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media?limit=200");
      const data = await res.json();
      setAssets(data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return assets;
    const q = search.toLowerCase();
    return assets.filter(
      (a) =>
        a.url.toLowerCase().includes(q) ||
        (a.filename || "").toLowerCase().includes(q)
    );
  }, [assets, search]);

  const handleDelete = async (e, asset) => {
    e.stopPropagation();
    if (!confirm("Remove from gallery? (This does not delete from Cloudinary)")) return;
    setDeletingId(asset.id);
    await fetch(`/api/media?id=${asset.id}`, { method: "DELETE" });
    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    if (selected?.id === asset.id) setSelected(null);
    setDeletingId(null);
  };

  const handleConfirm = () => {
    if (selected) onSelect(selected.url);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Media Gallery</h2>
            <p className="text-xs text-gray-400 mt-0.5">{assets.length} image{assets.length !== 1 ? "s" : ""} · Click to select</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              title="Refresh"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b shrink-0 bg-gray-50">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename…"
              className="text-sm bg-transparent outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ImageIcon size={36} className="mb-3 opacity-30" />
              <p className="font-medium">
                {search ? "No images match your search" : "No images uploaded yet"}
              </p>
              <p className="text-sm mt-1 text-gray-400">
                {!search && "Images you upload will appear here for reuse."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filtered.map((asset) => {
                const isSel = selected?.id === asset.id;
                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelected(isSel ? null : asset)}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 focus:outline-none ${
                      isSel
                        ? "border-[#2D3247] shadow-lg scale-[0.97]"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={asset.url}
                      alt={asset.filename || "image"}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />

                    {/* Selected overlay */}
                    {isSel && (
                      <div className="absolute inset-0 bg-[#2D3247]/30 flex items-center justify-center">
                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                          <Check size={15} className="text-[#2D3247]" />
                        </div>
                      </div>
                    )}

                    {/* Delete on hover */}
                    <button
                      onClick={(e) => handleDelete(e, asset)}
                      disabled={deletingId === asset.id}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 disabled:opacity-50"
                      title="Remove from gallery"
                    >
                      {deletingId === asset.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Trash2 size={10} />
                      )}
                    </button>

                    {/* Filename tooltip */}
                    {asset.filename && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition">
                        {asset.filename}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">
            {selected ? `Selected: ${selected.filename || selected.url.split("/").pop()}` : "No image selected"}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="px-5 py-2 bg-[#2D3247] text-white text-sm font-semibold rounded-xl hover:bg-[#1e2231] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use this image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
