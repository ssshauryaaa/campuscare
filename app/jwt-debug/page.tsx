"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ShieldAlert, Terminal, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { usePatchedVulns } from "@/hooks/useCampusDefense";
import { PatchedBanner } from "@/components/PatchedBanner";

interface Decoded { header: any; payload: any; sig: string; }

function JsonBlock({ data, title }: { data: any; title: string }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ fontSize:10, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:1.5 }}>{title}</div>
      <pre style={{ padding:14, borderRadius:8, background:"#f5f7fa", border:"1px solid var(--cc-border)", fontFamily:"'DM Mono',monospace", fontSize:11, lineHeight:1.7, overflowX:"auto", margin:0, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
        {JSON.stringify(data, null, 2).split("\n").map((line, i) => {
          const keyMatch = line.match(/^(\s*)"([^"]+)":/);
          if (keyMatch) {
            return (
              <span key={i} style={{ display:"block" }}>
                {keyMatch[1]}
                <span style={{ color:"var(--cc-navy)", fontWeight:600 }}>"{keyMatch[2]}"</span>
                {line.slice(keyMatch[0].length)}
              </span>
            );
          }
          const isStr = line.trim().startsWith('"') || line.includes(': "');
          return (
            <span key={i} style={{ display:"block", color: isStr ? "#16a34a" : "var(--cc-text)" }}>{line}</span>
          );
        })}
      </pre>
    </div>
  );
}

