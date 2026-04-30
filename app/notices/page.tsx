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
    const params = new URLSearchParams(window.location.search);
    const isDebug = params.get("debug") === "true" || params.get("showAll") === "true";
    setDebugMode(isDebug);

    fetch(`/api/notices${window.location.search}`)
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        :root {
          --bg: #eef0f4;
          --surface: #ffffff;
          --surface-hover: #f7f8fb;
          --border: #e2e5ea;
          --border-strong: #c8cdd6;
          --text: #111827;
          --text-muted: #6b7280;
          --text-faint: #9ca3af;
          --blue: #1d4ed8;
          --red: #dc2626;
          --amber: #d97706;
          --green: #16a34a;
          --green-bg: rgba(22,163,74,0.08);
          --shadow-card: 0 2px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05);
          --shadow-card-hover: 0 6px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
          --shadow-card-open: 0 8px 28px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .notices-root {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Subtle right-side background decoration ── */
        .notices-root::before {
          content: '';
          position: fixed;
          top: 0;
          right: 0;
          width: 38vw;
          height: 100vh;
          background:
            radial-gradient(ellipse 60% 50% at 80% 30%, rgba(99,130,220,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 90% 75%, rgba(139,92,246,0.07) 0%, transparent 65%),
            linear-gradient(160deg, rgba(224,231,255,0.18) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .notices-root::after {
          content: '';
          position: fixed;
          top: 56px;
          right: 0;
          width: 38vw;
          height: 100vh;
          background-image:
            radial-gradient(circle, rgba(100,116,180,0.13) 1.5px, transparent 1.5px);
          background-size: 28px 28px;
          mask-image: linear-gradient(to left, rgba(0,0,0,0.55) 0%, transparent 80%);
          -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.55) 0%, transparent 80%);
          pointer-events: none;
          z-index: 0;
        }

        .notices-bg {
          position: fixed;
          inset: 0;
          background: var(--bg);
          z-index: -1;
        }

        .notices-main {
          margin-left: 240px;
          padding-top: 56px;
          position: relative;
          z-index: 1;
        }

        .notices-inner {
          padding: 28px 32px 48px;
          max-width: 760px;
        }

        /* ── Page Header ── */
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--border);
        }

        .page-eyebrow {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-faint);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 4px;
        }

        .page-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.3px;
        }

        .live-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          background: var(--green-bg);
          border: 1px solid rgba(22,163,74,0.2);
          padding: 6px 12px;
          border-radius: 6px;
        }

        .live-dot-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 8px;
          height: 8px;
        }

        .live-dot-ping {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--green);
          animation: ping 1.4s cubic-bezier(0,0,0.2,1) infinite;
          opacity: 0.45;
        }

        .live-dot-solid {
          position: relative;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--green);
          display: inline-block;
        }

        .live-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--green);
          letter-spacing: 0.3px;
        }

        /* ── Debug Panel ── */
        .debug-panel {
          background: #0d1a0d;
          border: 1px solid rgba(74,222,128,0.18);
          border-left: 3px solid #22c55e;
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 16px;
          font-family: 'IBM Plex Mono', monospace;
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
          line-height: 1.6;
        }

        .debug-panel-footer {
          font-size: 10px;
          color: rgba(74,222,128,0.55);
          padding-top: 8px;
          border-top: 1px solid rgba(74,222,128,0.1);
        }

        .debug-panel-footer a { color: #4ade80; text-decoration: underline; }

        /* ── Search ── */
        .search-section { margin-bottom: 14px; }

        .search-wrap { position: relative; }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          color: var(--text-faint);
          pointer-events: none;
          line-height: 1;
        }

        .search-input {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 38px 10px 36px;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          color: var(--text);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-shadow: var(--shadow-card);
        }

        .search-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(29,78,216,0.1), var(--shadow-card);
        }

        .search-input::placeholder { color: var(--text-faint); }

        .search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--text-muted);
          cursor: pointer;
          line-height: 1;
          transition: background 0.12s;
        }

        .search-clear:hover { background: var(--border); }

        .search-hint {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-faint);
          margin: 6px 0 0 2px;
        }

        .search-hint strong { color: var(--red); font-weight: 500; }

        /* ── Patch Banners ── */
        .patch-banners {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* ── Feed Meta ── */
        .feed-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 0 2px;
        }

        .feed-meta-text {
          font-size: 11.5px;
          color: var(--text-faint);
          font-weight: 500;
        }

        /* ── Notice Feed — individual cards with gap ── */
        .notice-feed {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Skeleton */
        .skeleton-item {
          padding: 18px 20px;
          border-radius: 10px;
          background: var(--surface);
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: var(--shadow-card);
        }

        .skel-line {
          height: 10px;
          background: linear-gradient(90deg, #edf0f4 25%, #f4f6f9 50%, #edf0f4 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty State */
        .empty-state {
          padding: 56px 0;
          text-align: center;
          background: var(--surface);
          border-radius: 12px;
          box-shadow: var(--shadow-card);
        }

        .empty-icon { font-size: 32px; margin-bottom: 10px; opacity: 0.2; display: block; }

        .empty-text { font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px; }

        .empty-clear {
          font-size: 12px;
          color: var(--blue);
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          font-family: 'Inter', sans-serif;
        }

        /* ── Notice Card — standalone card ── */
        .notice-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-card);
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }

        .notice-card:hover {
          box-shadow: var(--shadow-card-hover);
          transform: translateY(-1px);
          border-color: var(--border-strong);
        }

        .notice-card.expanded {
          box-shadow: var(--shadow-card-open);
          border-color: var(--border-strong);
          transform: translateY(-1px);
        }

        .notice-toggle-btn {
          width: 100%;
          text-align: left;
          padding: 16px 20px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: background 0.12s;
        }

        .notice-toggle-btn:hover { background: var(--surface-hover); }

        .notice-accent-bar {
          width: 3px;
          border-radius: 2px;
          flex-shrink: 0;
          align-self: stretch;
          min-height: 40px;
        }

        .notice-meta-col { flex: 1; min-width: 0; }

        .notice-top-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .notice-title-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notice-new-badge {
          font-size: 9px;
          font-weight: 700;
          background: var(--green-bg);
          color: var(--green);
          border: 1px solid rgba(22,163,74,0.2);
          padding: 2px 7px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          flex-shrink: 0;
        }

        .notice-bottom-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notice-author-chip {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .notice-sep {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--border-strong);
          flex-shrink: 0;
        }

        .notice-date {
          font-size: 11px;
          color: var(--text-faint);
          font-family: 'IBM Plex Mono', monospace;
        }

        .notice-chevron {
          color: var(--border-strong);
          font-size: 9px;
          transition: transform 0.28s cubic-bezier(0.34,1.2,0.64,1), color 0.15s;
          flex-shrink: 0;
        }

        .notice-chevron.open {
          transform: rotate(180deg);
          color: var(--text-muted);
        }

        /* ── Animated body ── */
        .notice-body-wrap {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.28s cubic-bezier(0.4,0,0.2,1);
        }

        .notice-body-wrap.open {
          grid-template-rows: 1fr;
        }

        .notice-body-overflow {
          overflow: hidden;
        }

        .notice-body {
          border-top: 1px solid var(--border);
          background: #f8f9fb;
        }

        .notice-body-inner {
          padding: 16px 20px 18px 37px;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.22s ease 0.05s, transform 0.22s ease 0.05s;
        }

        .notice-body-wrap.open .notice-body-inner {
          opacity: 1;
          transform: translateY(0);
        }

        .notice-content-text {
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.72;
          margin: 0;
        }

        /* ── Footer ── */
        .notices-footer {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: var(--text-faint);
        }

        .notices-footer a {
          color: transparent;
          font-size: 10px;
          text-decoration: none;
        }

        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        /* ── Card entrance animation ── */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .notice-card {
          animation: cardIn 0.3s ease both;
        }

        .notice-card:nth-child(1) { animation-delay: 0ms; }
        .notice-card:nth-child(2) { animation-delay: 50ms; }
        .notice-card:nth-child(3) { animation-delay: 100ms; }
        .notice-card:nth-child(4) { animation-delay: 150ms; }
        .notice-card:nth-child(5) { animation-delay: 200ms; }
        .notice-card:nth-child(6) { animation-delay: 250ms; }
        .notice-card:nth-child(7) { animation-delay: 300ms; }
        .notice-card:nth-child(8) { animation-delay: 350ms; }
      `}</style>

      <div className="notices-root">
        <div className="notices-bg" />
        <Navbar />
        <div className="notices-main">
          <main className="notices-inner">

            {/* ── Page Header ── */}
            <div className="page-header">
              <div className="page-header-left">
                <p className="page-eyebrow">Tagore International · Official Bulletin</p>
                <h1 className="page-title">Notice Board</h1>
              </div>
              <div className="live-pill">
                <span className="live-dot-wrap">
                  <span className="live-dot-ping" />
                  <span className="live-dot-solid" />
                </span>
                <span className="live-label">Live</span>
              </div>
            </div>

            {/* ── Debug Panel ──
                VULNERABILITY: Debug panel — activated via ?debug=true in the URL */}
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
            <div className="search-section">
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
            </div>

            {/* ── Patch Banners ── */}
            <div className="patch-banners">
              {patchedVulns.has("xss_notices") && <PatchedBanner label="XSS — NOTICE BOARD" />}
              {patchedVulns.has("xss_dom") && <PatchedBanner label="XSS — DOM / HASH" />}
            </div>

            <div id="filter-display" className="text-sm text-gray-500 mb-4" />

            {/* ── Notice Feed ── */}
            {!loading && (
              <div className="feed-meta">
                <span className="feed-meta-text">
                  {filtered.length} notice{filtered.length !== 1 ? "s" : ""}
                </span>
                <span className="feed-meta-text">
                  Updated {new Date().toLocaleTimeString("en-IN")}
                </span>
              </div>
            )}

            <div className="notice-feed">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton-item">
                    <div className="skel-line" style={{ width: `${45 + i * 10}%` }} />
                    <div className="skel-line" style={{ width: "22%" }} />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📑</span>
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
                <span>Tagore International School</span>
                <span>Official Bulletin Board</span>
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
    if (author === "admin") return "#b91c1c";
    if (author === "principal") return "#b45309";
    return "#1b3f7a";
  };

  const accent = getAccent(notice.author);

  return (
    <div className={`notice-card${isExpanded ? " expanded" : ""}`}>
      <button onClick={onToggle} className="notice-toggle-btn">
        <span className="notice-accent-bar" style={{ background: accent }} />

        <div className="notice-meta-col">
          <div className="notice-top-row">
            {isXssPatched ? (
              <h3 className="notice-title-text">{notice.title}</h3>
            ) : (
              <h3
                className="notice-title-text"
                dangerouslySetInnerHTML={{ __html: highlightFn(notice.title, highlight) }}
              />
            )}
            {isNew && <span className="notice-new-badge">New</span>}
          </div>

          <div className="notice-bottom-row">
            {isXssPatched ? (
              <span
                className="notice-author-chip"
                style={{
                  background: accent + "15",
                  color: accent,
                  border: `1px solid ${accent}28`,
                }}
              >
                {notice.author}
              </span>
            ) : (
              <span
                className="notice-author-chip"
                style={{
                  background: accent + "15",
                  color: accent,
                  border: `1px solid ${accent}28`,
                }}
                dangerouslySetInnerHTML={{ __html: notice.author }}
              />
            )}
            <span className="notice-sep" />
            <span className="notice-date">
              {new Date(notice.created_at).toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>

        <span className={`notice-chevron${isExpanded ? " open" : ""}`}>▼</span>
      </button>

      <div className={`notice-body-wrap${isExpanded ? " open" : ""}`}>
        <div className="notice-body-overflow">
          <div className="notice-body">
            <div className="notice-body-inner">
              {isXssPatched ? (
                <p className="notice-content-text">{notice.content}</p>
              ) : (
                <p
                  className="notice-content-text"
                  dangerouslySetInnerHTML={{ __html: highlightFn(notice.content, highlight) }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}