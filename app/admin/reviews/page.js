"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Star, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EMPTY_REVIEW = { name: "", location: "", title: "", text: "" };

export default function AdminReviewsPage() {
  const [tab, setTab] = useState("en");
  const [reviews, setReviews] = useState({ en: [], ar: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [resEn, resAr] = await Promise.all([
          fetch("/api/admin/content?page=home"),
          fetch("/api/admin/content?page=home"),
        ]);
        const jsonEn = await resEn.json();
        const rawEn = jsonEn.data?.reviews?.en;
        const rawAr = jsonEn.data?.reviews?.ar;
        setReviews({
          en: Array.isArray(rawEn?.list) ? rawEn.list : Array.isArray(rawEn) ? rawEn : [],
          ar: Array.isArray(rawAr?.list) ? rawAr.list : Array.isArray(rawAr) ? rawAr : [],
        });
      } catch {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      // Save both locales
      for (const locale of ["en", "ar"]) {
        const res = await fetch("/api/admin/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: "home",
            key: "reviews",
            locale,
            content: { list: reviews[locale] },
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Save failed");
      }
      toast.success("Reviews saved!");
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addReview = () =>
    setReviews((prev) => ({ ...prev, [tab]: [...prev[tab], { ...EMPTY_REVIEW }] }));

  const removeReview = (idx) =>
    setReviews((prev) => ({ ...prev, [tab]: prev[tab].filter((_, i) => i !== idx) }));

  const updateReview = (idx, field, value) =>
    setReviews((prev) => {
      const list = [...prev[tab]];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, [tab]: list };
    });

  const moveReview = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= reviews[tab].length) return;
    setReviews((prev) => {
      const list = [...prev[tab]];
      [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
      return { ...prev, [tab]: list };
    });
  };

  const currentReviews = reviews[tab];

  return (
    <main className="min-h-screen bg-[#fafafa] p-8 space-y-6">
      <ToastContainer position="bottom-right" theme="light" />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the testimonials shown on the homepage. Changes apply immediately after saving.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#2D3247] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1e2231] disabled:opacity-60 transition"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save All"}
        </button>
      </div>

      {/* Language Tabs */}
      <div className="flex gap-2 p-1.5 bg-white border shadow-sm rounded-2xl w-fit">
        {["en", "ar"].map((l) => (
          <button
            key={l}
            onClick={() => setTab(l)}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
              tab === l ? "bg-black text-white" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
          >
            {l === "en" ? "English" : "العربية"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="space-y-4">
          {currentReviews.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border">
              No reviews yet. Click "Add Review" to get started.
            </div>
          )}

          {currentReviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#2D3247] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveReview(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveReview(idx, 1)}
                    disabled={idx === currentReviews.length - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => removeReview(idx)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {tab === "ar" ? "الاسم" : "Name"}
                  </label>
                  <input
                    value={review.name}
                    onChange={(e) => updateReview(idx, "name", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
                    placeholder={tab === "ar" ? "اسم العميل" : "Customer name"}
                    dir={tab === "ar" ? "rtl" : "ltr"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {tab === "ar" ? "الموقع" : "Location"}
                  </label>
                  <input
                    value={review.location}
                    onChange={(e) => updateReview(idx, "location", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
                    placeholder={tab === "ar" ? "مثال: الرياض، المملكة العربية السعودية" : "e.g. Riyadh, Saudi Arabia"}
                    dir={tab === "ar" ? "rtl" : "ltr"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {tab === "ar" ? "عنوان التقييم" : "Review Title"}
                </label>
                <input
                  value={review.title}
                  onChange={(e) => updateReview(idx, "title", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none"
                  placeholder={tab === "ar" ? "عنوان قصير" : "Short headline"}
                  dir={tab === "ar" ? "rtl" : "ltr"}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {tab === "ar" ? "نص التقييم" : "Review Text"}
                </label>
                <textarea
                  rows={3}
                  value={review.text}
                  onChange={(e) => updateReview(idx, "text", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2D3247] outline-none resize-none"
                  placeholder={tab === "ar" ? "ما الذي أعجبه في تجربته..." : "What they loved about their experience..."}
                  dir={tab === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addReview}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-[#2D3247] hover:text-[#2D3247] flex items-center justify-center gap-2 transition font-medium"
          >
            <Plus size={18} />
            {tab === "ar" ? "إضافة تقييم" : "Add Review"}
          </button>
        </div>
      )}
    </main>
  );
}
