"use client";
import React, { useState, useRef, useEffect } from "react";
import { VULN_SNIPPETS, FULL_SOURCES } from "@/constants/vulnSnippets";
import type { AttackType } from "@/types/defense";
import { mono, sans } from "@/constants/campusTheme";

type Props = {
  type: AttackType;
  onClose: () => void;
  onApply: () => void;
};

export function VulnCodeEditor({ type, onClose, onApply }: Props) {
  const vuln = VULN_SNIPPETS[type];
  const files = vuln?.files || [];
  const fullSources = FULL_SOURCES[type] ?? [];

  const [activeIdx, setActiveIdx] = useState(0);
  const [fixes, setFixes] = useState<string[]>(() => files.map(() => ""));
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [view, setView] = useState<"split" | "fix">("split");
  const codeRef = useRef<HTMLDivElement>(null);

  const activeFile = files[activeIdx];
  // Use full source for the vulnerable-code panel; fall back to snippet
  const displaySource = fullSources[activeIdx] ?? activeFile?.vulnerableSnippet ?? "";
  const activeFix = fixes[activeIdx];
  const hasChanged = activeFix.trim().length > 0 && activeFix.trim() !== activeFile?.vulnerableSnippet.trim();
  const allAddressed = fixes.every((f, i) => f.trim().length > 0 && f.trim() !== files[i]?.vulnerableSnippet.trim());

  // Scroll to first highlighted line when file changes
  useEffect(() => {
    if (!codeRef.current) return;
    const firstVuln = codeRef.current.querySelector("[data-vuln='true']") as HTMLElement | null;
    if (firstVuln) {
      firstVuln.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeIdx]);

  if (!vuln || files.length === 0) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
        <div style={{ background: "#fff", padding: 28, borderRadius: 14, fontFamily: sans, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", maxWidth: 400 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔍</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#1a3c6e" }}>No Snippet Configured</h3>
          <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>A code sample hasn't been added yet. The patch will still be recorded.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px 16px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: 8, color: "#6b7280", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: sans }}>Cancel</button>
            <button onClick={onApply} style={{ flex: 1, padding: "10px 16px", background: "#16a34a", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: sans }}>Apply Patch Anyway</button>
          </div>
        </div>
      </div>
    );
  }

  // Determine which lines contain the vulnerable snippet (for highlighting)
  const vulnLines = (activeFile.vulnerableSnippet ?? "")
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 6);
  const sourceLines = displaySource.split("\n");

  const handleApply = async () => {
    if (!allAddressed) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    onApply();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,16,38,0.75)", backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#0f172a", width: "98%", maxWidth: 1300, maxHeight: "94vh", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.6)", animation: "ideIn 0.25s ease-out forwards", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Titlebar */}
        <div style={{ padding: "0 20px", background: "#1e293b", display: "flex", alignItems: "center", gap: 12, height: 44, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c, i) => (
              <div key={i} onClick={i === 0 ? onClose : undefined}
                style={{ width: 12, height: 12, borderRadius: "50%", background: c, cursor: i === 0 ? "pointer" : "default", opacity: 0.9 }} />
            ))}
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: mono }}>
              CampusCare Patch IDE  ·  <span style={{ color: "#f5820a" }}>{vuln.title}</span>
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1, fontFamily: mono }}>×</button>
        </div>

        {/* File tabs */}
        <div style={{ display: "flex", background: "#1e293b", paddingLeft: 20, gap: 2, borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          {files.map((f, i) => {
            const isActive = activeIdx === i;
            const isDone = fixes[i].trim().length > 0 && fixes[i].trim() !== files[i].vulnerableSnippet.trim();
            return (
              <button key={i} onClick={() => { setActiveIdx(i); setShowHint(false); }} style={{
                background: isActive ? "#0f172a" : "transparent",
                padding: "10px 18px",
                borderTop: isActive ? "2px solid #f5820a" : "2px solid transparent",
                border: "none", cursor: "pointer", transition: "all 0.15s",
                color: isActive ? "#e2e8f0" : "rgba(255,255,255,0.35)",
                fontSize: 12, fontFamily: mono, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 7,
              }}>
                {isDone && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />}
                {!isDone && isActive && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block", animation: "pulse 1.5s infinite" }} />}
                {f.label}
              </button>
            );
          })}
          {/* View toggle */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, paddingRight: 16 }}>
            {(["split", "fix"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view === v ? "rgba(245,130,10,0.15)" : "transparent",
                border: view === v ? "1px solid rgba(245,130,10,0.3)" : "1px solid transparent",
                borderRadius: 5, padding: "4px 10px", cursor: "pointer",
                color: view === v ? "#f5820a" : "rgba(255,255,255,0.3)",
                fontSize: 10, fontWeight: 700, fontFamily: sans, letterSpacing: "0.06em",
              }}>
                {v === "split" ? "⊞ SPLIT" : "✎ FIX ONLY"}
              </button>
            ))}
          </div>
        </div>

        {/* Editor body */}
        <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

          {/* Left info panel */}
          <div style={{ width: 240, background: "#1e293b", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <div style={{ padding: "18px 16px 0", flex: 1, overflowY: "auto" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>Vulnerability</div>
              <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.65, margin: "0 0 18px" }}>{vuln.description}</p>

              <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>Active File</div>
              <div style={{ fontSize: 11, fontFamily: mono, color: "#f5820a", background: "rgba(245,130,10,0.1)", padding: "6px 10px", borderRadius: 6, marginBottom: 16, wordBreak: "break-all", border: "1px solid rgba(245,130,10,0.2)" }}>
                {activeFile.path}
              </div>

              <div style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>⚠ Your Task</div>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6, marginBottom: 18, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 6, padding: "8px 10px" }}>
                Read the <span style={{ color: "#fca5a5", fontWeight: 700 }}>full file</span> on the left. Find the vulnerable lines (highlighted in red). Write the <span style={{ color: "#4ade80", fontWeight: 700 }}>secure version</span> of only those lines on the right.
              </div>

              <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>Progress</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                {files.map((f, i) => {
                  const done = fixes[i].trim().length > 0 && fixes[i].trim() !== files[i].vulnerableSnippet.trim();
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12 }}>{done ? "✅" : "⬜"}</span>
                      <span style={{ fontSize: 11, color: done ? "#4ade80" : "#64748b", fontFamily: mono }}>{f.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => setShowHint(!showHint)}
                style={{ width: "100%", background: showHint ? "rgba(56,189,248,0.1)" : "transparent", border: "1px solid rgba(56,189,248,0.2)", padding: "9px 12px", borderRadius: 7, color: "#38bdf8", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: sans, letterSpacing: ".05em" }}
              >
                {showHint ? "▲ Hide Hint" : "💡 Show Solution Hint"}
              </button>
            </div>
          </div>

          {/* Right: code area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

            {/* Hint bar */}
            {showHint && (
              <div style={{ background: "#0c1929", borderBottom: "1px solid rgba(56,189,248,0.2)", padding: "12px 18px", flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: "#38bdf8", fontWeight: 700, letterSpacing: ".1em", marginBottom: 6 }}>💡 SOLUTION HINT:</div>
                <pre style={{ margin: 0, color: "#bae6fd", fontSize: 12, fontFamily: mono, whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.65 }}>
                  {activeFile.fixHint}
                </pre>
              </div>
            )}

            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

              {/* Full file view (vulnerable side) */}
              {view === "split" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.07)", minWidth: 0 }}>
                  <div style={{ padding: "8px 16px", background: "rgba(239,68,68,0.07)", borderBottom: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", letterSpacing: ".08em" }}>⛔ FULL FILE — find and fix the vulnerable lines</span>
                    <span style={{ fontSize: 10, color: "#64748b", fontFamily: mono, marginLeft: "auto" }}>{activeFile.label} · {sourceLines.length} lines</span>
                  </div>
                  <div ref={codeRef} style={{ flex: 1, overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 12.5, lineHeight: 1.75 }}>
                      <tbody>
                        {sourceLines.map((line, i) => {
                          const trimmed = line.trim();
                          const isVuln = vulnLines.some(vl => vl.length > 6 && trimmed.includes(vl.slice(0, Math.min(vl.length, 50))));
                          return (
                            <tr key={i} data-vuln={isVuln ? "true" : "false"}
                              style={{ background: isVuln ? "rgba(239,68,68,0.14)" : "transparent" }}>
                              <td style={{
                                width: 44, minWidth: 44, textAlign: "right", paddingRight: 14, paddingLeft: 10,
                                color: isVuln ? "#f87171" : "#3d4a5c", fontSize: 11, userSelect: "none",
                                borderRight: `2px solid ${isVuln ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.04)"}`,
                                fontWeight: isVuln ? 700 : 400,
                              }}>
                                {i + 1}
                              </td>
                              <td style={{ paddingLeft: 14, paddingRight: 14, whiteSpace: "pre-wrap", wordBreak: "break-all", color: isVuln ? "#fca5a5" : "#94a3b8", fontWeight: isVuln ? 600 : 400 }}>
                                {isVuln && <span style={{ fontSize: 9, color: "#f87171", fontWeight: 800, marginRight: 8, background: "rgba(239,68,68,0.25)", padding: "1px 5px", borderRadius: 3, verticalAlign: "middle" }}>VULN</span>}
                                {line || " "}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Your fix (editable) */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div style={{ padding: "8px 16px", background: hasChanged ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)", borderBottom: `1px solid ${hasChanged ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: hasChanged ? "#4ade80" : "#64748b", letterSpacing: ".08em" }}>
                    {hasChanged ? "✅ YOUR FIX — looks good" : "✎ YOUR FIX — paste only the fixed lines here"}
                  </span>
                  {!hasChanged && <span style={{ fontSize: 10, color: "#475569", marginLeft: "auto" }}>Write the secure replacement for the vulnerable code only</span>}
                </div>
                <textarea
                  value={activeFix}
                  onChange={e => {
                    const newFixes = [...fixes];
                    newFixes[activeIdx] = e.target.value;
                    setFixes(newFixes);
                  }}
                  placeholder={`// Paste your fix here — only the corrected lines\n// Tip: look for the red-highlighted lines on the left`}
                  spellCheck={false}
                  style={{
                    flex: 1, width: "100%", background: "transparent", border: "none",
                    color: hasChanged ? "#86efac" : "#94a3b8",
                    padding: 16, fontSize: 13, fontFamily: mono, lineHeight: 1.7,
                    outline: "none", resize: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", background: "#1e293b", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 12 }}>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: mono }}>
            {allAddressed
              ? <span style={{ color: "#4ade80" }}>✅ All files patched — ready to deploy</span>
              : <span>{files.filter((_, i) => fixes[i].trim().length > 0 && fixes[i].trim() !== files[i].vulnerableSnippet.trim()).length}/{files.length} files fixed</span>
            }
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "10px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: sans }}>
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={loading || !allAddressed}
              title={!allAddressed ? "Fix all files before applying" : ""}
              style={{
                padding: "10px 24px", border: "none", borderRadius: 8, color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: loading || !allAddressed ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8, fontFamily: sans,
                background: loading ? "#374151" : allAddressed ? "linear-gradient(135deg, #16a34a, #15803d)" : "#374151",
                opacity: !allAddressed && !loading ? 0.5 : 1, transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Deploying Patch...
                </>
              ) : <>⚡ Apply Fix & Patch</>}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ideIn { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
      `}</style>
    </div>
  );
}
