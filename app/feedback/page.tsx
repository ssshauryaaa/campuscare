"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { logRealAttack } from "@/lib/logAttack";
import { usePatchedVulns } from "@/hooks/useCampusDefense";
import { PatchedBanner } from "@/components/PatchedBanner";
import { MessageSquare, Search, AlertTriangle } from "lucide-react";

export default function FeedbackPage() {
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [viewId, setViewId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [myFeedback, setMyFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const patchedVulns = usePatchedVulns();

  // Fetch the logged-in user's own feedback on load
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    fetch("/api/feedback/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMyFeedback(data.feedback || []));
  }, [submitted]);

  async function handleSubmit() {
    const token = localStorage.getItem("jwt");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.id) {
      setSubmitted(true);
      setContent("");
    }
  }

  // VULNERABLE: fetches any feedback record by raw ID — no ownership check
  async function handleView() {
    setError("");
    setResult(null);
    if (!viewId) return;
    setLoading(true);

    const token = localStorage.getItem("jwt");

    // Check if IDOR is patched — if so, log it but show blocked message
    if (patchedVulns.has("idor_feedback") && myFeedback.length > 0) {
      const myIds = myFeedback.map((f) => String(f.id));
      if (!myIds.includes(viewId)) {
        setError("🛡 Access denied — this vulnerability has been patched by the Blue Team. You can only view your own feedback tickets.");
        setLoading(false);
        logRealAttack({
          type: "idor_feedback",
          severity: "high",
          detail: `IDOR attempt blocked — tried accessing ticket #${viewId}`,
          endpoint: `/api/feedback?id=${viewId}`,
          payload: `GET /api/feedback?id=${viewId}`,
        });
        return;
      }
    }

    const res = await fetch(`/api/feedback?id=${viewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) return setError(data.error);

    // Log IDOR attack if accessing someone else's record
    if (data && myFeedback.length > 0) {
      const myIds = myFeedback.map((f) => String(f.id));
      if (!myIds.includes(viewId)) {
        logRealAttack({
          type: "idor_feedback",
          severity: "high",
          detail: `IDOR: Accessed private feedback ticket #${viewId}`,
          endpoint: `/api/feedback?id=${viewId}`,
          payload: `GET /api/feedback?id=${viewId}  (student accessing another's record)`,
        });
      }
    }

    // Log XSS if admin_response contains script
    if (data?.admin_response && /script|onerror|javascript:/i.test(data.admin_response)) {
      if (!patchedVulns.has("xss_feedback")) {
        logRealAttack({
          type: "xss_feedback",
          severity: "critical",
          detail: "Stored XSS payload in admin_response — fires when student views feedback",
          endpoint: "/feedback",
          payload: data.admin_response,
        });
      }
    }

    setResult(data);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid var(--cc-border)", borderRadius: 8,
    padding: "11px 14px", fontSize: 13, color: "var(--cc-text)", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s", background: "#fafafa",
    fontFamily: "inherit",
  };

  return (
    <div style={{ background: "var(--cc-bg)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ marginLeft: 240, paddingTop: 56 }}>
        <main style={{ padding: "28px", maxWidth: 860 }}>

          {/* Header */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ padding: 8, background: "rgba(26,60,110,0.08)", borderRadius: 8, border: "1px solid rgba(26,60,110,0.15)" }}>
                <MessageSquare style={{ width: 18, height: 18, color: "var(--cc-navy)" }} />
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--cc-navy)", margin: 0 }}>Student Grievance & Feedback</h1>
            </div>
            <p style={{ fontSize: 13, color: "var(--cc-text-muted)", margin: 0 }}>
              Submit your feedback or grievance. Responses from admin will appear on your ticket.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Submit feedback */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--cc-border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--cc-border)", fontSize: 10, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                Submit New Feedback
              </div>
              <div style={{ padding: 20 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--cc-navy)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                  Your Message
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your grievance or feedback in detail..."
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                  onFocus={e => (e.target.style.borderColor = "var(--cc-navy)")}
                  onBlur={e => (e.target.style.borderColor = "var(--cc-border)")}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  style={{ marginTop: 14, width: "100%", background: content.trim() ? "var(--cc-orange)" : "#d1d5db", color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 13, fontWeight: 800, cursor: content.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}
                >
                  Submit Feedback →
                </button>
                {submitted && (
                  <p style={{ marginTop: 10, fontSize: 12, color: "#16a34a", fontWeight: 700 }}>✓ Feedback submitted successfully.</p>
                )}
              </div>
            </div>

            {/* My submissions */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--cc-border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--cc-border)", fontSize: 10, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                My Submissions
              </div>
              <div style={{ padding: 12 }}>
                {myFeedback.length === 0 ? (
                  <p style={{ color: "var(--cc-text-muted)", fontSize: 13, padding: 8 }}>No submissions yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {myFeedback.map((fb) => (
                      <div key={fb.id} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--cc-border)", background: "#f8f9fa" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          {/* ID hint — helps red teamers discover the IDOR vector */}
                          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--cc-navy)", fontFamily: "'DM Mono',monospace" }}>Ticket #{fb.id}</span>
                          <span className={`badge ${fb.status === "resolved" ? "badge-green" : "badge-yellow"}`}>{fb.status}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--cc-text-muted)" }}>{fb.content?.substring(0, 60)}...</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket lookup — IDOR vector */}
          <div style={{ marginTop: 20, background: "#fff", borderRadius: 12, border: "1.5px solid rgba(245,130,10,0.3)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(245,130,10,0.2)", background: "rgba(245,130,10,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle style={{ width: 14, height: 14, color: "var(--cc-orange)" }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: "var(--cc-orange)", textTransform: "uppercase", letterSpacing: 1.5 }}>Support Ticket Lookup</span>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: "var(--cc-text-muted)", margin: "0 0 16px" }}>
                If support gave you a ticket ID, you can look it up here.
              </p>

              {/* Patch banners */}
              {patchedVulns.has("idor_feedback") && <PatchedBanner label="IDOR — FEEDBACK ACCESS" />}
              {patchedVulns.has("xss_feedback") && <PatchedBanner label="XSS — FEEDBACK RESPONSE" />}

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="number"
                  placeholder="Enter ticket ID (e.g. 3)"
                  value={viewId}
                  onChange={(e) => setViewId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleView()}
                  style={{ ...inputStyle, width: "auto", flex: 1 }}
                  onFocus={e => (e.target.style.borderColor = "var(--cc-navy)")}
                  onBlur={e => (e.target.style.borderColor = "var(--cc-border)")}
                />
                <button
                  onClick={handleView}
                  disabled={loading || !viewId}
                  style={{ padding: "11px 20px", background: loading || !viewId ? "#d1d5db" : "var(--cc-navy)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: loading || !viewId ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "background 0.2s" }}
                >
                  <Search style={{ width: 14, height: 14 }} />
                  {loading ? "Looking up..." : "Lookup"}
                </button>
              </div>

              {error && (
                <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 8, background: "rgba(220,38,38,0.06)", border: "1.5px solid rgba(220,38,38,0.2)", fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                  {error}
                </div>
              )}

              {/* VULNERABLE: dumps full raw API response including other students' data */}
              {result && (
                <div style={{ marginTop: 14, padding: 18, background: "#f5f7fa", borderRadius: 10, border: "1px solid var(--cc-border)" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
                    Ticket #{result.id} Details
                  </div>
                  {[
                    ["Submitted by", `${result.username} (${result.email})`],
                    ["Student ID", result.student_id],
                    ["Admission No", result.admission_no],
                    ["Status", result.status],
                    ["Content", result.content],
                  ].map(([label, value]) => (
                    <div key={String(label)} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--cc-border)" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--cc-text-muted)", minWidth: 110, flexShrink: 0 }}>{label}:</span>
                      <span style={{ fontSize: 12, color: "var(--cc-text)", wordBreak: "break-word" }}>{String(value ?? "—")}</span>
                    </div>
                  ))}
                  {/* Admin response — XSS vector */}
                  {result.admin_response && (
                    <div style={{ marginTop: 12, padding: "12px 14px", background: "#fff", borderRadius: 8, border: "1px solid var(--cc-border)" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--cc-navy)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Admin Response</div>
                      {patchedVulns.has("xss_feedback") ? (
                        // PATCHED: safe text rendering
                        <div style={{ fontSize: 13, color: "var(--cc-text)" }}>{result.admin_response}</div>
                      ) : (
                        // VULNERABILITY: dangerouslySetInnerHTML — stored XSS
                        <div dangerouslySetInnerHTML={{ __html: result.admin_response }} style={{ fontSize: 13, color: "var(--cc-text)" }} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
