"use client";
import React, { useState } from "react";
import { VULN_SNIPPETS } from "@/constants/vulnSnippets";
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
  
  const [activeIdx, setActiveIdx] = useState(0);
  const [codes, setCodes] = useState<string[]>(() => files.map(f => f.vulnerableSnippet));
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!vuln || files.length === 0) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
         <div style={{ background: "#fff", padding: 24, borderRadius: 12, fontFamily: sans, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
           <h3 style={{ margin: "0 0 10px" }}>No Snippet Available</h3>
           <p style={{ margin: "0 0 20px", color: "#6b7280" }}>We don't have a code sample configured for this vulnerability type yet.</p>
           <button onClick={onClose} style={{ padding: "8px 16px", background: "#1a3c6e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Close</button>
         </div>
      </div>
    );
  }

  const activeFile = files[activeIdx];
  const activeCode = codes[activeIdx];

  const handleApply = async () => {
    // Require that at least the active file is not empty
    if (!activeCode?.trim()) return;
    setLoading(true);
    // Simulate build/deploy delay for realism
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onApply();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(26, 60, 110, 0.4)", backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#f5f7fa", width: "90%", maxWidth: 900, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", animation: "fadeup 0.3s ease-out forwards" }}>
        
        {/* Header */}
        <div style={{ padding: "16px 24px", background: "#1a3c6e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: ".02em" }}>IDE // Fix Code</h2>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{vuln.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 400 }}>
          {/* Left panel — Instructions */}
          <div style={{ width: 300, background: "#fff", padding: 24, borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Vulnerability</div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: "0 0 24px" }}>
              {vuln.description}
            </p>

            <div style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Target File</div>
            <div style={{ fontSize: 12, fontFamily: mono, color: "#f5820a", background: "rgba(245,130,10,0.1)", padding: "6px 10px", borderRadius: 6, marginBottom: "auto", wordBreak: "break-all" }}>
              {activeFile.path}
            </div>

            <button 
              onClick={() => setShowHint(!showHint)}
              style={{ background: "none", border: "1px solid #cbd5e1", padding: "10px", borderRadius: 8, color: "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", marginTop: 20 }}
            >
              {showHint ? "Hide Solution Hint" : "Need a hint?"}
            </button>
          </div>

          {/* Right panel — Editor */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#1e1e1e" }}>
            {/* Editor tabs */}
            <div style={{ display: "flex", background: "#2d2d2d", padding: "8px 16px 0", gap: 4 }}>
              {files.map((f, i) => {
                const isActive = activeIdx === i;
                return (
                  <button 
                    key={i} 
                    onClick={() => { setActiveIdx(i); setShowHint(false); }}
                    style={{ 
                      background: isActive ? "#1e1e1e" : "transparent", 
                      padding: "8px 16px", 
                      borderTopLeftRadius: 6, borderTopRightRadius: 6, 
                      color: isActive ? "#d4d4d4" : "#858585", 
                      fontSize: 12, fontFamily: sans, fontWeight: 600, 
                      borderTop: isActive ? "2px solid #f5820a" : "2px solid transparent",
                      border: "none", cursor: "pointer", transition: "all 0.2s"
                    }}>
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Hint overlay */}
            {showHint && (
              <div style={{ background: "#0f172a", borderBottom: "1px solid #334155", padding: 16 }}>
                <div style={{ fontSize: 10, color: "#38bdf8", fontWeight: 700, letterSpacing: ".1em", marginBottom: 6 }}>SOLUTION HINT:</div>
                <pre style={{ margin: 0, color: "#e2e8f0", fontSize: 12, fontFamily: mono, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {activeFile.fixHint}
                </pre>
              </div>
            )}

            {/* Textarea */}
            <textarea
              value={activeCode}
              onChange={e => {
                const newCodes = [...codes];
                newCodes[activeIdx] = e.target.value;
                setCodes(newCodes);
              }}
              spellCheck={false}
              style={{
                flex: 1, width: "100%", background: "transparent", border: "none", color: "#d4d4d4",
                padding: 16, fontSize: 14, fontFamily: mono, lineHeight: 1.6, outline: "none", resize: "none",
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: "16px 24px", background: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "10px 18px", background: "transparent", border: "1px solid #cbd5e1", borderRadius: 8, color: "#6b7280", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: sans }}>
            Cancel
          </button>
          <button 
            onClick={handleApply} 
            disabled={loading || !activeCode?.trim()}
            style={{ padding: "10px 24px", background: "#16a34a", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: sans, opacity: (!activeCode?.trim() || loading) ? 0.7 : 1 }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Deploying Patch...
              </>
            ) : (
              <>
                <span>⚡</span> Apply Fix
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeup { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
