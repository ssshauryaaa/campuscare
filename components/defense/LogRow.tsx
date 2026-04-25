"use client";
import React, { useState } from "react";
import type { LogEntry, AttackType } from "@/types/defense";
import { SEV_CONFIG, TYPE_LABELS, TYPE_COLORS, mono, sans } from "@/constants/campusTheme";

type Props = {
  log: LogEntry;
  isSelected: boolean;
  patchedTypes: Set<AttackType>;
  onSelect: (id: string) => void;
};

export function LogRow({ log, isSelected, patchedTypes, onSelect }: Props) {
  const [hovered, setHovered] = useState(false);
  const sev = SEV_CONFIG[log.severity];
  const tc = TYPE_COLORS[log.type];
  const isPatched = patchedTypes.has(log.type);
  const time = new Date(log.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div
      onClick={() => onSelect(log.id)}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "80px 90px 180px 1fr 110px",
        alignItems: "center",
        padding: "10px 24px",
        borderBottom: "1px solid #e2e8f0",
        borderLeft: `3px solid ${isSelected ? "#1a3c6e" : "transparent"}`,
        background: isSelected ? "#eef2f8" : hovered ? "#f8f9fb" : sev.rowBg,
        cursor: "pointer",
        opacity: isPatched ? 0.4 : 1,
        transition: "background .1s",
        fontFamily: sans,
      }}
    >
      {/* Time */}
      <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: mono }}>{time}</span>

      {/* Severity */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: sev.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", color: sev.color }}>{sev.label}</span>
      </div>

      {/* Type badge */}
      <div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: ".05em",
          padding: "2px 7px", borderRadius: 4,
          color: tc.text, background: tc.bg, border: `1px solid ${tc.border}`,
        }}>
          {TYPE_LABELS[log.type]}
        </span>
      </div>

      {/* Detail */}
      <div style={{
        fontSize: 12, color: "#6b7280",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 16,
      }}>
        <span style={{ color: "#1a3c6e", fontWeight: 700, marginRight: 7 }}>{log.user}</span>
        {log.detail}
      </div>

      {/* Status badges */}
      <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
        {isPatched && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, letterSpacing: ".06em",
            color: "#16a34a", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)",
          }}>PATCHED</span>
        )}
        {!isPatched && log.detected && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, letterSpacing: ".06em",
            color: "#2563eb", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)",
          }}>ACK</span>
        )}
        {!isPatched && !log.detected && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, letterSpacing: ".06em",
            color: "#dc2626", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)",
          }}>LIVE</span>
        )}
      </div>
    </div>
  );
}
