"use client";
import React from "react";
import type { LogEntry, AttackType } from "@/types/defense";
import { sans } from "@/constants/campusTheme";
import { LogRow } from "@/components/defense/LogRow";

type Props = {
  logs: LogEntry[];
  setLogs: (fn: (prev: LogEntry[]) => LogEntry[]) => void;
  patchedTypes: Set<AttackType>;
  selected: string | null;
  onSelect: (id: string) => void;
  isRunning: boolean;
};

type FilterTab = "all" | "acknowledged" | "patched";

export function LogsTab({ logs, setLogs, patchedTypes, selected, onSelect, isRunning }: Props) {
  const [filterTab, setFilterTab] = React.useState<FilterTab>("all");

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
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

      {/* Filter tabs + live indicator */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", borderBottom: "1px solid #e2e8f0",
        background: "#ffffff", flexShrink: 0,
      }}>
        <div style={{ display: "flex" }}>
          {(["all", "acknowledged", "patched"] as FilterTab[]).map(tab => {
            const labels: Record<FilterTab, string> = { all: "All Events", acknowledged: "Acknowledged", patched: "Patched" };
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
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10,
                  background: active ? "rgba(26,60,110,0.1)" : "#f3f4f6",
                  color: active ? "#1a3c6e" : "#9ca3af",
                }}>
                  {tabCounts[tab]}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: ".08em",
            color: isRunning ? "#16a34a" : "#9ca3af",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            {isRunning && <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#16a34a", animation: "pulse 1.2s infinite" }} />}
            {isRunning ? "LIVE MONITORING" : "PAUSED"}
          </span>
          <button
            onClick={() => setLogs(() => [])}
            style={{
              fontFamily: sans, fontSize: 10, fontWeight: 700, letterSpacing: ".06em",
              padding: "4px 10px", borderRadius: 5, cursor: "pointer",
              background: "transparent", border: "1px solid #e2e8f0", color: "#9ca3af",
            }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "80px 90px 180px 1fr 110px",
        padding: "9px 24px", background: "#f9fafb", borderBottom: "1px solid #e2e8f0",
        fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#9ca3af", flexShrink: 0,
      }}>
        <span>TIME</span><span>SEVERITY</span><span>ATTACK TYPE</span>
        <span>ATTACKER / DETAIL</span><span style={{ textAlign: "right" }}>STATUS</span>
      </div>

      {/* Rows */}
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
          <LogRow
            key={log.id}
            log={log}
            isSelected={selected === log.id}
            patchedTypes={patchedTypes}
            onSelect={id => onSelect(id)}
          />
        ))}
      </div>
    </div>
  );
}
