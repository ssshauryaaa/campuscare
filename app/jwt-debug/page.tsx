"use client";
// VULNERABILITY: Dev tool left in production — exposes token internals
// Reveals algorithm, weak secret hint, and verifies arbitrary tokens

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Decoded { header: any; payload: any; sig: string; }

function safeDecode(t: string): Decoded | null {
  try {
    const p = t.split(".");
    return {
      header:  JSON.parse(atob(p[0].replace(/-/g, "+").replace(/_/g, "/"))),
      payload: JSON.parse(atob(p[1].replace(/-/g, "+").replace(/_/g, "/"))),
      sig:     p[2] ?? "",
    };
  } catch { return null; }
}

function JsonBlock({ data }: { data: any }) {
  const str = JSON.stringify(data, null, 2);
  return (
    <pre style={{
      margin: 0, fontSize: 12, lineHeight: 1.7,
      background: "var(--bg)", padding: "12px 14px",
      borderRadius: 5, border: "1px solid var(--border)",
      overflowX: "auto", fontFamily: "monospace",
      color: "var(--text)",
    }}>
      {str.split("\n").map((line, i) => {
        const keyMatch = line.match(/^(\s*)"([^"]+)":/);
        if (keyMatch) {
          return (
            <span key={i}>
              {keyMatch[1]}
              <span style={{ color: "#93c5fd" }}>"{keyMatch[2]}"</span>
              {line.slice(keyMatch[0].length)}{"\n"}
            </span>
          );
        }
        const isStr = line.trim().startsWith('"') || line.includes(': "');
        return <span key={i} style={{ color: isStr ? "#4ade80" : "#fde047" }}>{line}{"\n"}</span>;
      })}
    </pre>
  );
}

