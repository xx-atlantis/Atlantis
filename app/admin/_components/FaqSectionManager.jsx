"use client";

import { Check, ChevronDown, ChevronUp, CircleQuestionMark, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

// ─── tiny helpers ──────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

function normaliseItems(raw) {
  // raw is the items array (or legacy object)
  if (Array.isArray(raw)) {
    return raw.map((item) => ({ _id: uid(), question: item.question ?? "", answer: item.answer ?? "" }));
  }
  if (raw && typeof raw === "object") {
    return Object.values(raw).map((item) => ({
      _id: uid(),
      question: item.question ?? "",
      answer: item.answer ?? "",
    }));
  }
  return [];
}

function normaliseLocale(raw) {
  // real shape: { smallTitle, mainTitle, items: [...] }
  // fallback: raw is directly an array
  if (!raw) return { smallTitle: "", mainTitle: "", items: [] };
  if (Array.isArray(raw)) return { smallTitle: "", mainTitle: "", items: normaliseItems(raw) };
  return {
    smallTitle: raw.smallTitle ?? "",
    mainTitle: raw.mainTitle ?? "",
    items: normaliseItems(raw.items),
  };
}

function serialiseForSave(meta, items) {
  // Reconstruct the full locale object the API expects
  return {
    smallTitle: meta.smallTitle,
    mainTitle: meta.mainTitle,
    items: items.map(({ question, answer }) => ({ question, answer })),
  };
}

// ─── Single FAQ Row ────────────────────────────────────────────────────────────
function FaqRow({ item, index, total, canUpdate, canDelete, onChange, onDelete, onMove }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="group relative rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle / index badge */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 select-none">
          {index + 1}
        </span>

        {/* Question preview / input */}
        {expanded ? (
          <span className="flex-1 text-sm font-semibold text-slate-400 italic truncate">
            Editing FAQ #{index + 1}
          </span>
        ) : (
          <span className="flex-1 text-sm font-medium text-slate-700 truncate">
            {item.question || <span className="italic text-slate-400">No question yet…</span>}
          </span>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            title="Move up"
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            title="Move down"
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
          >
            <ChevronUp className="w-3.5 h-3.5 rotate-180" />
          </button>

          {canDelete && (
            <button
              onClick={() => onDelete(item._id)}
              title="Delete FAQ"
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          title={expanded ? "Collapse" : "Expand"}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
              Question
            </label>
            <input
              type="text"
              value={item.question}
              readOnly={!canUpdate}
              onChange={(e) => onChange(item._id, "question", e.target.value)}
              placeholder="Enter the FAQ question…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
              Answer
            </label>
            <textarea
              value={item.answer}
              readOnly={!canUpdate}
              onChange={(e) => onChange(item._id, "answer", e.target.value)}
              placeholder="Enter the FAQ answer…"
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FaqSectionManager({
  sectionKey,
  sectionData,
  onSave,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) {
  const [tab, setTab] = useState("en");
  // state shape: { en: { smallTitle, mainTitle, items: [...] }, ar: { ... } }
  const [locales, setLocales] = useState({ en: { smallTitle: "", mainTitle: "", items: [] }, ar: { smallTitle: "", mainTitle: "", items: [] } });
  const [dirty, setDirty] = useState(false);

  // Initialise / sync from parent
  useEffect(() => {
    setLocales({
      en: normaliseLocale(sectionData?.en),
      ar: normaliseLocale(sectionData?.ar),
    });
    setDirty(false);
  }, [sectionData]);

  const current = locales[tab]?.items ?? [];
  const currentMeta = { smallTitle: locales[tab]?.smallTitle ?? "", mainTitle: locales[tab]?.mainTitle ?? "" };

  const setItems = (updater) => {
    setLocales((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: typeof updater === "function" ? updater(prev[tab].items) : updater },
    }));
  };

  const update = (id, field, value) => {
    setItems((items) => items.map((item) => (item._id === id ? { ...item, [field]: value } : item)));
    setDirty(true);
  };

  const addFaq = () => {
    setItems((items) => [...items, { _id: uid(), question: "", answer: "" }]);
    setDirty(true);
  };

  const deleteFaq = (id) => {
    setItems((items) => items.filter((item) => item._id !== id));
    setDirty(true);
  };

  const moveFaq = (index, direction) => {
    setItems((items) => {
      const list = [...items];
      const target = index + direction;
      if (target < 0 || target >= list.length) return list;
      [list[index], list[target]] = [list[target], list[index]];
      return list;
    });
    setDirty(true);
  };

  const handleSave = () => {
    onSave(tab, serialiseForSave(currentMeta, current));
    setDirty(false);
  };

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200">
            <CircleQuestionMark className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              {sectionKey.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-400">
              {current.length} {current.length === 1 ? "item" : "items"} · FAQ Manager
            </p>
          </div>
          {dirty && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved
            </span>
          )}
        </div>

        {/* Locale tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          {["en", "ar"].map((locale) => (
            <button
              key={locale}
              onClick={() => setTab(locale)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                tab === locale
                  ? "bg-black text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {locale === "en" ? "English" : "Arabic"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Meta fields ── */}
      <div className="px-6 pt-4 pb-4 grid grid-cols-2 gap-3 border-b border-slate-100 bg-slate-50/40" dir={tab === "ar" ? "rtl" : "ltr"}>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Small Title</label>
          <input
            type="text"
            value={currentMeta.smallTitle}
            readOnly={!canUpdate}
            onChange={(e) => { setLocales((prev) => ({ ...prev, [tab]: { ...prev[tab], smallTitle: e.target.value } })); setDirty(true); }}
            placeholder="e.g. FAQ"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Main Title</label>
          <input
            type="text"
            value={currentMeta.mainTitle}
            readOnly={!canUpdate}
            onChange={(e) => { setLocales((prev) => ({ ...prev, [tab]: { ...prev[tab], mainTitle: e.target.value } })); setDirty(true); }}
            placeholder="e.g. Let us Help you"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* ── FAQ List ── */}
      <div className={`p-6 space-y-3 ${tab === "ar" ? "dir-rtl" : ""}`} dir={tab === "ar" ? "rtl" : "ltr"}>
        {current.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-500">No FAQs yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add FAQ" to create your first question.</p>
          </div>
        ) : (
          current.map((item, index) => (
            <FaqRow
              key={item._id}
              item={item}
              index={index}
              total={current.length}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onChange={update}
              onDelete={deleteFaq}
              onMove={moveFaq}
            />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={addFaq}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 shadow-sm"
            >
             <Plus className="w-4 h-4" />
              Add FAQ
            </button>
          )}
          <span className="text-xs text-slate-400 italic">
            Editing {sectionKey} / {tab.toUpperCase()}
          </span>
        </div>

        {canUpdate && (
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition-all duration-150 shadow-sm ${
              dirty
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Check className="w-4 h-4" />
            Save {tab.toUpperCase()} Changes
          </button>
        )}
      </div>
    </div>
  );
}