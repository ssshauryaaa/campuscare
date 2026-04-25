"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// VULNERABILITY CONTEXT:
// Token Generation: base64(username + ":" + timestamp)
// e.g. YWRtaW46MTcwOTM0MjgzMDA=

export default function ResetPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMsg("");
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request", username }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(data.message);
      setStep(2);
    } else {
      setError(data.error || "Failed to request reset.");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMsg("");
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset", token, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Password successfully reset! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(data.error || "Failed to reset password.");
    }
  };

  const inputStyle = { width:"100%", padding:"11px 14px", fontSize:14, fontFamily:"'DM Mono',monospace", border:"1.5px solid var(--cc-border)", borderRadius:8, background:"#fafafa", outline:"none", marginBottom:16 };
  const labelStyle = { display:"block", fontSize:10, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 } as React.CSSProperties;

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cc-bg)" }}>
      <div style={{ background:"#fff", padding:36, borderRadius:12, width:"100%", maxWidth:420, boxShadow:"0 4px 20px rgba(0,0,0,0.08)", border:"1px solid var(--cc-border)" }}>
        
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"var(--cc-orange)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, margin:"0 auto 12px" }}>C</div>
          <h2 style={{ margin:"0 0 4px", color:"var(--cc-navy)", fontSize:22, fontWeight:900 }}>Password Reset</h2>
          <p style={{ margin:0, color:"var(--cc-text-muted)", fontSize:13 }}>Account Recovery Portal</p>
        </div>

        {error && <div style={{ padding:"10px 14px", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, color:"#dc2626", fontSize:12, marginBottom:20, fontFamily:"'DM Mono',monospace" }}>{error}</div>}
        {msg && <div style={{ padding:"10px 14px", background:"rgba(22,163,74,0.08)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:8, color:"#16a34a", fontSize:12, marginBottom:20, fontFamily:"'DM Mono',monospace" }}>{msg}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequest}>
            <label style={labelStyle}>Username</label>
            <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="student1" style={inputStyle} />
            <button type="submit" style={{ width:"100%", padding:"12px 0", background:"var(--cc-navy)", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:900, cursor:"pointer" }}>Send Reset Link →</button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <label style={labelStyle}>Reset Token</label>
            <input type="text" value={token} onChange={e=>setToken(e.target.value)} placeholder="Paste token here" style={inputStyle} />
            <label style={labelStyle}>New Password</label>
            <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            <button type="submit" style={{ width:"100%", padding:"12px 0", background:"var(--cc-orange)", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:900, cursor:"pointer" }}>Reset Password ✓</button>
          </form>
        )}

        <div style={{ marginTop:24, textAlign:"center" }}>
          <Link href="/login" style={{ fontSize:12, color:"var(--cc-text-muted)", textDecoration:"none", fontWeight:700 }}>← Back to Login</Link>
        </div>

        {/* SYSTEM HINT */}
        <div style={{ marginTop:28, paddingTop:16, borderTop:"1px solid var(--cc-border)", fontSize:10, fontFamily:"'DM Mono',monospace", color:"rgba(245,158,11,0.8)" }}>
          <span style={{ fontWeight:800 }}>DEV NOTE:</span> Token generation algorithm upgraded to Base64 serialization incorporating unique user identity and temporal sequence markers. Email gateway currently disabled; use CLI debug access to fetch tokens.
        </div>
      </div>
    </div>
  );
}