export default function JwtDebugPage() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<Decoded | null>(null);
  const [custom, setCustom] = useState("");
  const [customDec, setCustomDec] = useState<Decoded | null>(null);
  const [verifyRes, setVerifyRes] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editorMode, setEditorMode] = useState<"raw" | "builder">("raw");
  const [builderHeader, setBuilderHeader] = useState("");
  const [builderPayload, setBuilderPayload] = useState("");
  const [builderSig, setBuilderSig] = useState("");
  const patchedVulns = usePatchedVulns();

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) return;
    const t = decodeURIComponent(match[1]);
    setToken(t);
    setDecoded(safeDecode(t));
  }, []);

  const safeDecode = (t: string): Decoded | null => {
    try {
      const p = t.split(".");
      return {
        header:  JSON.parse(atob(p[0].replace(/-/g, "+").replace(/_/g, "/"))),
        payload: JSON.parse(atob(p[1].replace(/-/g, "+").replace(/_/g, "/"))),
        sig: p[2] ?? "",
      };
    } catch { return null; }
  };

  const handleCustomChange = (v: string) => {
    setCustom(v);
    setCustomDec(safeDecode(v));
    setVerifyRes(null);
  };

  const loadIntoBuilder = () => {
    if (decoded) {
      setBuilderHeader(JSON.stringify(decoded.header, null, 2));
      setBuilderPayload(JSON.stringify(decoded.payload, null, 2));
      setBuilderSig(decoded.sig || "");
      setEditorMode("builder");
    }
  };

  const compileBuilder = () => {
    try {
      const hStr = JSON.stringify(JSON.parse(builderHeader));
      const pStr = JSON.stringify(JSON.parse(builderPayload));
      const h = btoa(hStr).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      const p = btoa(pStr).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      const newToken = `${h}.${p}.${builderSig}`;
      handleCustomChange(newToken);
      setEditorMode("raw");
    } catch (e) {
      alert("Invalid JSON in Header or Payload");
    }
  };

  const verify = async () => {
    // If jwt_forge is patched, block the verify and show message
    if (patchedVulns.has("jwt_forge")) {
      setVerifyRes({ valid: false, error: "🛡 JWT forgery patched — the server now rejects the 'none' algorithm and enforces strong secret validation. This attack vector is closed." });
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/jwt/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: custom }),
      });
      setVerifyRes(await res.json());
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:960 }}>

          {/* Warning Banner */}
          <div style={{ background:"rgba(245,130,10,0.08)", border:"1.5px solid rgba(245,130,10,0.3)", borderRadius:10, padding:"12px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
            <AlertTriangle style={{ width:18, height:18, color:"var(--cc-orange)", flexShrink:0 }} />
            <p style={{ fontSize:12, fontWeight:700, color:"var(--cc-orange)", margin:0 }}>
              ⚠ Internal Developer Utility — Remove Before Production Deployment
            </p>
          </div>

          {/* Blue Team Patch Banner */}
          {patchedVulns.has("jwt_forge") && (
            <div style={{ marginBottom: 16 }}>
              <PatchedBanner label="JWT FORGERY — NONE ALGORITHM & WEAK SECRET" />
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom:24, display:"flex", flexDirection:"column" as any, gap:4 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ padding:8, background:"rgba(245,130,10,0.1)", borderRadius:8, border:"1px solid rgba(245,130,10,0.2)" }}>
                <Terminal style={{ width:18, height:18, color:"var(--cc-orange)" }} />
              </div>
              <h1 style={{ fontSize:20, fontWeight:900, color:"var(--cc-navy)", margin:0 }}>JWT Debugger</h1>
              <span style={{ padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:800, background:"rgba(220,38,38,0.1)", color:"#dc2626", border:"1px solid rgba(220,38,38,0.2)", textTransform:"uppercase" }}>DEV_ONLY</span>
            </div>
            <p style={{ fontSize:12, color:"var(--cc-text-muted)", margin:0 }}>
              Internal utility for token inspection and signature validation.{" "}
              <span style={{ color:"#dc2626", fontWeight:600 }}>Warning: Remove from production build.</span>
            </p>
          </div>

          {/* Active Token */}
          {token && decoded && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", borderTop:"3px solid var(--cc-navy)", marginBottom:22, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ padding:"12px 20px", borderBottom:"1px solid var(--cc-border)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#f8f9fa" }}>
                <h2 style={{ fontSize:11, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:2, margin:0, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:"var(--cc-navy)", display:"inline-block", animation:"pulse 2s infinite" }}/>
                  Active Session Token
                </h2>
                <code style={{ fontSize:10, color:"var(--cc-text-muted)", fontFamily:"'DM Mono',monospace" }}>HS256 Signed</code>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ padding:14, borderRadius:8, background:"#f5f7fa", border:"1px solid var(--cc-border)", fontFamily:"'DM Mono',monospace", fontSize:11, wordBreak:"break-all", lineHeight:1.6, marginBottom:18 }}>
                  <span style={{ color:"#1d4ed8" }}>{token.split(".")[0]}</span>
                  <span style={{ color:"var(--cc-border)" }}>.</span>
                  <span style={{ color:"#16a34a" }}>{token.split(".")[1]}</span>
                  <span style={{ color:"var(--cc-border)" }}>.</span>
                  <span style={{ color:"#dc2626" }}>{token.split(".")[2]}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"flex-end", marginBottom: 12 }}>
                  <button onClick={loadIntoBuilder} style={{ background:"var(--cc-navy)", color:"#fff", border:"none", borderRadius:6, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                    Load into Interactive Builder
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <JsonBlock data={decoded.header}  title="Header"  />
                  <JsonBlock data={decoded.payload} title="Payload" />
                </div>
              </div>
            </div>
          )}

          {/* Custom Tester + Vector Lab */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
            <div style={{ display:"flex", flexDirection:"column" as any, gap:0 }}>
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", padding:22, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <label style={{ fontSize:10, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:1.5 }}>
                    Custom Token Tester
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditorMode("raw")} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, border: "1px solid var(--cc-border)", background: editorMode === "raw" ? "var(--cc-navy)" : "#fff", color: editorMode === "raw" ? "#fff" : "var(--cc-text)", cursor: "pointer" }}>Raw</button>
                    <button onClick={() => setEditorMode("builder")} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, border: "1px solid var(--cc-border)", background: editorMode === "builder" ? "var(--cc-navy)" : "#fff", color: editorMode === "builder" ? "#fff" : "var(--cc-text)", cursor: "pointer" }}>Builder</button>
                  </div>
                </div>

                {editorMode === "raw" ? (
                  <>
                    <textarea
                      value={custom}
                      onChange={e => handleCustomChange(e.target.value)}
                      rows={4}
                      placeholder="Paste JWT here..."
                      style={{ width:"100%", border:"1.5px solid var(--cc-border)", borderRadius:8, padding:"11px 14px", fontFamily:"'DM Mono',monospace", fontSize:12, color:"var(--cc-text)", outline:"none", resize:"vertical", boxSizing:"border-box", transition:"border-color 0.2s", background:"#fafafa" }}
                      onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")}
                      onBlur={e=>(e.target.style.borderColor="var(--cc-border)")}
                    />
                    {customDec && (
                      <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        <JsonBlock data={customDec.header}  title="Decoded Header"  />
                        <JsonBlock data={customDec.payload} title="Decoded Payload" />
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize:10, fontWeight:700, color:"var(--cc-text-muted)" }}>HEADER (JSON)</label>
                        <textarea value={builderHeader} onChange={e => setBuilderHeader(e.target.value)} rows={5} style={{ width:"100%", border:"1px solid var(--cc-border)", borderRadius:6, padding:"8px", fontFamily:"'DM Mono',monospace", fontSize:11 }} />
                      </div>
                      <div>
                        <label style={{ fontSize:10, fontWeight:700, color:"var(--cc-text-muted)" }}>PAYLOAD (JSON)</label>
                        <textarea value={builderPayload} onChange={e => setBuilderPayload(e.target.value)} rows={5} style={{ width:"100%", border:"1px solid var(--cc-border)", borderRadius:6, padding:"8px", fontFamily:"'DM Mono',monospace", fontSize:11 }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:10, fontWeight:700, color:"var(--cc-text-muted)" }}>SIGNATURE (leave blank to strip)</label>
                      <input type="text" value={builderSig} onChange={e => setBuilderSig(e.target.value)} style={{ width:"100%", border:"1px solid var(--cc-border)", borderRadius:6, padding:"8px", fontFamily:"'DM Mono',monospace", fontSize:11 }} />
                    </div>
                    <button onClick={compileBuilder} style={{ background:"var(--cc-orange)", color:"#fff", border:"none", borderRadius:6, padding:"8px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Compile Token string</button>
                  </div>
                )}

                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <button
                    onClick={verify}
                    disabled={verifying || !custom}
                    style={{ flex:1, background: verifying||!custom ? "#d1d5db" : "var(--cc-orange)", color:"#fff", border:"none", borderRadius:8, padding:"11px 0", fontSize:13, fontWeight:800, cursor: verifying||!custom?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"background 0.2s" }}
                  >
                    {verifying ? "Verifying…" : <><span>Verify Integrity</span><ExternalLink style={{ width:14, height:14 }} /></>}
                  </button>
                  <button
                    onClick={() => {
                      const cleanToken = custom.trim();
                      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      document.cookie = `token=${cleanToken}; path=/; max-age=86400; SameSite=Lax;`;
                      setCopied(true);
                      setTimeout(() => {
                        setCopied(false);
                        window.location.href = "/dashboard";
                      }, 500);
                    }}
                    style={{ padding:"11px 20px", border:"1.5px solid var(--cc-navy)", borderRadius:8, background:"transparent", color:"var(--cc-navy)", fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}
                    onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.background="var(--cc-navy)";t.style.color="#fff"}}
                    onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.background="transparent";t.style.color="var(--cc-navy)"}}
                  >
                    {copied ? <CheckCircle2 style={{ width:16, height:16, color:"#16a34a" }} /> : "Apply Cookie"}
                  </button>
                </div>

                {verifyRes && (
                  <div style={{ marginTop:16, padding:"12px 16px", borderRadius:8, border:"1.5px solid", fontFamily:"'DM Mono',monospace", fontSize:11, lineHeight:1.6,
                    background: verifyRes.valid ? "rgba(22,163,74,0.06)"  : "rgba(220,38,38,0.06)",
                    borderColor: verifyRes.valid ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)",
                    color:       verifyRes.valid ? "#16a34a"               : "#dc2626",
                  }}>
                    <pre style={{ margin:0, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>{JSON.stringify(verifyRes, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Vector Lab Sidebar */}
            <aside>
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", borderLeft:"4px solid var(--cc-orange)", padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize:11, fontWeight:800, color:"#dc2626", textTransform:"uppercase", letterSpacing:2, marginBottom:18, display:"flex", alignItems:"center", gap:6 }}>
                  <AlertTriangle style={{ width:14, height:14 }} /> ⚠ Attack Vectors
                </h3>

                <div style={{ display:"flex", flexDirection:"column" as any, gap:20 }}>
                  <div>
                    <h4 style={{ fontSize:12, fontWeight:800, color:"var(--cc-navy)", marginBottom:8, textDecoration:"underline", textDecorationColor:"rgba(220,38,38,0.3)" }}>Algorithm Confusion</h4>
                    <ul style={{ fontSize:11, color:"var(--cc-text-muted)", fontFamily:"'DM Mono',monospace", paddingLeft:0, listStyle:"none", margin:0, display:"flex", flexDirection:"column", gap:6 }}>
                      <li>1. alg: &quot;none&quot;</li>
                      <li>2. role: &quot;admin&quot;</li>
                      <li>3. Strip signature</li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ fontSize:12, fontWeight:800, color:"var(--cc-navy)", marginBottom:8, textDecoration:"underline", textDecorationColor:"rgba(202,138,4,0.3)" }}>Secret Recovery</h4>
                    <p style={{ fontSize:10, color:"var(--cc-text-muted)", marginBottom:6 }}>Crack using RockYou:</p>
                    <code style={{ display:"block", background:"var(--cc-navy)", color:"var(--cc-orange)", padding:"8px 12px", borderRadius:6, fontSize:10, fontFamily:"'DM Mono',monospace", wordBreak:"break-all" }}>
                      hashcat -m 16500 jwt.txt rockyou.txt
                    </code>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}