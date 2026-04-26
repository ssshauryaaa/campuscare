"use client";
import React, { useState } from "react";
import type { AttackType } from "@/types/defense";
import { sans, mono, TYPE_LABELS, PATCH_POINTS } from "@/constants/campusTheme";
import { useAttackSimulator, useTimer, useToast } from "@/hooks/useCampusDefense";
import { LogRow } from "@/components/defense/LogRow";
import { ThreatInspector } from "@/components/defense/ThreatInspector";
import { ScoreLedger } from "@/components/defense/ScoreLedger";
import { addPatchedVuln } from "@/lib/logAttack";



export default function DefensePage() {
  const [isRunning, setIsRunning] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "acknowledged" | "patched">("all");
  const [score, setScore] = useState(0);
  const [detectScore, setDetectScore] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<{ points: number; ts: number; detail: string; type: AttackType }[]>([]);
  const [patchedTypes, setPatchedTypes] = useState<Set<AttackType>>(new Set());

  const [toast, showToast] = useToast();
  const { logs, setLogs, alertFlash } = useAttackSimulator(patchedTypes, isRunning);

  const selectedLog = logs.find(l => l.id === selected);

  // ── Acknowledge ─────────────────────────────────────────────────────────────
  function acknowledge(logId: string) {
    const log = logs.find(l => l.id === logId);
    if (!log || log.detected) { showToast("Already acknowledged", false); return; }
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, detected: true } : l));
    setDetectScore(s => s + 40);
    setScore(s => s + 40);
    setScoreHistory(h => [{ points: 40, ts: Date.now(), detail: `${TYPE_LABELS[log.type]} detected`, type: log.type }, ...h].slice(0, 50));
    showToast("Threat acknowledged +40 pts — patch the code to claim full points");
  }

  // ── Mark as patched ─────────────────────────────────────────────────────────
  function markPatched(type: AttackType) {
    if (patchedTypes.has(type)) { showToast("Already patched", false); return; }
    // Write to localStorage so vulnerable pages can read and block the exploit
    addPatchedVuln(type);
    setPatchedTypes(prev => new Set([...prev, type]));
    setLogs(prev => prev.map(l => l.type === type ? { ...l, patched: true } : l));
    const pts = PATCH_POINTS[type];
    setScore(s => s + pts);
    setScoreHistory(h => [{ points: pts, ts: Date.now(), detail: `${TYPE_LABELS[type]} patched globally`, type }, ...h].slice(0, 50));
    showToast(`✓ ${TYPE_LABELS[type]} patched — +${pts} pts`);
  }

  // ── Derived counts ───────────────────────────────────────────────────────────
  const critCount = logs.filter(l => l.severity === "critical" && !patchedTypes.has(l.type)).length;
  const tabCounts = {
    all: logs.length,
    acknowledged: logs.filter(l => l.detected && !patchedTypes.has(l.type)).length,
    patched: logs.filter(l => patchedTypes.has(l.type)).length,
  };
  const filteredLogs = logs.filter(l => {
    if (filterTab === "acknowledged") return l.detected && !patchedTypes.has(l.type);
    if (filterTab === "patched") return patchedTypes.has(l.type);
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", fontFamily: sans, color: "#374151", display: "flex", flexDirection: "column", fontSize: 13 }}>

      {/* Critical flash overlay */}
      {alertFlash && (
        <div style={{ position: "fixed", inset: 0, border: "3px solid #dc2626", pointerEvents: "none", zIndex: 9999, animation: "redflash 0.5s ease-out forwards" }} />
      )}

      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: 60,
        background: "#1a3c6e", flexShrink: 0, gap: 16,
      }}>
        {/* Left: branding + badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

          {/* CampusCare logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Shield icon */}
            <div style={{ width: 28, height: 28, background: "rgba(245,130,10,0.2)", border: "1px solid rgba(245,130,10,0.4)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#f5820a" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", letterSpacing: "-.01em" }}>
                CampusCare <span style={{ color: "#f5820a" }}>Defense</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Blue Team Console · Breach@trix</div>
            </div>
          </div>

          {/* Critical alert badge */}
          {critCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.35)", borderRadius: 6, padding: "3px 10px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.2s infinite" }} />
              <span style={{ fontSize: 10, color: "#fca5a5", fontWeight: 700, letterSpacing: ".08em" }}>{critCount} CRITICAL ACTIVE</span>
            </div>
          )}

          {/* Patched type badges */}
          {[...patchedTypes].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(245,130,10,0.15)", border: "1px solid rgba(245,130,10,0.3)", borderRadius: 6, padding: "3px 10px" }}>
              <span style={{ fontSize: 10, color: "#f5820a", fontWeight: 700, letterSpacing: ".06em" }}>✓ {TYPE_LABELS[t].split(" ")[0]}</span>
            </div>
          ))}
        </div>

        {/* Right: score + uptime + controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: ".1em", marginBottom: 1 }}>BLUE TEAM SCORE</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#f5820a", lineHeight: 1, letterSpacing: "-.03em", fontFamily: mono }}>{score.toLocaleString()}</div>
          </div>

          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setLogs([])} style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", padding: "6px 12px", borderRadius: 6, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)" }}>CLEAR</button>
            <button onClick={() => setIsRunning(v => !v)} style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", padding: "6px 14px", borderRadius: 6, cursor: "pointer", ...(isRunning ? { background: "rgba(245,130,10,0.15)", border: "1px solid rgba(245,130,10,0.4)", color: "#f5820a" } : { background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.4)", color: "#4ade80" }) }}>
              {isRunning ? "⏸ PAUSE" : "▶ RESUME"}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, height: "calc(100vh - 60px)" }}>

        {/* Log list (left) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0", minWidth: 0 }}>

          {/* Filter tabs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid #e2e8f0", background: "#ffffff", flexShrink: 0 }}>
            <div style={{ display: "flex" }}>
              {(["all", "acknowledged", "patched"] as const).map(tab => {
                const labels = { all: "All Events", acknowledged: "Acknowledged", patched: "Patched" };
                const active = filterTab === tab;
                return (
                  <button key={tab} onClick={() => setFilterTab(tab)} style={{
                    fontFamily: sans, background: "transparent", border: "none",
                    borderBottom: `2px solid ${active ? "#1a3c6e" : "transparent"}`,
                    padding: "14px 18px", fontSize: 11, fontWeight: 700, letterSpacing: ".07em",
                    color: active ? "#1a3c6e" : "#9ca3af", cursor: "pointer", transition: "all .15s",
                    display: "flex", alignItems: "center", gap: 7,
                  }}>
                    {labels[tab]}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: active ? "rgba(26,60,110,0.1)" : "#f3f4f6", color: active ? "#1a3c6e" : "#9ca3af" }}>
                      {tabCounts[tab]}
                    </span>
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: isRunning ? "#16a34a" : "#9ca3af", display: "flex", alignItems: "center", gap: 5 }}>
              {isRunning && <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#16a34a", animation: "pulse 1.2s infinite" }} />}
              {isRunning ? "LIVE MONITORING" : "PAUSED"}
            </span>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "80px 90px 180px 1fr 110px",
            padding: "9px 24px", background: "#f9fafb", borderBottom: "1px solid #e2e8f0",
            fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#9ca3af", flexShrink: 0,
          }}>
            <span>TIME</span><span>SEVERITY</span><span>ATTACK TYPE</span><span>ATTACKER / DETAIL</span><span style={{ textAlign: "right" }}>STATUS</span>
          </div>

          {/* Log rows */}
          <div style={{ flex: 1, overflowY: "auto", background: "#ffffff" }}>
            {filteredLogs.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 10 }}>
                <div style={{ fontSize: 28, color: "#e5e7eb" }}>◎</div>
                <div style={{ fontSize: 12, color: "#d1d5db", fontWeight: 600, letterSpacing: ".06em", fontFamily: sans }}>
                  {filterTab === "acknowledged" ? "NO ACKNOWLEDGED THREATS" : filterTab === "patched" ? "NO PATCHED VULNS YET" : "NO EVENTS YET"}
                </div>
              </div>
            )}
            {filteredLogs.map(log => (
              <LogRow key={log.id} log={log} isSelected={selected === log.id} patchedTypes={patchedTypes} onSelect={id => setSelected(prev => prev === id ? null : id)} />
            ))}
          </div>
        </div>

        {/* Right sidebar: Inspector + Ledger */}
        <div style={{ width: 420, flexShrink: 0, display: "flex", flexDirection: "column", background: "#ffffff", borderLeft: "1px solid #e2e8f0" }}>
          <div style={{ padding: "14px 22px", borderBottom: "1px solid #e2e8f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#6b7280" }}>THREAT INSPECTOR</span>
            {selectedLog && <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: mono }}>#{selectedLog.id}</span>}
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <ThreatInspector selectedLog={selectedLog} patchedTypes={patchedTypes} toast={toast} onAcknowledge={acknowledge} onMarkPatched={markPatched} />
          </div>
          <ScoreLedger scoreHistory={scoreHistory} />
        </div>
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap");
        * { box-sizing: border-box; }
        body { margin: 0; background: #f5f7fa; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        button:focus { outline: none; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes fadeup { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
        @keyframes redflash { 0% { opacity:1 } 100% { opacity:0 } }
      `}</style>
    </div>
  );
}
