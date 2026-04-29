"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePatchedVulns } from "@/hooks/useCampusDefense";
import { PatchedBanner } from "@/components/PatchedBanner";
import Navbar from "@/components/Navbar";

const DOCUMENTS = [
  { file: "handbook.txt", label: "Student Handbook 2025-2026", icon: "📖" },
  { file: "code_of_conduct.txt", label: "Campus Code of Conduct", icon: "⚖️" },
];

// ── Inner component — uses useSearchParams (must be inside Suspense) ──────────
function DocumentsInner() {
  const searchParams = useSearchParams();
  const fileParam = searchParams.get("file");

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchedVulns = usePatchedVulns();
  const lfiPatched = patchedVulns.has("lfi_documents");

  useEffect(() => {
    if (!fileParam) { setContent(null); setError(null); return; }

    if (lfiPatched && (fileParam.includes("../") || fileParam.includes("..\\"))) {
      if (typeof window !== "undefined" && (window as any).__logCampusAttack) {
        (window as any).__logCampusAttack({ type: "lfi_documents", severity: "critical", detail: "Blocked LFI attempt (Directory Traversal)", endpoint: `/documents?file=${fileParam}`, payload: fileParam });
      }
      setError("SECURITY EXCEPTION: Directory traversal sequences (../) are not allowed.");
      setContent(null);
      return;
    }

    setLoading(true); setError(null);

    if (fileParam.includes("../") || fileParam.includes("..\\")) {
      if (typeof window !== "undefined" && (window as any).__logCampusAttack) {
        (window as any).__logCampusAttack({ type: "lfi_documents", severity: "critical", detail: "LFI attempt detected (Directory Traversal)", endpoint: `/documents?file=${fileParam}`, payload: fileParam });
      }
    }

    fetch(`/api/documents?file=${encodeURIComponent(fileParam)}`)
      .then(async res => {
        const text = await res.text();
        if (!res.ok) {
          try { const j = JSON.parse(text); throw new Error(j.error || "Failed to load document"); }
          catch { throw new Error(text || "Failed to load document"); }
        }
        return text;
      })
      .then(text => setContent(text))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [fileParam, lfiPatched]);

  return (
    <div style={{ flex: 1, padding: "40px 60px", marginLeft: 240, marginTop: 56 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--cc-navy)", margin: "0 0 8px 0" }}>Campus Documents</h1>
          <p style={{ color: "var(--cc-text-muted)", margin: 0, fontSize: 15 }}>Official policies, handbooks, and public records.</p>
        </div>
      </div>

      {lfiPatched && <PatchedBanner label="LFI — DOCUMENTS" />}

      <div style={{ display: "flex", gap: 30 }}>
        <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {DOCUMENTS.map(doc => {
            const active = fileParam === doc.file;
            return (
              <a key={doc.file} href={`/documents?file=${doc.file}`} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "16px 20px",
                background: active ? "rgba(26,60,110,0.04)" : "#fff",
                border: `1px solid ${active ? "rgba(26,60,110,0.2)" : "var(--cc-border)"}`,
                borderRadius: 12, color: active ? "var(--cc-navy)" : "var(--cc-text)",
                textDecoration: "none", fontWeight: active ? 700 : 500, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 20 }}>{doc.icon}</span>{doc.label}
              </a>
            );
          })}
          <div style={{ marginTop: 20, padding: 16, background: "rgba(245,130,10,0.05)", border: "1px dashed rgba(245,130,10,0.3)", borderRadius: 10, fontSize: 12, color: "var(--cc-text-muted)" }}>
            <strong>Tip:</strong> Documents are fetched dynamically via the <code>?file=</code> parameter.
          </div>
        </div>

        <div style={{ flex: 1, background: "#fff", border: "1px solid var(--cc-border)", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 500 }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--cc-border)", background: "#fafafa" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--cc-text)" }}>
              {fileParam ? `Viewing: ${fileParam}` : "Document Viewer"}
            </span>
          </div>
          <div style={{ flex: 1, padding: 24, overflowY: "auto", position: "relative" }}>
            {!fileParam ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--cc-text-faint)" }}>
                <span style={{ fontSize: 40, marginBottom: 10 }}>📄</span>
                Select a document from the menu to view its contents.
              </div>
            ) : loading ? (
              <div style={{ color: "var(--cc-text-muted)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 16, height: 16, border: "2px solid rgba(26,60,110,0.2)", borderTopColor: "var(--cc-navy)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Loading document...
              </div>
            ) : error ? (
              <div style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626", padding: 16, borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
                {error}
              </div>
            ) : content ? (
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--cc-text)", lineHeight: 1.6 }}>
                {content}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Page shell — Suspense required for useSearchParams in production build ────
export default function DocumentsPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cc-bg)" }}>
      <Navbar />
      <Suspense fallback={
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 240 }}>
          <div style={{ width: 24, height: 24, border: "3px solid rgba(26,60,110,0.15)", borderTopColor: "#1a3c6e", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <DocumentsInner />
      </Suspense>
    </div>
  );
}
