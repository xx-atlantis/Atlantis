"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send, Loader2, Users, Mail, Tag, MousePointerClick, Palette,
  CheckCircle2, XCircle, Clock, Eye, EyeOff, RefreshCw, ChevronDown,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

function StatBadge({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${color}`}>
      <Icon size={15} />
      <span>{value}</span>
      <span className="font-normal opacity-70">{label}</span>
    </div>
  );
}

// ─── Progress Panel ───────────────────────────────────────────────────────────
function ProgressPanel({ progress, onDone }) {
  const listRef = useRef(null);
  const { total, sent, failed, remaining, items, pausing, pauseSecs, done } = progress;
  const pct = total > 0 ? Math.round(((sent + failed) / total) * 100) : 0;

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [items?.length]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      {/* Stats row */}
      <div className="flex flex-wrap gap-2">
        <StatBadge icon={CheckCircle2} label="sent"      value={sent}      color="bg-green-50 border-green-200 text-green-700" />
        <StatBadge icon={XCircle}      label="failed"    value={failed}    color="bg-red-50 border-red-200 text-red-700" />
        <StatBadge icon={Clock}        label="remaining" value={remaining} color="bg-gray-50 border-gray-200 text-gray-600" />
        <StatBadge icon={Users}        label="total"     value={total}     color="bg-blue-50 border-blue-200 text-blue-700" />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{pausing ? `Pausing ${pauseSecs}s before next batch…` : done ? "Complete" : "Sending…"}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${done ? "bg-green-500" : "bg-[#2D3247]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Email list */}
      <div ref={listRef} className="h-56 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2 bg-gray-50 text-xs font-mono">
        {(items || []).map((it, i) => (
          <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded-lg ${it.status === "SENT" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}>
            {it.status === "SENT" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            <span className="truncate flex-1">{it.email}</span>
            <span className="shrink-0 opacity-60">{it.status}</span>
          </div>
        ))}
        {!done && (
          <div className="flex items-center gap-2 px-2 py-1 text-gray-400">
            <Loader2 size={12} className="animate-spin" />
            <span>{pausing ? "Waiting between batches…" : "Processing…"}</span>
          </div>
        )}
      </div>

      {done && (
        <button
          onClick={onDone}
          className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Close progress
        </button>
      )}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab() {
  const [filter, setFilter]   = useState("ALL");
  const [logs, setLogs]       = useState([]);
  const [stats, setStats]     = useState({ sentCount: 0, failedCount: 0, openedCount: 0 });
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);

  const LIMIT = 50;

  const load = async (f = filter, p = page) => {
    setLoading(true);
    try {
      const statusMap = { SENT: "SENT", FAILED: "FAILED", OPENED: "OPENED" };
      const qs = new URLSearchParams({ logs: "1", limit: LIMIT, page: p });
      if (statusMap[f]) qs.set("status", statusMap[f]);
      const res  = await fetch(`/api/admin/campaign?${qs}`);
      const json = await res.json();
      setLogs(json.logs || []);
      setTotal(json.total || 0);
      setStats({ sentCount: json.sentCount || 0, failedCount: json.failedCount || 0, openedCount: json.openedCount || 0 });
    } catch {
      toast.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeFilter = (f) => { setFilter(f); setPage(1); load(f, 1); };
  const changePage   = (p) => { setPage(p); load(filter, p); };

  const filters = [
    { key: "ALL",    label: "All" },
    { key: "SENT",   label: `Sent (${stats.sentCount})` },
    { key: "FAILED", label: `Failed (${stats.failedCount})` },
    { key: "OPENED", label: `Opened (${stats.openedCount})` },
  ];

  const openRate = stats.sentCount > 0 ? ((stats.openedCount / stats.sentCount) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sent",  value: stats.sentCount,   icon: CheckCircle2, cls: "text-green-700 bg-green-50 border-green-100" },
          { label: "Failed",      value: stats.failedCount, icon: XCircle,      cls: "text-red-700 bg-red-50 border-red-100" },
          { label: "Opened",      value: stats.openedCount, icon: Eye,          cls: "text-blue-700 bg-blue-50 border-blue-100" },
          { label: "Open Rate",   value: `${openRate}%`,    icon: MousePointerClick, cls: "text-purple-700 bg-purple-50 border-purple-100" },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`rounded-2xl border p-4 flex flex-col gap-1 ${cls}`}>
            <Icon size={18} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => changeFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === key ? "bg-[#2D3247] text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => load()} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-gray-300" size={28} />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Opened</th>
                <th className="px-4 py-3 text-left">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{log.recipient}</td>
                  <td className="px-4 py-3">
                    {log.status === "SENT" ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full text-xs font-medium">
                        <CheckCircle2 size={11} /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full text-xs font-medium" title={log.errorMsg || ""}>
                        <XCircle size={11} /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.openedAt ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Eye size={11} /> {fmt(log.openedAt)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                        <EyeOff size={11} /> Not opened
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{fmt(log.sentAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{total} records · page {page} of {Math.ceil(total / LIMIT)}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => changePage(page - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => changePage(page + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CampaignPage() {
  const [tab, setTab]               = useState("compose");
  const [customerCount, setCustomerCount] = useState(null);
  const [sending, setSending]       = useState(false);
  const [progress, setProgress]     = useState(null);

  const [form, setForm] = useState({
    subject: "",
    bodyText: "",
    recipientMode: "all",
    customEmails: "",
    promoCode: "",
    ctaText: "",
    ctaUrl: "",
    primaryColor: "#2D3247",
    batchSize: 20,
    batchDelayMs: 3000,
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
    setProgress({ total: 0, sent: 0, failed: 0, remaining: 0, items: [], pausing: false, pauseSecs: 0, done: false });

    try {
      const res = await fetch("/api/admin/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Send failed");
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop(); // keep incomplete chunk

        for (const part of parts) {
          for (const line of part.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            let ev;
            try { ev = JSON.parse(line.slice(6)); } catch { continue; }

            if (ev.type === "start") {
              setProgress((p) => ({ ...p, total: ev.total }));
            } else if (ev.type === "progress") {
              setProgress((p) => ({
                ...p,
                sent: ev.sent,
                failed: ev.failed,
                remaining: ev.remaining,
                items: [...(p?.items || []), { email: ev.email, status: ev.status }],
              }));
            } else if (ev.type === "pause") {
              const secs = Math.round(ev.delayMs / 1000);
              setProgress((p) => ({ ...p, pausing: true, pauseSecs: secs }));
            } else if (ev.type === "resume") {
              setProgress((p) => ({ ...p, pausing: false, pauseSecs: 0 }));
            } else if (ev.type === "done") {
              setProgress((p) => ({ ...p, done: true, pausing: false }));
              toast.success(`Campaign done — ${ev.sent} sent, ${ev.failed} failed`);
            }
          }
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to send campaign");
      setProgress((p) => p ? { ...p, done: true } : null);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] p-8 space-y-6">
      <ToastContainer position="bottom-right" theme="light" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaign</h1>
          <p className="text-sm text-gray-500 mt-1">Compose, send, and track promotional emails.</p>
        </div>
        {tab === "compose" && (
          <button
            onClick={send}
            disabled={sending}
            className="inline-flex items-center gap-2 bg-[#2D3247] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#1e2231] disabled:opacity-60 min-w-[160px]"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sending ? "Sending…" : "Send Campaign"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {[["compose", "Compose"], ["history", "History & Opens"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              tab === key ? "bg-[#2D3247] text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── COMPOSE TAB ── */}
      {tab === "compose" && (
        <div className="space-y-4">
          {/* Live progress */}
          {progress && (
            <ProgressPanel
              progress={progress}
              onDone={() => { setProgress(null); setTab("history"); }}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: compose */}
            <div className="lg:col-span-2 space-y-4">
              {/* Email content */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Mail size={16} /> Email Content</h2>
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
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Body Message</label>
                  <textarea
                    rows={8}
                    value={form.bodyText}
                    onChange={(e) => set("bodyText", e.target.value)}
                    placeholder={"Hi there,\n\nWe have an exciting offer for you...\n\nUse the code below to save on your next order!"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247] resize-y"
                  />
                  <p className="text-xs text-gray-400 mt-1">Plain text — line breaks are preserved.</p>
                </div>
              </div>

              {/* Promo code */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Tag size={16} /> Promo Code (optional)</h2>
                <input
                  value={form.promoCode}
                  onChange={(e) => set("promoCode", e.target.value.toUpperCase())}
                  placeholder="SAVE20"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247] uppercase"
                />
              </div>

              {/* CTA */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2"><MousePointerClick size={16} /> Call-to-Action (optional)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Button Text</label>
                    <input value={form.ctaText} onChange={(e) => set("ctaText", e.target.value)} placeholder="Shop Now" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Button URL</label>
                    <input value={form.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} placeholder="https://…" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247]" />
                  </div>
                </div>
              </div>

              {/* Brand color */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4"><Palette size={16} /> Brand Color</h2>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="w-12 h-12 rounded cursor-pointer border border-gray-200" />
                  <input value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} placeholder="#2D3247" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                </div>
              </div>
            </div>

            {/* Right: recipients + batch settings */}
            <div className="space-y-4">
              {/* Recipients */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Users size={16} /> Recipients</h2>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="radio" name="mode" value="all" checked={form.recipientMode === "all"} onChange={() => set("recipientMode", "all")} className="mt-0.5" />
                    <span className="text-sm">
                      <span className="font-medium">All customers</span>
                      {customerCount !== null && <span className="ml-1 text-gray-400">({customerCount} emails)</span>}
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="radio" name="mode" value="custom" checked={form.recipientMode === "custom"} onChange={() => set("recipientMode", "custom")} className="mt-0.5" />
                    <span className="text-sm font-medium">Custom list</span>
                  </label>
                </div>
                {form.recipientMode === "custom" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Emails (one per line or comma-separated)</label>
                    <textarea rows={6} value={form.customEmails} onChange={(e) => set("customEmails", e.target.value)} placeholder={"user@example.com\nanother@example.com"} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2D3247] resize-none" />
                  </div>
                )}
              </div>

              {/* Batch settings */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <Clock size={15} /> Sending Speed
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Emails per batch <span className="text-gray-400 font-normal">(current: {form.batchSize})</span>
                  </label>
                  <input
                    type="range" min={5} max={50} step={5}
                    value={form.batchSize}
                    onChange={(e) => set("batchSize", Number(e.target.value))}
                    className="w-full accent-[#2D3247]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>5</span><span>50</span></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Delay between batches <span className="text-gray-400 font-normal">(current: {form.batchDelayMs / 1000}s)</span>
                  </label>
                  <input
                    type="range" min={1000} max={30000} step={1000}
                    value={form.batchDelayMs}
                    onChange={(e) => set("batchDelayMs", Number(e.target.value))}
                    className="w-full accent-[#2D3247]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>1s</span><span>30s</span></div>
                </div>
                <p className="text-xs text-gray-400">Slower = less likely to be flagged as spam.</p>
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
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && <HistoryTab />}
    </main>
  );
}
