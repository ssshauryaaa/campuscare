"use client";
import React from "react";
import type { ScoreEntry } from "@/types/defense";
import { TYPE_LABELS, TYPE_COLORS, mono, sans } from "@/constants/campusTheme";

export function ScoreLedger({ scoreHistory }: { scoreHistory: ScoreEntry[] }) {
  return (
    <div style={{ borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
      <div style={{
        padding: "11px 22px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#f5f7fa", borderBottom: "1px solid #e2e8f0",
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#6b7280", fontFamily: sans }}>PATCH LEDGER</span>
        <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: sans }}>{scoreHistory.length} fix{scoreHistory.length !== 1 ? "es" : ""}</span>
      </div>
      <div style={{ maxHeight: 180, overflowY: "auto" }}>
        {scoreHistory.length === 0 ? (
          <div style={{ padding: "16px 22px", color: "#d1d5db", fontSize: 11, textAlign: "center", fontFamily: sans }}>No patches claimed yet</div>
        ) : (
          scoreHistory.map((h, i) => {
            const tc = TYPE_COLORS[h.type];
            const time = new Date(h.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 22px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: tc.text, letterSpacing: ".06em", marginBottom: 2 }}>{TYPE_LABELS[h.type]}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: sans }}>{h.detail}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, fontFamily: mono }}>{time}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#f5820a", marginLeft: 12, letterSpacing: "-.02em", fontFamily: mono }}>+{h.points}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
