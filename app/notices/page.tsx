"use client";

// TODO: remove debug mode before prod — rverma 12/04
// DEBUG_KEY = "showAll=true" — append to URL to see hidden notices
// Internal API dump: /api/notices?debug=1&token=campuscare_debug_2025

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { logRealAttack } from "@/lib/logAttack";
import { usePatchedVulns } from "@/hooks/useCampusDefense";
import { PatchedBanner } from "@/components/PatchedBanner";

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // VULNERABILITY: debug flag read directly from URL — ?debug=true exposes raw API dump
  const [debugMode, setDebugMode] = useState(false);
  const [rawApiDump, setRawApiDump] = useState<any>(null);
  const patchedVulns = usePatchedVulns();

  useEffect(() => {
    // VULNERABILITY: client-side URL param enables debug features
    // visiting /notices?debug=true or /notices?showAll=true activates it
    const params = new URLSearchParams(window.location.search);
    const isDebug = params.get("debug") === "true" || params.get("showAll") === "true";
    setDebugMode(isDebug);

    fetch("/api/notices")
      .then(r => r.json())
      .then(d => {
        const fetchedNotices = d.notices || [];
        setNotices(fetchedNotices);

        fetchedNotices.forEach((n: any) => {
          if (/<script|onerror|javascript:/i.test(n.content + n.title + n.author)) {
            if (!patchedVulns.has("xss_notices")) {
              logRealAttack({ type: "xss_notices", severity: "critical", detail: "XSS payload detected in stored notice", endpoint: "/notices", payload: n.content });
            }
          }
        });

        // VULNERABILITY: entire raw API response stored and rendered in debug mode
        setRawApiDump(d);
        setLoading(false);
      });

    // VULNERABILITY: reads window.location.hash and writes it into the DOM unsafely
    const hash = window.location.hash.slice(1);
    if (hash) {
      if (/<script|onerror|javascript:/i.test(decodeURIComponent(hash))) {
        if (!patchedVulns.has("xss_dom")) {
          logRealAttack({ type: "xss_dom", severity: "high", detail: "DOM-based XSS via URL hash", endpoint: "/notices", payload: decodeURIComponent(hash) });
        }
      }
      setTimeout(() => {
        const filterEl = document.getElementById("filter-display");
        if (filterEl) {
          if (patchedVulns.has("xss_dom")) {
            filterEl.textContent = `Filtered by: ${decodeURIComponent(hash)}`;
          } else {
            // VULNERABILITY: innerHTML set from URL hash — DOM-based XSS
            filterEl.innerHTML = `Filtered by: ${decodeURIComponent(hash)}`;
          }
        }
      }, 100);
    }
  }, []);

  // VULNERABILITY: highlight function injects filter string raw into innerHTML
  const highlightMatch = (text: string, query: string): string => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "");
    return text.replace(
      new RegExp(`(${escaped})`, "gi"),
      `<mark style="background:rgba(245,130,10,0.18);color:#c2410c;border-radius:2px;padding:0 2px">$1</mark>`
    );
  };

  const filtered = notices.filter(n =>
    !filter ||
    [n.title, n.content, n.author].some(field =>
      field.toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

        .notices-root {
          background: #f4f3ef;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        .notices-main {
          margin-left: 240px;
          padding-top: 56px;
        }

        .notices-inner {
          padding: 40px 36px;
          max-width: 860px;
        }

        /* ── Header ── */
        .notices-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #1a3c6e;
        }

        .notices-header-left {}

        .notices-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #8a8070;
          margin: 0 0 6px;
        }

        .notices-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 34px;
          font-weight: 900;
          color: #1a3c6e;
          margin: 0;
          line-height: 1.1;
          letter-spacing: -0.5px;
        }

        .notices-live-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #fff;
          border: 1.5px solid rgba(22,163,74,0.25);
          padding: 6px 14px;
          border-radius: 24px;
          box-shadow: 0 1px 4px rgba(22,163,74,0.08);
        }

        .live-dot-wrap {
          position: relative;
          display: inline-flex;
          width: 8px;
          height: 8px;
        }

        .live-dot-ping {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #16a34a;
          animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;
          opacity: 0.6;
        }

        .live-dot-solid {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #16a34a;
          display: inline-block;
        }

        .live-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          color: #16a34a;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        /* ── Debug Panel ── */
        .debug-panel {
          background: #0a1a0a;
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 10px;
          padding: 18px 20px;
          margin-bottom: 24px;
          font-family: 'DM Mono', monospace;
        }

        .debug-panel-label {
          font-size: 10px;
          color: #4ade80;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .debug-panel-pre {
          font-size: 11px;
          color: #86efac;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          margin: 0 0 10px;
        }

        .debug-panel-footer {
          font-size: 10px;
          color: #4ade80;
          opacity: 0.7;
        }

        .debug-panel-footer a {
          color: #4ade80;
          text-decoration: underline;
        }

        /* ── Search ── */
        .search-wrap {
          position: relative;
          margin-bottom: 6px;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 15px;
          color: #9a9080;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid #dbd8d0;
          border-radius: 10px;
          padding: 12px 42px 12px 42px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #1a1a1a;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.18s, box-shadow 0.18s;
        }

        .search-input:focus {
          border-color: #1a3c6e;
          box-shadow: 0 0 0 3px rgba(26,60,110,0.08);
        }

        .search-input::placeholder {
          color: #b0a898;
        }

        .search-clear {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 18px;
          color: #9a9080;
          cursor: pointer;
          line-height: 1;
          padding: 0;
        }

        .search-hint {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #9a9080;
          margin: 6px 0 14px 2px;
        }

        .search-hint strong {
          color: #c2410c;
          font-weight: 500;
        }

        /* ── Patch Banners ── */
        .patch-banners {
          margin-bottom: 18px;
        }

        /* ── Notice Feed ── */
        .notice-feed {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1.5px solid #dbd8d0;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
        }

        /* Skeleton */
        .skeleton-item {
          height: 72px;
          background: #fff;
          border-bottom: 1px solid #edeae3;
        }

        .skeleton-item:last-child { border-bottom: none; }

        .skeleton-inner {
          margin: 18px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .skel-line {
          height: 12px;
          background: linear-gradient(90deg, #edeae3 25%, #f4f3ef 50%, #edeae3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty State */
        .empty-state {
          padding: 64px 0;
          text-align: center;
          background: #fff;
        }

        .empty-icon {
          font-size: 38px;
          margin-bottom: 12px;
          opacity: 0.3;
        }

        .empty-text {
          font-size: 14px;
          color: #9a9080;
          margin: 0 0 14px;
        }

        .empty-clear {
          font-size: 12px;
          color: #c2410c;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          font-family: 'DM Mono', monospace;
        }

        /* ── Notice Card ── */
        .notice-card {
          border-bottom: 1px solid #edeae3;
          transition: background 0.15s;
        }

        .notice-card:last-child {
          border-bottom: none;
        }

        .notice-card.expanded {
          background: #fafaf8;
        }

        .notice-toggle-btn {
          width: 100%;
          text-align: left;
          padding: 18px 22px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .notice-toggle-btn:hover {
          background: #f9f8f5;
        }

        .notice-accent-bar {
          width: 3px;
          height: 40px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .notice-meta-col {
          flex: 1;
          min-width: 0;
        }

        .notice-top-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .notice-title-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          letter-spacing: -0.1px;
        }

        .notice-new-badge {
          font-size: 9px;
          font-weight: 700;
          background: rgba(22,163,74,0.09);
          color: #16a34a;
          border: 1px solid rgba(22,163,74,0.2);
          padding: 2px 7px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          flex-shrink: 0;
        }

        .notice-bottom-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notice-author-chip {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 9px;
          border-radius: 20px;
          font-family: 'DM Mono', monospace;
        }

        .notice-date {
          font-size: 11px;
          color: #9a9080;
          font-family: 'DM Mono', monospace;
        }

        .notice-chevron {
          color: #b0a898;
          font-size: 11px;
          transition: transform 0.25s;
          flex-shrink: 0;
        }

        .notice-chevron.open {
          transform: rotate(180deg);
        }

        .notice-body {
          padding: 0 22px 20px 43px;
          border-top: 1px solid #edeae3;
        }

        .notice-body-inner {
          padding-top: 16px;
        }

        .notice-content-text {
          font-size: 13.5px;
          color: #3a3530;
          line-height: 1.75;
          margin: 0;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Footer ── */
        .notices-footer {
          margin-top: 20px;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          font-family: 'DM Mono', monospace;
          color: #b0a898;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .notices-footer a {
          color: #f4f3ef;
          font-size: 10px;
          text-decoration: none;
        }

        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      <div className="notices-root">
        <Navbar />
        <div className="notices-main">
          <main className="notices-inner">

            {/* ── Header ── */}
            <div className="notices-header">
              <div className="notices-header-left">
                <p className="notices-eyebrow">Tagore International · Official Bulletin</p>
                <h1 className="notices-title">Notice Board</h1>
              </div>
              <div className="notices-live-badge">
                <span className="live-dot-wrap">
                  <span className="live-dot-ping" />
                  <span className="live-dot-solid" />
                </span>
                <span className="live-label">Live</span>
              </div>
            </div>

            {/* ── Debug Panel ──
                VULNERABILITY: Debug panel — activated via ?debug=true in the URL
                Dumps the raw API response object to screen including:
                - all field names returned by the API
                - total notice count
                - link to the admin notices endpoint
                Attack: visit /notices?debug=true to see the full API response structure */}
            {debugMode && rawApiDump && (
              <div className="debug-panel">
                <div className="debug-panel-label">⚠ Debug Mode Active — Raw API Response</div>
                <pre className="debug-panel-pre">
                  {JSON.stringify(rawApiDump, null, 2)}
                </pre>
                <div className="debug-panel-footer">
                  {/* VULNERABILITY: directly reveals admin endpoint in debug output */}
                  Admin view available at:{" "}
                  <a href="/api/admin/notices">/api/admin/notices</a>{" "}
                  (requires role: admin in JWT)
                </div>
              </div>
            )}

            {/* ── Search ── */}
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Search bulletin keywords…"
                className="search-input"
              />
              {filter && (
                <button onClick={() => setFilter("")} className="search-clear">×</button>
              )}
            </div>

            {/* VULNERABILITY: Reflected XSS — filter value injected raw into DOM via dangerouslySetInnerHTML */}
            {filter && (
              <div>
                {patchedVulns.has("xss_notices") ? (
                  <p className="search-hint">
                    Searching for: <strong>{filter}</strong>
                  </p>
                ) : (
                  <p
                    className="search-hint"
                    dangerouslySetInnerHTML={{
                      __html: `Searching for: <strong>${filter}</strong>`
                    }}
                  />
                )}
              </div>
            )}

            {/* ── Patch Banners ── */}
            <div className="patch-banners">
              {patchedVulns.has("xss_notices") && <PatchedBanner label="XSS — NOTICE BOARD" />}
              {patchedVulns.has("xss_dom") && <PatchedBanner label="XSS — DOM / HASH" />}
            </div>

            <div id="filter-display" className="text-sm text-gray-500 mb-4" />

            {/* ── Notice Feed ── */}
            <div className="notice-feed">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton-item">
                    <div className="skeleton-inner">
                      <div className="skel-line" style={{ width: "55%" }} />
                      <div className="skel-line" style={{ width: "25%" }} />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📑</div>
                  <p className="empty-text">No bulletins match your current filter.</p>
                  {filter && (
                    <button onClick={() => setFilter("")} className="empty-clear">
                      Clear filter
                    </button>
                  )}
                </div>
              ) : (
                filtered.map(n => (
                  <NoticeCard
                    key={n.id}
                    notice={n}
                    isExpanded={expandedId === n.id}
                    onToggle={() => setExpandedId(expandedId === n.id ? null : n.id)}
                    highlight={filter}
                    highlightFn={highlightMatch}
                    isXssPatched={patchedVulns.has("xss_notices")}
                  />
                ))
              )}
            </div>

            {/* ── Footer ── */}
            {!loading && (
              <footer className="notices-footer">
                <span>{filtered.length} notice{filtered.length !== 1 ? "s" : ""}</span>
                <span>Updated {new Date().toLocaleTimeString("en-IN")}</span>
                {/* VULNERABILITY: [sys] link visible in page source — hints at debug mode */}
                {!debugMode && (
                  <a href="?debug=true" title="sys">[sys]</a>
                )}
              </footer>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function NoticeCard({
  notice, isExpanded, onToggle, highlight, highlightFn, isXssPatched,
}: {
  notice: Notice;
  isExpanded: boolean;
  onToggle: () => void;
  highlight: string;
  highlightFn: (text: string, query: string) => string;
  isXssPatched?: boolean;
}) {
  const isNew = (Date.now() - new Date(notice.created_at).getTime()) < 86400000 * 3;

  const getAccent = (author: string) => {
    if (author === "admin") return "#dc2626";
    if (author === "principal") return "#d97706";
    return "#1a3c6e";
  };

  const accent = getAccent(notice.author);

  return (
    <div className={`notice-card${isExpanded ? " expanded" : ""}`}>
      <button onClick={onToggle} className="notice-toggle-btn">
        {/* Colored accent bar replaces left-border approach for cleaner look */}
        <span className="notice-accent-bar" style={{ background: accent }} />

        <div className="notice-meta-col">
          <div className="notice-top-row">
            {isXssPatched ? (
              /* PATCHED: safe text rendering */
              <h3 className="notice-title-text">{notice.title}</h3>
            ) : (
              /* VULNERABILITY: Reflected XSS via dangerouslySetInnerHTML */
              <h3
                className="notice-title-text"
                dangerouslySetInnerHTML={{ __html: highlightFn(notice.title, highlight) }}
              />
            )}
            {isNew && <span className="notice-new-badge">New</span>}
          </div>

          <div className="notice-bottom-row">
            {isXssPatched ? (
              /* PATCHED: safe span for author */
              <span
                className="notice-author-chip"
                style={{
                  background: accent + "18",
                  color: accent,
                  border: `1px solid ${accent}30`,
                }}
              >
                {notice.author}
              </span>
            ) : (
              /* VULNERABILITY: Stored XSS surface — author field rendered as raw HTML */
              <span
                className="notice-author-chip"
                style={{
                  background: accent + "18",
                  color: accent,
                  border: `1px solid ${accent}30`,
                }}
                dangerouslySetInnerHTML={{ __html: notice.author }}
              />
            )}
            <span className="notice-date">
              {new Date(notice.created_at).toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>

        <span className={`notice-chevron${isExpanded ? " open" : ""}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="notice-body">
          <div className="notice-body-inner">
            {isXssPatched ? (
              /* PATCHED: safe text rendering for content */
              <p className="notice-content-text">{notice.content}</p>
            ) : (
              /* VULNERABILITY: Stored XSS — notice content rendered as raw HTML */
              <p
                className="notice-content-text"
                dangerouslySetInnerHTML={{ __html: highlightFn(notice.content, highlight) }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}