export default function JwtDebugPage() {
  const [token, setToken]         = useState("");
  const [decoded, setDecoded]     = useState<Decoded | null>(null);
  const [custom, setCustom]       = useState("");
  const [customDec, setCustomDec] = useState<Decoded | null>(null);
  const [verifyRes, setVerifyRes] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) return;
    const t = decodeURIComponent(match[1]);
    setToken(t);
    setDecoded(safeDecode(t));
  }, []);

  const handleCustomChange = (v: string) => {
    setCustom(v);
    setCustomDec(safeDecode(v));
    setVerifyRes(null);
  };

  const verify = async () => {
    setVerifying(true);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: custom }),
    });
    setVerifyRes(await res.json());
    setVerifying(false);
  };

  const applyToken = () => {
    document.cookie = `token=${custom}; path=/; max-age=86400`;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: "bold", margin: 0, letterSpacing: -0.5 }}>JWT Debug</h1>
              <span style={{
                fontSize: 10, fontWeight: "bold",
                background: "rgba(234,179,8,0.12)",
                color: "#fde047",
                border: "1px solid rgba(234,179,8,0.25)",
                borderRadius: 3, padding: "2px 7px",
                textTransform: "uppercase", letterSpacing: 0.5,
              }}>Dev Tool</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
              Token inspector — should be removed before production
            </p>
          </div>
          <div style={{
            textAlign: "right", fontSize: 12, fontFamily: "monospace",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "8px 14px",
          }}>
            <div style={{ color: "var(--muted)", marginBottom: 3 }}>Algorithm</div>
            <div style={{ color: "var(--yellow)", fontWeight: "bold" }}>HS256</div>
            <div style={{ color: "var(--muted)", marginTop: 6, marginBottom: 3 }}>Secret strength</div>
            <div style={{ color: "var(--red)", fontWeight: "bold" }}>WEAK</div>
          </div>
        </div>

        {/* Current token */}
        {token && decoded && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, marginBottom: 20, overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 18px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Your Current Token
              </span>
              <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "monospace" }}>
                HS256 · {token.split(".")[2] ? "signed" : "unsigned"}
              </span>
            </div>

            {/* Raw token */}
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", lineHeight: 1.7 }}>
                <span style={{ color: "#93c5fd" }}>{token.split(".")[0]}</span>
                <span style={{ color: "var(--muted)" }}>.</span>
                <span style={{ color: "#4ade80" }}>{token.split(".")[1]}</span>
                <span style={{ color: "var(--muted)" }}>.</span>
                <span style={{ color: "#fca5a5" }}>{token.split(".")[2]}</span>
              </div>
            </div>

            {/* Decoded */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              <div style={{ padding: "14px 18px", borderRight: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "#93c5fd", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Header
                </div>
                <JsonBlock data={decoded.header} />
              </div>
              <div style={{ padding: "14px 18px" }}>
                <div style={{ fontSize: 11, color: "#4ade80", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Payload
                </div>
                <JsonBlock data={decoded.payload} />
              </div>
            </div>

            {decoded.payload.exp && (
              <div style={{
                padding: "10px 18px", borderTop: "1px solid var(--border)",
                fontSize: 12, color: "var(--muted)", fontFamily: "monospace",
              }}>
                Expires: {new Date(decoded.payload.exp * 1000).toLocaleString()}
                &nbsp;·&nbsp;
                {decoded.payload.exp * 1000 > Date.now()
                  ? <span style={{ color: "var(--accent)" }}>Valid</span>
                  : <span style={{ color: "var(--red)" }}>Expired</span>}
              </div>
            )}
          </div>
        )}

        {/* Custom token tester */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, marginBottom: 20, overflow: "hidden",
        }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Test Custom Token
            </span>
          </div>
          <div style={{ padding: "16px 18px" }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 7 }}>
                Paste JWT token
              </label>
              <textarea
                value={custom}
                onChange={e => handleCustomChange(e.target.value)}
                rows={3}
                placeholder="eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0..."
                spellCheck={false}
                style={{
                  width: "100%", background: "var(--bg)",
                  border: "1px solid var(--border)", borderRadius: 5,
                  padding: "10px 12px", color: "var(--text)",
                  fontSize: 12, fontFamily: "monospace",
                  outline: "none", resize: "vertical",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Live decode preview */}
            {customDec && (
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "#93c5fd", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Header</div>
                  <JsonBlock data={customDec.header} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#4ade80", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Payload</div>
                  <JsonBlock data={customDec.payload} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={verify} disabled={verifying || !custom.trim()}
                style={{ background: "var(--accent)", color: "#000", border: "none", borderRadius: 5, padding: "9px 18px", fontSize: 13, fontWeight: "bold", fontFamily: "monospace", cursor: "pointer" }}>
                {verifying ? "Verifying..." : "Verify →"}
              </button>
              {custom.trim() && (
                <button onClick={applyToken}
                  style={{ background: "var(--surface)", color: copied ? "var(--accent)" : "var(--muted)", border: "1px solid var(--border)", borderRadius: 5, padding: "9px 18px", fontSize: 13, fontFamily: "monospace", cursor: "pointer" }}>
                  {copied ? "✓ Applied" : "Apply as Cookie"}
                </button>
              )}
            </div>

            {verifyRes && (
              <div style={{
                marginTop: 12, padding: "12px 14px", borderRadius: 5,
                background: verifyRes.valid ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                border: verifyRes.valid ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
              }}>
                <pre style={{ margin: 0, fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap", color: verifyRes.valid ? "#4ade80" : "#fca5a5" }}>
                  {JSON.stringify(verifyRes, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Attack reference */}
        <div style={{
          background: "var(--surface)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 8, overflow: "hidden",
        }}>
          <div style={{
            padding: "12px 18px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 12, color: "var(--red)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Attack Reference
            </span>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                title: "Attack 1 — none Algorithm",
                color: "#fca5a5",
                steps: [
                  'Set header to {"alg":"none","typ":"JWT"}',
                  'Set payload: change "role":"user" → "role":"admin"',
                  "Leave signature empty but keep the trailing dot",
                  "Format: base64(header).base64(payload).",
                  'Paste into "Apply as Cookie" above → visit /admin',
                ],
              },
              {
                title: "Attack 2 — Brute Force Secret",
                color: "#fde047",
                steps: [
                  "Copy your current token from the raw display above",
                  "Run: hashcat -a 0 -m 16500 <token> rockyou.txt",
                  "Secret is: secret  (it's in rockyou.txt)",
                  "Go to jwt.io → paste token → set role:admin → sign with secret",
                  "Paste forged token into Apply as Cookie → visit /admin",
                ],
              },
            ].map(a => (
              <div key={a.title}>
                <div style={{ fontSize: 13, fontWeight: "bold", color: a.color, marginBottom: 8 }}>
                  {a.title}
                </div>
                <ol style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                  {a.steps.map((s, i) => (
                    <li key={i} style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace", lineHeight: 1.6 }}>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}