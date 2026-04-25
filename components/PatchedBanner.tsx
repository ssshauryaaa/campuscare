"use client";
import React from "react";

/**
 * PatchedBanner
 * Shown on vulnerable pages when the blue team has patched a vulnerability.
 * Signals to the red team that the exploit path has been closed.
 */
export function PatchedBanner({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 16px", borderRadius: 8, margin: "10px 0",
      background: "linear-gradient(135deg, rgba(22,163,74,0.07) 0%, rgba(22,163,74,0.12) 100%)",
      border: "1px solid rgba(22,163,74,0.25)",
    }}>
      {/* Shield icon */}
      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(22,163,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#16a34a" />
          <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: "#16a34a", background: "rgba(22,163,74,0.15)", padding: "1px 7px", borderRadius: 4 }}>
            🛡 PATCHED
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#15803d", letterSpacing: ".06em" }}>{label}</span>
        </div>
        <div style={{ fontSize: 11, color: "#4a6a52", marginTop: 2, fontFamily: "system-ui, sans-serif" }}>
          Blue Team has patched this vulnerability. This exploit path is now closed.
        </div>
      </div>
      <div style={{ fontSize: 18, opacity: 0.5 }}>✓</div>
    </div>
  );
}
