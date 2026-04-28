"use client";
import React, { useState } from "react";
import type { LogEntry, AttackType } from "@/types/defense";
import { VULN_SNIPPETS, FULL_SOURCES } from "@/constants/vulnSnippets";
import { TYPE_LABELS, TYPE_COLORS, SEV_CONFIG, PATCH_POINTS, mono, sans } from "@/constants/campusTheme";
import { VulnCodeEditor } from "@/components/defense/VulnCodeEditor";

type Props = {
  logs: LogEntry[];
  patchedTypes: Set<AttackType>;
  onMarkPatched: (type: AttackType) => void;
  onAcknowledge: (id: string) => void;
};

// ── Full-file viewer ──────────────────────────────────────────────────────────
function FullFileViewer({
  type, fileIdx, onClose, onOpenPatchIDE,
}: {
  type: AttackType; fileIdx: number; onClose: () => void; onOpenPatchIDE: () => void;
}) {
  const vuln = VULN_SNIPPETS[type];
  const fullSources = FULL_SOURCES[type] ?? [];
  const [activeFile, setActiveFile] = useState(fileIdx);
  const [showHint, setShowHint] = useState(false);

  if (!vuln) return null;

  const file = vuln.files[activeFile];
  const fullSource = fullSources[activeFile] ?? file?.vulnerableSnippet ?? "";

  // Highlight lines that contain the vulnerable snippet
  const vulnLines = (file?.vulnerableSnippet ?? "").split("\n").map(l => l.trim()).filter(Boolean);
  const sourceLines = fullSource.split("\n");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,10,20,0.75)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#0d1117", width: "98%", maxWidth: 1300, height: "90vh",
        borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 30px 80px rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)",
        animation: "ideIn 0.2s ease-out",
      }}>

        {/* Titlebar */}
        <div style={{
          height: 44, background: "#161b22", display: "flex", alignItems: "center",
          padding: "0 16px", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c, i) => (
              <div key={i} onClick={i === 0 ? onClose : undefined}
                style={{ width: 12, height: 12, borderRadius: "50%", background: c, cursor: i === 0 ? "pointer" : "default" }} />
            ))}
          </div>
          <span style={{ flex: 1, textAlign: "center", fontSize: 12, fontFamily: mono, color: "rgba(255,255,255,0.4)" }}>
            📁 Source Viewer — <span style={{ color: "#f5820a", fontWeight: 700 }}>{vuln.title}</span>
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {/* File tabs */}
        <div style={{ display: "flex", background: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          {vuln.files.map((f, i) => (
            <button key={i} onClick={() => setActiveFile(i)} style={{
              background: activeFile === i ? "#0d1117" : "transparent",
              padding: "10px 20px", border: "none",
              borderTop: activeFile === i ? "2px solid #f5820a" : "2px solid transparent",
              cursor: "pointer", color: activeFile === i ? "#e2e8f0" : "rgba(255,255,255,0.35)",
              fontSize: 12, fontFamily: mono, fontWeight: 600,
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

          {/* Sidebar */}
          <div style={{
            width: 260, background: "#161b22", flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column",
          }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#4b5563", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>Vulnerability</div>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 20px" }}>{vuln.description}</p>

              <div style={{ fontSize: 9, fontWeight: 700, color: "#4b5563", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>Active File</div>
              <div style={{ fontSize: 11, fontFamily: mono, color: "#f5820a", background: "rgba(245,130,10,0.08)", padding: "6px 10px", borderRadius: 6, marginBottom: 20, wordBreak: "break-all", border: "1px solid rgba(245,130,10,0.15)" }}>
                {file?.path ?? "—"}
              </div>

              <div style={{ fontSize: 9, fontWeight: 700, color: "#4b5563", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>Legend</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.4)", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Vulnerable lines</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Safe / context lines</span>
                </div>
              </div>

              {showHint && (
                <>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#38bdf8", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>💡 Fix Hint</div>
                  <pre style={{ fontSize: 11, fontFamily: mono, color: "#bae6fd", background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 8, padding: "10px 12px", whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.65, margin: 0 }}>
                    {file?.fixHint ?? "No hint available."}
                  </pre>
                </>
              )}
            </div>
            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => setShowHint(v => !v)}
                style={{
                  width: "100%", background: showHint ? "rgba(56,189,248,0.1)" : "transparent",
                  border: "1px solid rgba(56,189,248,0.2)", padding: "8px 12px", borderRadius: 7,
                  color: "#38bdf8", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: sans,
                }}
              >
                {showHint ? "▲ Hide Hint" : "💡 Show Fix Hint"}
              </button>
              <button
                onClick={onOpenPatchIDE}
                style={{
                  width: "100%", background: "rgba(245,130,10,0.12)",
                  border: "1px solid rgba(245,130,10,0.35)", padding: "9px 12px", borderRadius: 7,
                  color: "#f5820a", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: sans,
                }}
              >
                ⚡ Open Patch IDE
              </button>
            </div>
          </div>

          {/* Code view */}
          <div style={{ flex: 1, overflowY: "auto", background: "#0d1117" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 12.5, lineHeight: 1.75 }}>
              <tbody>
                {sourceLines.map((line, i) => {
                  const trimmed = line.trim();
                  const isVuln = vulnLines.some(vl => vl.length > 4 && trimmed.includes(vl.slice(0, Math.min(vl.length, 40))));
                  return (
                    <tr key={i} style={{ background: isVuln ? "rgba(239,68,68,0.12)" : "transparent" }}>
                      <td style={{
                        width: 48, minWidth: 48, textAlign: "right", paddingRight: 16, paddingLeft: 12,
                        color: isVuln ? "#f87171" : "#3d4a5c", fontSize: 11, userSelect: "none",
                        borderRight: `2px solid ${isVuln ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.04)"}`,
                        fontWeight: isVuln ? 700 : 400,
                      }}>
                        {i + 1}
                      </td>
                      <td style={{
                        paddingLeft: 16, paddingRight: 16, whiteSpace: "pre-wrap", wordBreak: "break-all",
                        color: isVuln ? "#fca5a5" : "#94a3b8",
                        fontWeight: isVuln ? 600 : 400,
                      }}>
                        {isVuln && <span style={{ fontSize: 10, color: "#f87171", fontWeight: 800, marginRight: 8, background: "rgba(239,68,68,0.2)", padding: "1px 5px", borderRadius: 3 }}>VULN</span>}
                        {line || " "}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <style>{`@keyframes ideIn { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
      </div>
    </div>
  );
}

// ── Main InvestigateTab ───────────────────────────────────────────────────────
export function InvestigateTab({ logs, patchedTypes, onMarkPatched, onAcknowledge }: Props) {
  const [selectedType, setSelectedType] = useState<AttackType | null>(null);
  const [viewerFileIdx, setViewerFileIdx] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [showPatchIDE, setShowPatchIDE] = useState(false);

  // All unique acknowledged (but unpatched) attack types
  const pendingTypes: AttackType[] = [];
  const seen = new Set<AttackType>();
  for (const log of logs) {
    if (log.detected && !patchedTypes.has(log.type) && !seen.has(log.type)) {
      pendingTypes.push(log.type);
      seen.add(log.type);
    }
  }

  // All patched types
  const doneTypes = [...patchedTypes];

  const openViewer = (type: AttackType, fileIdx = 0) => {
    setSelectedType(type);
    setViewerFileIdx(fileIdx);
    setShowViewer(true);
  };

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, background: "#f5f7fa" }}>

      {/* Left: threat queue */}
      <div style={{ width: 340, flexShrink: 0, borderRight: "1px solid #e2e8f0", background: "#ffffff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", background: "#f9fafb" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#6b7280" }}>INVESTIGATION QUEUE</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Acknowledged threats awaiting a patch</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {pendingTypes.length === 0 && doneTypes.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 220, gap: 10 }}>
              <div style={{ fontSize: 32, opacity: 0.2 }}>🛡️</div>
              <div style={{ fontSize: 12, color: "#d1d5db", fontWeight: 600, letterSpacing: ".06em", fontFamily: sans }}>NO THREATS ACKNOWLEDGED</div>
              <div style={{ fontSize: 11, color: "#e5e7eb", fontFamily: sans, textAlign: "center", maxWidth: 200, lineHeight: 1.5 }}>
                Acknowledge threats in the Logs tab first to investigate them here.
              </div>
            </div>
          )}

          {pendingTypes.length > 0 && (
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: "#9ca3af", padding: "6px 8px 4px" }}>⚠️ NEEDS PATCH — {pendingTypes.length}</div>
              {pendingTypes.map(type => {
                const vuln = VULN_SNIPPETS[type];
                const tc = TYPE_COLORS[type];
                const pts = PATCH_POINTS[type];
                const isActive = selectedType === type && !showViewer;
                return (
                  <div
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{
                      borderRadius: 10, border: `1px solid ${isActive ? tc.border : "#e2e8f0"}`,
                      background: isActive ? tc.bg : "#fff",
                      padding: "12px 14px", cursor: "pointer", marginBottom: 6,
                      transition: "all .15s",
                      boxShadow: isActive ? `0 2px 8px ${tc.border}` : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".05em", padding: "2px 8px", borderRadius: 4, color: tc.text, background: tc.bg, border: `1px solid ${tc.border}` }}>
                        {TYPE_LABELS[type]}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#f5820a" }}>+{pts} pts</span>
                    </div>
                    {vuln && <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5, marginBottom: 8 }}>{vuln.description.slice(0, 90)}…</div>}
                    {vuln?.files.map((f, fi) => (
                      <button
                        key={fi}
                        onClick={e => { e.stopPropagation(); openViewer(type, fi); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 6, width: "100%",
                          background: "rgba(26,60,110,0.05)", border: "1px solid rgba(26,60,110,0.1)",
                          borderRadius: 6, padding: "5px 10px", cursor: "pointer", marginBottom: 4,
                          fontFamily: mono, fontSize: 10, color: "#1a3c6e", fontWeight: 600, textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: 12 }}>📄</span> {f.path}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {doneTypes.length > 0 && (
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: "#9ca3af", padding: "6px 8px 4px" }}>✅ PATCHED — {doneTypes.length}</div>
              {doneTypes.map(type => {
                const tc = TYPE_COLORS[type];
                return (
                  <div key={type} style={{
                    borderRadius: 10, border: "1px solid rgba(22,163,74,0.2)",
                    background: "rgba(22,163,74,0.04)", padding: "10px 14px",
                    marginBottom: 6, opacity: 0.7,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".05em", padding: "2px 8px", borderRadius: 4, color: "#16a34a", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)" }}>
                      ✓ {TYPE_LABELS[type]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail + actions */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!selectedType ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12 }}>
            <div style={{ fontSize: 48, opacity: 0.12 }}>🔍</div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#d1d5db" }}>SELECT A THREAT TO INVESTIGATE</div>
            <div style={{ fontSize: 11, color: "#e5e7eb", maxWidth: 300, textAlign: "center", lineHeight: 1.6 }}>
              Click a threat card on the left to view its full source code, understand the vulnerability, and open the patch IDE.
            </div>
          </div>
        ) : (() => {
          const vuln = VULN_SNIPPETS[selectedType];
          const tc = TYPE_COLORS[selectedType];
          const pts = PATCH_POINTS[selectedType];
          const isPatched = patchedTypes.has(selectedType);
          const affectedLog = logs.find(l => l.type === selectedType);
          const sevCfg = SEV_CONFIG[affectedLog?.severity ?? "high"];

          return (
            <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5, color: tc.text, background: tc.bg, border: `1px solid ${tc.border}` }}>
                      {TYPE_LABELS[selectedType]}
                    </span>
                    {affectedLog && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: sevCfg.color }}>
                        ● {sevCfg.label}
                      </span>
                    )}
                    {isPatched && <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>✓ PATCHED</span>}
                  </div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a3c6e", letterSpacing: "-.01em" }}>{vuln?.title}</h2>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6b7280", lineHeight: 1.65, maxWidth: 640 }}>{vuln?.description}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: ".1em", marginBottom: 2 }}>PATCH VALUE</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#f5820a", letterSpacing: "-.02em" }}>+{pts}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>points</div>
                </div>
              </div>

              {/* File source cards */}
              {vuln?.files.map((f, fi) => {
                const fullSource = (FULL_SOURCES[selectedType] ?? [])[fi] ?? f.vulnerableSnippet;
                const lineCount = fullSource.split("\n").length;
                return (
                  <div key={fi} style={{ marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
                    {/* File header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f9fafb", borderBottom: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 14 }}>📄</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, fontFamily: mono, color: "#1a3c6e" }}>{f.path}</div>
                          <div style={{ fontSize: 10, color: "#9ca3af" }}>{lineCount} lines · contains vulnerability</div>
                        </div>
                      </div>
                      <button
                        onClick={() => openViewer(selectedType, fi)}
                        style={{
                          fontFamily: sans, fontSize: 11, fontWeight: 700, letterSpacing: ".05em",
                          padding: "6px 14px", borderRadius: 7, cursor: "pointer",
                          background: "rgba(26,60,110,0.08)", border: "1px solid rgba(26,60,110,0.2)", color: "#1a3c6e",
                        }}
                      >
                        📂 View Full File
                      </button>
                    </div>

                    {/* Snippet preview */}
                    <div style={{ padding: 14, background: "#0f172a" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", letterSpacing: ".1em", marginBottom: 8 }}>⛔ VULNERABLE SNIPPET</div>
                      <pre style={{
                        margin: 0, color: "#fca5a5", fontFamily: mono, fontSize: 12.5,
                        whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.75,
                        background: "rgba(239,68,68,0.06)", borderRadius: 8, padding: "12px 14px",
                        border: "1px solid rgba(239,68,68,0.12)",
                      }}>
                        {f.vulnerableSnippet}
                      </pre>
                    </div>
                  </div>
                );
              })}

              {/* Actions */}
              {!isPatched && (
                <div style={{
                  display: "flex", gap: 12, marginTop: 8,
                  padding: 16, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                }}>
                  <button
                    onClick={() => { setShowPatchIDE(true); }}
                    style={{
                      flex: 1, fontFamily: sans, padding: "14px 20px", borderRadius: 9,
                      fontSize: 13, fontWeight: 800, letterSpacing: ".04em", cursor: "pointer",
                      background: "linear-gradient(135deg, #f5820a, #d97706)", border: "none", color: "#fff",
                      boxShadow: "0 4px 14px rgba(245,130,10,0.3)",
                    }}
                  >
                    ⚡ Open Patch IDE — Fix the Code
                  </button>
                </div>
              )}
              {isPatched && (
                <div style={{ padding: "16px 20px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.18)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>Vulnerability Patched</div>
                    <div style={{ fontSize: 11, color: "#4a6a52" }}>This vulnerability is closed. Attackers can no longer exploit this vector.</div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Full file viewer modal */}
      {showViewer && selectedType && (
        <FullFileViewer
          type={selectedType}
          fileIdx={viewerFileIdx}
          onClose={() => setShowViewer(false)}
          onOpenPatchIDE={() => { setShowViewer(false); setShowPatchIDE(true); }}
        />
      )}

      {/* Patch IDE modal */}
      {showPatchIDE && selectedType && (
        <VulnCodeEditor
          type={selectedType}
          onClose={() => setShowPatchIDE(false)}
          onApply={() => {
            setShowPatchIDE(false);
            onMarkPatched(selectedType);
          }}
        />
      )}
    </div>
  );
}
