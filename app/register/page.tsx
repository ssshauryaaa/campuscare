"use client";
// VULNERABILITY: Username enumeration via different error messages
// "Username 'X' is already taken" vs "Self-registration is disabled"

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep]     = useState<"form" | "checking">("form");
  const [username, setUser] = useState("");
  const [msg, setMsg]       = useState<{ text: string; type: "error" | "taken" | "" }>({ text: "", type: "" });

  // Probe username existence (the enumeration vulnerability)
  const checkUsername = async () => {
    if (!username.trim()) return;
    setStep("checking");
    setMsg({ text: "", type: "" });

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password: "placeholder", full_name: "x" }),
    });
    const d = await res.json();

    if (res.status === 409) {
      // VULNERABILITY: This message confirms the username EXISTS in the database
      setMsg({ text: d.error, type: "taken" });
    } else {
      setMsg({ text: d.error || d.message || "", type: "error" });
    }
    setStep("form");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: "1px solid var(--border)", padding: "14px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--surface)",
      }}>
        <Link href="/" style={{ color: "var(--accent)", fontWeight: "bold", fontSize: 15, textDecoration: "none" }}>
          🏫 CampusCare
        </Link>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Greenfield International School</div>
      </div>

      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: "1fr 460px 1fr",
        alignItems: "center", padding: "48px 24px",
      }}>
        <div />
        <div>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 6, letterSpacing: -0.5 }}>
              Create account
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              Request access to CampusCare
            </p>
          </div>

          {/* Disabled banner */}
          <div style={{
            background: "rgba(234,179,8,0.06)",
            border: "1px solid rgba(234,179,8,0.2)",
            borderRadius: 6,
            padding: "12px 16px",
            marginBottom: 24,
            fontSize: 13,
            color: "#fde047",
            lineHeight: 1.6,
          }}>
            <strong>⚠ Registration is currently disabled.</strong><br />
            Contact <span style={{ fontFamily: "monospace" }}>admin@campuscare.local</span> to get an account.
          </div>

          {/* Form card */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: 28, marginBottom: 16,
            opacity: 0.75,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {["Full Name", "Email"].map(label => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                    {label}
                  </label>
                  <input
                    disabled
                    placeholder={label === "Full Name" ? "Aryan Kumar" : "aryan@school.local"}
                    style={{
                      width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
                      borderRadius: 5, padding: "9px 12px", color: "var(--muted)",
                      fontSize: 13, fontFamily: "monospace", cursor: "not-allowed",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Username — the only live field */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: "block", fontSize: 11, color: "var(--accent)",
                textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6,
              }}>
                Username <span style={{ color: "var(--muted)", fontWeight: "normal", textTransform: "none" }}>(availability check enabled)</span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUser(e.target.value); setMsg({ text: "", type: "" }); }}
                  onKeyDown={e => e.key === "Enter" && checkUsername()}
                  placeholder="Choose a username"
                  autoComplete="off"
                  spellCheck={false}
                  style={{
                    flex: 1, background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: 5, padding: "9px 12px", color: "var(--text)",
                    fontSize: 13, fontFamily: "monospace", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
                <button
                  onClick={checkUsername}
                  disabled={step === "checking" || !username.trim()}
                  style={{
                    background: "var(--surface)", color: "var(--text)",
                    border: "1px solid var(--border)", borderRadius: 5,
                    padding: "9px 14px", fontSize: 12, fontFamily: "monospace",
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  {step === "checking" ? "..." : "Check"}
                </button>
              </div>

              {/* Enumeration result */}
              {msg.text && (
                <div style={{
                  marginTop: 8, fontSize: 12, fontFamily: "monospace",
                  padding: "7px 10px", borderRadius: 4,
                  background: msg.type === "taken" ? "rgba(239,68,68,0.08)" : "rgba(234,179,8,0.06)",
                  border: msg.type === "taken" ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(234,179,8,0.2)",
                  color: msg.type === "taken" ? "#fca5a5" : "#fde047",
                }}>
                  {msg.type === "taken" && "🔴 "}{msg.text}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[
                { label: "Password", placeholder: "Min. 8 characters" },
                { label: "Admission No", placeholder: "S2024XXX" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    disabled
                    placeholder={f.placeholder}
                    type={f.label === "Password" ? "password" : "text"}
                    style={{
                      width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
                      borderRadius: 5, padding: "9px 12px", color: "var(--muted)",
                      fontSize: 13, fontFamily: "monospace", cursor: "not-allowed",
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {["Class", "Section"].map(label => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                    {label}
                  </label>
                  <select disabled style={{
                    width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: 5, padding: "9px 12px", color: "var(--muted)",
                    fontSize: 13, fontFamily: "monospace", cursor: "not-allowed",
                  }}>
                    <option>Select {label.toLowerCase()}</option>
                  </select>
                </div>
              ))}
            </div>

            <button disabled style={{
              width: "100%", background: "var(--border)", color: "var(--muted)",
              border: "none", borderRadius: 5, padding: 11,
              fontSize: 14, fontFamily: "monospace", cursor: "not-allowed",
            }}>
              Submit Request (Disabled)
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
            <span>
              Have an account? <Link href="/login" style={{ color: "var(--accent)" }}>Login →</Link>
            </span>
            <span style={{ fontFamily: "monospace" }}>admin@campuscare.local</span>
          </div>
        </div>
        <div />
      </div>

      <div style={{ borderTop: "1px solid var(--border)", padding: "12px 28px", display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
        <span>CampusCare v2.3.1</span>
        <span>Environment: <span style={{ color: "var(--yellow)" }}>development</span></span>
      </div>
    </div>
  );
}