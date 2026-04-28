"use client";
import React from "react";
import type { AttackType } from "@/types/defense";
import { VulnerabilityScanner } from "@/components/defense/VulnerabilityScanner";

type Props = {
  patchedTypes: Set<AttackType>;
  onScanComplete: (pts: number) => void;
};

export function ScanTab({ patchedTypes, onScanComplete }: Props) {
  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden", position: "relative" }}>
      {/* Render the scanner inline, not as a modal overlay */}
      <ScanInline patchedTypes={patchedTypes} onScanComplete={onScanComplete} />
    </div>
  );
}

// Wraps VulnerabilityScanner so it renders inline (no fixed positioning)
function ScanInline({ patchedTypes, onScanComplete }: Props) {
  // We need a version without fixed overlay; we replicate the inner content
  // by just using the existing component in a scoped container that overrides fixed
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0d1117", overflow: "hidden" }}>
      <style>{`
        /* Scope: force VulnerabilityScanner to render inline within this tab */
        .scan-tab-inner > div:first-child {
          position: relative !important;
          inset: auto !important;
          background: transparent !important;
          backdrop-filter: none !important;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: stretch !important;
          justify-content: stretch !important;
        }
        .scan-tab-inner > div:first-child > div:first-child {
          width: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          height: 100% !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          border: none !important;
        }
      `}</style>
      <div className="scan-tab-inner" style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <VulnerabilityScanner
          patchedTypes={patchedTypes}
          onClose={() => {/* no-op: no modal to close */}}
          onScanComplete={onScanComplete}
        />
      </div>
    </div>
  );
}
