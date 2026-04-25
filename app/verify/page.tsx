"use client";
// VULNERABILITY CONTEXT:
// PIN verification screen — PIN is 4 digits. Rate limit counter disabled by developer.
// "Since staff complained about lockouts, rate-limiting on verify is turned off temporarily."

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    
    const data = await res.json();
    if (res.ok && data.success) {
      setSuccess("PIN verified! Token: " + data.token);
      setError("");
    } else {
      setError(data.error || "Incorrect PIN.");
      setSuccess("");
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--cc-bg)" }}>
      <div style={{ background:"#fff", padding:30, borderRadius:12, width:"100%", maxWidth:400, boxShadow:"0 4px 20px rgba(0,0,0,0.08)", border:"1px solid var(--cc-border)" }}>
        
        <h2 style={{ margin:"0 0 8px", color:"var(--cc-navy)", fontSize:20, fontWeight:900 }}>Verify Action</h2>
        <p style={{ margin:"0 0 24px", color:"var(--cc-text-muted)", fontSize:13 }}>
          Enter the 4-digit PIN sent to your device to authorize this action.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>
              4-Digit PIN
            </label>
            <input 
              type="text" 
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\\D/g, ""))}
              placeholder="0000"
              style={{ width:"100%", padding:"12px 14px", fontSize:24, fontFamily:"'DM Mono',monospace", letterSpacing:8, textAlign:"center", border:"1.5px solid var(--cc-border)", borderRadius:8, background:"#fafafa", outline:"none" }}
            />
          </div>

          {error && (
            <div style={{ padding:"10px 14px", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, color:"#dc2626", fontSize:12, marginBottom:20, fontFamily:"'DM Mono',monospace" }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding:"10px 14px", background:"rgba(22,163,74,0.08)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:8, color:"#16a34a", fontSize:12, marginBottom:20, fontFamily:"'DM Mono',monospace", wordBreak:"break-all" }}>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            style={{ width:"100%", padding:"12px 0", background:"var(--cc-orange)", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:900, cursor:"pointer" }}
          >
            Verify PIN →
          </button>
        </form>

        {/* VULNERABILITY HINT */}
        <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid var(--cc-border)" }}>
          <p style={{ margin:0, fontSize:10, color:"rgba(245,158,11,0.8)", fontFamily:"'DM Mono',monospace", background:"rgba(245,158,11,0.08)", padding:"8px 12px", borderRadius:6, border:"1px dashed rgba(245,158,11,0.3)" }}>
            [DEV_NOTE] Rate-limit middleware (429) temporarily disabled on this route for automated load-testing. Do not deploy to production.
          </p>
        </div>
      </div>
    </div>
  );
}
