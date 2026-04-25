"use client";
import React, { useState } from "react";
import type { LogEntry, AttackType } from "@/types/defense";
import { SEV_CONFIG, TYPE_LABELS, TYPE_COLORS, PATCH_POINTS, mono, sans } from "@/constants/campusTheme";
import { VulnCodeEditor } from "@/components/defense/VulnCodeEditor";

type Props = {
  selectedLog: LogEntry | undefined;
  patchedTypes: Set<AttackType>;
  toast: { msg: string; ok: boolean } | null;
  onAcknowledge: (id: string) => void;
  onMarkPatched: (type: AttackType) => void;
};

export function ThreatInspector({ selectedLog, patchedTypes, toast, onAcknowledge, onMarkPatched }: Props) {
  const [isFixing, setIsFixing] = useState(false);

  // Empty state
  if (!selectedLog) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12, padding: 32 }}>
        {/* Shield icon in navy */}
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.15 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#1a3c6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#d1d5db", fontFamily: sans }}>SELECT A THREAT EVENT</div>
        <div style={{ fontSize: 11, color: "#d1d5db", fontFamily: sans }}>Click any log row to inspect</div>
      </div>
    );
  }

  const sev = SEV_CONFIG[selectedLog.severity];
  const tc = TYPE_COLORS[selectedLog.type];
  const isPatched = patchedTypes.has(selectedLog.type);
  const canAck = !selectedLog.detected && !isPatched;
  const canMarkPatched = selectedLog.detected && !isPatched;
  const points = PATCH_POINTS[selectedLog.type];
  const time = new Date(selectedLog.ts).toLocaleTimeString("en-IN");

  return (
    <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16, fontFamily: sans }}>

      {/* Threat card */}
      <div style={{ background: "#fff", border: `1px solid ${sev.dot}33`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {/* Severity colour bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${sev.dot}, transparent)` }} />
        <div style={{ padding: "16px 18px" }}>

          {/* Type badge + severity */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", padding: "2px 8px", borderRadius: 4, color: tc.text, background: tc.bg, border: `1px solid ${tc.border}` }}>
              {TYPE_LABELS[selectedLog.type]}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: sev.dot }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: sev.color, letterSpacing: ".06em" }}>{sev.label}</span>
            </div>
          </div>

          {/* Attacker handle */}
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1a3c6e", marginBottom: 4, letterSpacing: "-.01em" }}>{selectedLog.user}</div>

          {/* Detail */}
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.65, marginBottom: 14 }}>{selectedLog.detail}</div>

          {/* Metadata grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#f5f7fa", borderRadius: 8, padding: 12, marginBottom: 12 }}>
            {[
              ["SOURCE IP",  selectedLog.ip],
              ["COUNTRY",    selectedLog.country],
              ["ENDPOINT",   selectedLog.endpoint],
              ["METHOD",     selectedLog.method],
              ["PORT",       String(selectedLog.port)],
              ["STATUS",     String(selectedLog.statusCode)],
              ["TIME",       time],
              ["USER AGENT", selectedLog.userAgent.slice(0, 28) + "…"],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: ".08em", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#374151", wordBreak: "break-all", fontFamily: label === "SOURCE IP" ? mono : sans }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Raw payload */}
          <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: ".08em", marginBottom: 5 }}>RAW PAYLOAD</div>
          <div style={{
            background: "#1a3c6e", borderRadius: 6, padding: "10px 12px",
            fontSize: 11, color: "#93c5fd", whiteSpace: "pre-wrap", wordBreak: "break-all",
            lineHeight: 1.7, fontFamily: mono, maxHeight: 100, overflowY: "auto",
          }}>
            {selectedLog.payload}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {isPatched ? (
        <div style={{
          padding: "14px 16px", background: "rgba(22,163,74,0.06)",
          border: "1px solid rgba(22,163,74,0.18)", borderRadius: 10,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 22, height: 22, background: "rgba(22,163,74,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "#16a34a" }}>✓</span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", marginBottom: 2 }}>Vulnerability Patched</div>
            <div style={{ fontSize: 11, color: "#4a6a52" }}>{TYPE_LABELS[selectedLog.type]} is closed. No further attacks of this type will score.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Step 1 — Acknowledge */}
          <button
            onClick={() => onAcknowledge(selectedLog.id)}
            disabled={!canAck}
            style={{
              fontFamily: sans, width: "100%", padding: "13px 16px", borderRadius: 8,
              fontSize: 12, fontWeight: 700, letterSpacing: ".04em",
              cursor: canAck ? "pointer" : "default",
              border: selectedLog.detected ? "1px solid rgba(22,163,74,0.3)" : canAck ? "1px solid #1a3c6e" : "1px solid #e2e8f0",
              background: selectedLog.detected ? "rgba(22,163,74,0.06)" : canAck ? "rgba(26,60,110,0.06)" : "#f9fafb",
              color: selectedLog.detected ? "#16a34a" : canAck ? "#1a3c6e" : "#9ca3af",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "all .15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>{selectedLog.detected ? "✓" : "◉"}</span>
              <div style={{ textAlign: "left" }}>
                <div>{selectedLog.detected ? "Acknowledged" : "Acknowledge Threat"}</div>
                <div style={{ fontSize: 10, fontWeight: 400, color: selectedLog.detected ? "#4a6a52" : "#6b7280", marginTop: 1 }}>
                  {selectedLog.detected ? "Step 1 complete — now patch the code" : "Mark as triaged to unlock patch scoring"}
                </div>
              </div>
            </div>
            {!selectedLog.detected && <span style={{ fontSize: 10, color: "#1a3c6e", fontWeight: 700 }}>+40 pts</span>}
          </button>

          {/* Step 2 — Fix Vulnerability */}
          <button
            onClick={() => canMarkPatched && setIsFixing(true)}
            disabled={!canMarkPatched}
            style={{
              fontFamily: sans, width: "100%", padding: "13px 16px", borderRadius: 8,
              fontSize: 12, fontWeight: 700, letterSpacing: ".04em",
              cursor: canMarkPatched ? "pointer" : "default",
              border: canMarkPatched ? "1px solid #f5820a" : "1px solid #e2e8f0",
              background: canMarkPatched ? "rgba(245,130,10,0.08)" : "#f9fafb",
              color: canMarkPatched ? "#f5820a" : "#9ca3af",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "all .15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>⚡</span>
              <div style={{ textAlign: "left" }}>
                <div>Fix Vulnerability Code</div>
                <div style={{ fontSize: 10, fontWeight: 400, color: canMarkPatched ? "#c2680a" : "#9ca3af", marginTop: 1 }}>
                  {canMarkPatched ? "Open IDE to fix the code and claim points" : "Acknowledge threat first"}
                </div>
              </div>
            </div>
            {canMarkPatched && (
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#f5820a" }}>+{points}</span>
                <div style={{ fontSize: 9, color: "#c2680a" }}>pts</div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          ...(toast.ok
            ? { background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", color: "#16a34a" }
            : { background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }),
        }}>
          {toast.msg}
        </div>
      )}

      {/* Code Editor Modal */}
      {isFixing && selectedLog && (
        <VulnCodeEditor
          type={selectedLog.type}
          onClose={() => setIsFixing(false)}
          onApply={() => {
            setIsFixing(false);
            onMarkPatched(selectedLog.type);
          }}
        />
      )}
    </div>
  );
}
