"use client";
import React, { useState } from "react";
import type { AttackType } from "@/types/defense";
import { sans, mono, TYPE_LABELS, PATCH_POINTS } from "@/constants/campusTheme";
import { useAttackSimulator, useToast } from "@/hooks/useCampusDefense";
import { addPatchedVuln } from "@/lib/logAttack";
import { LogsTab } from "@/components/defense/LogsTab";
import { InvestigateTab } from "@/components/defense/InvestigateTab";
import { ScanTab } from "@/components/defense/ScanTab";
import { ToolsTab } from "@/components/defense/ToolsTab";
import { CodebaseTab } from "@/components/defense/CodebaseTab";
import { Activity, Search, ShieldAlert, Wrench, FolderCode } from "lucide-react";

type Tab = "logs" | "investigate" | "scan" | "tools" | "codebase";

export default function DefensePage() {
  const [activeTab, setActiveTab] = useState<Tab>("logs");
  const [isRunning, setIsRunning] = useState(true);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [patchedTypes, setPatchedTypes] = useState<Set<AttackType>>(new Set());
  const [, showToast] = useToast();

  const { logs, setLogs, alertFlash } = useAttackSimulator(patchedTypes, isRunning);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const critCount = logs.filter(l => l.severity === "critical" && !patchedTypes.has(l.type)).length;
  const pendingInvestigate = [...new Set(
    logs.filter(l => l.detected && !patchedTypes.has(l.type)).map(l => l.type)
  )].length;

  // ── Acknowledge ──────────────────────────────────────────────────────────────
  function acknowledge(logId: string) {
    const log = logs.find(l => l.id === logId);
    if (!log || log.detected) { showToast("Already acknowledged", false); return; }
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, detected: true } : l));
    showToast("Threat acknowledged — go to Investigate tab to view the code and patch it");
  }

  // ── Mark patched ─────────────────────────────────────────────────────────────
  function markPatched(type: AttackType) {
    if (patchedTypes.has(type)) { showToast("Already patched", false); return; }
    addPatchedVuln(type);
    setPatchedTypes(prev => new Set([...prev, type]));
    setLogs(prev => prev.map(l => l.type === type ? { ...l, patched: true } : l));
    const pts = PATCH_POINTS[type];
    setScore(s => s + pts);
    showToast(`✓ ${TYPE_LABELS[type]} patched — +${pts} pts`);
  }

  // ── Scan complete ─────────────────────────────────────────────────────────────
  function handleScanComplete(pts: number) {
    setScore(s => s + pts);
    showToast(`🔍 Scan complete — +${pts} bonus pts`);
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "logs",        label: "Live Logs",   icon: <Activity size={18} />, badge: logs.filter(l => !l.detected && !patchedTypes.has(l.type)).length || undefined },
    { id: "investigate", label: "Investigate", icon: <Search size={18} />, badge: pendingInvestigate || undefined },
    { id: "scan",        label: "Vuln Scan",   icon: <ShieldAlert size={18} /> },
    { id: "tools",       label: "Tools",       icon: <Wrench size={18} /> },
    { id: "codebase",    label: "Codebase",    icon: <FolderCode size={18} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", height: "100vh", background: "#f5f7fa", fontFamily: sans, color: "#374151", display: "flex", flexDirection: "column", fontSize: 13, overflow: "hidden" }}>

      {/* Critical flash */}
      {alertFlash && (
        <div style={{ position: "fixed", inset: 0, border: "3px solid #dc2626", pointerEvents: "none", zIndex: 9999, animation: "redflash 0.5s ease-out forwards" }} />
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 64,
        background: "#0b1120", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, gap: 16,
      }}>
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, rgba(245,130,10,0.2) 0%, rgba(245,130,10,0.05) 100%)", border: "1px solid rgba(245,130,10,0.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(245,130,10,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#f5820a" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>
              CampusCare <span style={{ color: "#f5820a" }}>Defense</span>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: ".02em", marginTop: 2 }}>Blue Team Console · Breach@trix</div>
          </div>

          {critCount > 0 && (
            <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: "4px 12px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, color: "#fca5a5", fontWeight: 700, letterSpacing: ".05em" }}>{critCount} CRITICAL</span>
            </div>
          )}
        </div>

        {/* Right: score + controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {patchedTypes.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {[...patchedTypes].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 20, padding: "4px 12px" }}>
                  <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>✓ {TYPE_LABELS[t].split(" ")[0]}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: ".1em", marginBottom: 2 }}>TEAM SCORE</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#f5820a", lineHeight: 1, letterSpacing: "-.02em", fontFamily: mono, textShadow: "0 0 20px rgba(245,130,10,0.3)" }}>{score.toLocaleString()}</div>
          </div>

          <button
            onClick={() => setIsRunning(v => !v)}
            style={{
              fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: ".05em",
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", transition: "all 0.2s ease",
              ...(isRunning
                ? { background: "rgba(245,130,10,0.1)", border: "1px solid rgba(245,130,10,0.3)", color: "#f5820a", boxShadow: "0 4px 12px rgba(245,130,10,0.1)" }
                : { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", boxShadow: "0 4px 12px rgba(34,197,94,0.1)" }),
            }}
          >
            {isRunning ? "⏸ PAUSE" : "▶ RESUME"}
          </button>
        </div>
      </header>

      {/* ── SUB-NAV ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "0 32px", height: 56,
        background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: sans, fontSize: 13, fontWeight: 700, letterSpacing: ".02em",
                padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                border: active ? "1px solid rgba(245,130,10,0.3)" : "1px solid transparent",
                background: active ? "rgba(245,130,10,0.08)" : "transparent",
                color: active ? "#f5820a" : "#94a3b8",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all .2s ease",
                boxShadow: active ? "0 4px 12px rgba(245,130,10,0.05)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "#cbd5e1";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ display: "flex", alignItems: "center", opacity: active ? 1 : 0.7 }}>{tab.icon}</span>
              {tab.label}
              {tab.badge != null && (
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  background: active ? "rgba(245,130,10,0.2)" : "rgba(239,68,68,0.15)",
                  color: active ? "#f5820a" : "#f87171",
                  border: `1px solid ${active ? "rgba(245,130,10,0.3)" : "rgba(239,68,68,0.3)"}`,
                  borderRadius: 12, padding: "2px 8px", minWidth: 24, textAlign: "center",
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Divider + acknowledge tip for logs tab */}
        {activeTab === "logs" && (
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#64748b", fontWeight: 500 }}>
            Click any log row → acknowledge it, then go to <strong style={{ color: "#94a3b8" }}>Investigate</strong> to view the code and patch
          </div>
        )}
        {activeTab === "investigate" && (
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#64748b", fontWeight: 500 }}>
            View full source files, then open the Patch IDE to fix the vulnerability and claim points
          </div>
        )}
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

        {activeTab === "logs" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* Mini inspector bar when a log is selected */}
            {selectedLogId && (() => {
              const log = logs.find(l => l.id === selectedLogId);
              if (!log) return null;
              const isPatched = patchedTypes.has(log.type);
              const canAck = !log.detected && !isPatched;
              return (
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "10px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0",
                  flexShrink: 0,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3c6e", marginBottom: 2 }}>{log.user} — {log.detail}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: mono }}>{log.ip} → {log.endpoint}</div>
                  </div>
                  {isPatched ? (
                    <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>✓ PATCHED</span>
                  ) : canAck ? (
                    <button
                      onClick={() => acknowledge(selectedLogId)}
                      style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, padding: "7px 16px", borderRadius: 7, cursor: "pointer", background: "rgba(26,60,110,0.08)", border: "1px solid rgba(26,60,110,0.2)", color: "#1a3c6e" }}
                    >
                      ◉ Acknowledge
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab("investigate")}
                      style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, padding: "7px 16px", borderRadius: 7, cursor: "pointer", background: "rgba(245,130,10,0.08)", border: "1px solid rgba(245,130,10,0.3)", color: "#f5820a" }}
                    >
                      ⚡ Investigate & Patch →
                    </button>
                  )}
                  <button onClick={() => setSelectedLogId(null)} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
                </div>
              );
            })()}
            <LogsTab
              logs={logs}
              setLogs={setLogs}
              patchedTypes={patchedTypes}
              selected={selectedLogId}
              onSelect={id => setSelectedLogId(prev => prev === id ? null : id)}
              isRunning={isRunning}
            />
          </div>
        )}

        {activeTab === "investigate" && (
          <InvestigateTab
            logs={logs}
            patchedTypes={patchedTypes}
            onMarkPatched={markPatched}
            onAcknowledge={acknowledge}
          />
        )}

        {activeTab === "scan" && (
          <ScanTab
            patchedTypes={patchedTypes}
            onScanComplete={handleScanComplete}
          />
        )}

        {activeTab === "tools" && (
          <ToolsTab logs={logs} />
        )}

        {activeTab === "codebase" && (
          <CodebaseTab />
        )}
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap");
        * { box-sizing: border-box; }
        body { margin: 0; background: #f5f7fa; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        button:focus { outline: none; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes redflash { 0% { opacity:1 } 100% { opacity:0 } }
      `}</style>
    </div>
  );
}
