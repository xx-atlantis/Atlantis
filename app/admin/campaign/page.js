"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, Users, Mail, Tag, MousePointerClick, Palette } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CampaignPage() {
  const [customerCount, setCustomerCount] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    subject: "",
    bodyText: "",
    recipientMode: "all",
    customEmails: "",
    promoCode: "",
    ctaText: "",
    ctaUrl: "",
    primaryColor: "#2D3247",
  });

  useEffect(() => {
    fetch("/api/admin/campaign")
      .then((r) => r.json())
      .then(({ customerCount }) => setCustomerCount(customerCount))
      .catch(() => {});
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const send = async () => {
    if (!form.subject.trim() || !form.bodyText.trim()) {
      toast.error("Subject and body are required");
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Send failed");
      setResult(json);
      toast.success(`Campaign sent! ${json.sent}/${json.total} delivered.`);
    } catch (err) {
      toast.error(err.message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] p-8 space-y-6">
      <ToastContainer position="bottom-right" theme="light" />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaign</h1>
          <p className="text-sm text-gray-500 mt-1">
            Compose and send a promotional email to your customers.
          </p>
        </div>
        <button
          onClick={send}
          disabled={sending}
          className="flex items-center gap-2 bg-[#2D3247] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1e2231] disabled:opacity-60 transition"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? "Sending…" : "Send Campaign"}
        </button>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`rounded-2xl p-4 border ${result.failed === 0 ? "bg-green-50 border-green-200 text-green-800" : "bg-yellow-50 border-yellow-200 text-yellow-800"}`}>
          <p className="font-semibold">Campaign complete</p>
          <p className="text-sm mt-0.5">
            {result.sent} sent · {result.failed} failed · {result.total} total recipients
          </p>
          {result.errors?.length > 0 && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer font-medium">View errors</summary>
              <ul className="mt-1 space-y-0.5">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: compose */}
        <div className="lg:col-span-2 space-y-4">
          {/* Subject */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Mail size={16} /> Email Content
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Subject Line</label>
              <input
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="🎉 Exclusive offer just for you!"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Body Message
              </label>
              <textarea
                rows={8}
                value={form.bodyText}
                onChange={(e) => set("bodyText", e.target.value)}
                placeholder="Hi there,&#10;&#10;We have an exciting offer for you...&#10;&#10;Use the code below to save on your next order!"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247] resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">Plain text — line breaks will be preserved.</p>
            </div>
          </div>

          {/* Optional blocks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Tag size={16} /> Promo Code (optional)
            </h2>
            <input
              value={form.promoCode}
              onChange={(e) => set("promoCode", e.target.value.toUpperCase())}
              placeholder="SAVE20"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247] uppercase"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <MousePointerClick size={16} /> Call-to-Action Button (optional)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Button Text</label>
                <input
                  value={form.ctaText}
                  onChange={(e) => set("ctaText", e.target.value)}
                  placeholder="Shop Now"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Button URL</label>
                <input
                  value={form.ctaUrl}
                  onChange={(e) => set("ctaUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Palette size={16} /> Brand Color
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border border-gray-200"
              />
              <input
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                placeholder="#2D3247"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right: recipients */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users size={16} /> Recipients
            </h2>

            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="all"
                  checked={form.recipientMode === "all"}
                  onChange={() => set("recipientMode", "all")}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-medium">All customers</span>
                  {customerCount !== null && (
                    <span className="ml-1 text-gray-400">({customerCount} emails)</span>
                  )}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="custom"
                  checked={form.recipientMode === "custom"}
                  onChange={() => set("recipientMode", "custom")}
                  className="mt-0.5"
                />
                <span className="text-sm font-medium">Custom list</span>
              </label>
            </div>

            {form.recipientMode === "custom" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Email addresses (one per line or comma-separated)
                </label>
                <textarea
                  rows={6}
                  value={form.customEmails}
                  onChange={(e) => set("customEmails", e.target.value)}
                  placeholder="user@example.com&#10;another@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247] resize-none"
                />
              </div>
            )}
          </div>

          {/* Mini preview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="font-semibold text-gray-800 text-sm">Preview</h2>
            <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
              <div className="py-2 px-3 text-white text-center font-semibold" style={{ backgroundColor: form.primaryColor }}>
                {form.subject || "Your subject line"}
              </div>
              <div className="p-3 text-gray-600 bg-gray-50 whitespace-pre-wrap">
                {form.bodyText?.slice(0, 120) || "Your message…"}{form.bodyText?.length > 120 ? "…" : ""}
              </div>
              {form.promoCode && (
                <div className="py-2 px-3 text-center border-t border-dashed border-gray-200">
                  <span className="font-bold tracking-widest" style={{ color: form.primaryColor }}>{form.promoCode}</span>
                </div>
              )}
              {form.ctaText && (
                <div className="py-2 px-3 text-center border-t border-gray-100">
                  <span className="inline-block text-white text-xs px-3 py-1 rounded font-semibold" style={{ backgroundColor: form.primaryColor }}>
                    {form.ctaText}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
