"use client";

/**
 * VULNERABILITY CONTEXT:
 * Login → POST /api/auth/login
 * SQL: WHERE username = '${username}' AND password = '${password}'
 * Bypass: admin'-- 
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logRealAttack } from "@/lib/logAttack";
import { usePatchedVulns } from "@/hooks/useCampusDefense";
import { PatchedBanner } from "@/components/PatchedBanner";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const patchedVulns = usePatchedVulns();

  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) router.push("/dashboard");

    // VULNERABILITY: next param read from URL with no origin validation
    // Attack URL: /login?next=https://evil.com/fakecampuscare
    const params = new URLSearchParams(window.location.search);
    const nextUrl = params.get("next");
    if (nextUrl) setRedirectTarget(nextUrl);
  }, [router]);

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");

    if (/('|--|OR\s+1=1)/i.test(form.username)) {
      if (!patchedVulns.has("sqli_login")) {
        logRealAttack({ type: "sqli_login", detail: `SQLi auth bypass attempt`, endpoint: "/api/auth/login", method: "POST", payload: `username=${form.username}` });
      }
    } else if (form.username.includes("<script") || form.username.includes("onerror")) {
      if (!patchedVulns.has("xss_login")) {
        logRealAttack({ type: "xss_login", severity: "medium", detail: `Reflected XSS via login error message`, endpoint: "/login", method: "POST", payload: `username=${form.username}` });
      }
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        const nextUrl = new URLSearchParams(window.location.search).get("next");
        if (nextUrl && (nextUrl.startsWith("http://") || nextUrl.startsWith("https://"))) {
          if (!patchedVulns.has("open_redirect")) {
            logRealAttack({ type: "open_redirect", severity: "medium", detail: `Open redirect via ?next=`, endpoint: "/login", payload: `?next=${nextUrl}` });
            // VULNERABILITY: redirects to any URL — no check that it starts with '/'
            router.push(nextUrl || "/dashboard");
          } else {
            // Patched — ignore external redirect, stay on dashboard
            router.push("/dashboard");
          }
        } else {
          router.push(nextUrl || "/dashboard");
        }
      } else {
        // VULNERABILITY: Verbose error reporting leaks SQL query
        const errorMessage = data.error + (data.debug_query ? `\n\n[Query Leaked]:\n${data.debug_query}` : "");
        setError(errorMessage);
      }
    } catch (err) {
      setError("Connection failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--cc-bg)" }}>

      {/* Left — Branding Panel */}
      <div style={{ flex:"0 0 45%", background:"linear-gradient(160deg,#1a3c6e 0%,#2d5f8a 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 40px", position:"relative", overflow:"hidden" }}>
        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-60, left:-60, width:220, height:220, borderRadius:"50%", background:"rgba(245,130,10,0.07)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"40%", left:-30, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }}/>

        <div style={{ position:"relative", textAlign:"center", maxWidth:320 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:40 }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"var(--cc-orange)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:22 }}>C</div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontWeight:900, color:"#fff", fontSize:20, lineHeight:1.1 }}>CampusCare</div>
              <div style={{ fontSize:11, color:"var(--cc-orange)", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>by Entab</div>
            </div>
          </div>

          <div style={{ width:60, height:3, background:"var(--cc-orange)", borderRadius:2, margin:"0 auto 28px" }}/>

          <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", margin:"0 0 10px", lineHeight:1.3 }}>
            Greenfield International School
          </h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.65)", margin:"0 0 40px", lineHeight:1.6 }}>
            Secure student portal. Access your academic dashboard, notices, assignments and results.
          </p>

          {/* Geometric pattern */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, opacity:0.15 }}>
            {Array.from({length:25}).map((_,i)=>(
              <div key={i} style={{ width:"100%", paddingBottom:"100%", borderRadius:3, background: i%3===0 ? "var(--cc-orange)" : "#fff" }}/>
            ))}
          </div>

          <div style={{ marginTop:40, fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, textTransform:"uppercase", letterSpacing:2 }}>
            Academic Year 2025–26
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 32px", background:"#fff" }}>
        <div style={{ width:"100%", maxWidth:420, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(12px)", transition:"all 0.5s" }}>

          {/* Header */}
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:26, fontWeight:900, color:"var(--cc-navy)", margin:"0 0 6px" }}>Welcome Back</h1>
            <p style={{ fontSize:13, color:"var(--cc-text-muted)", margin:0 }}>Sign in to your CampusCare account</p>
          </div>

          {/* Username */}
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Enter your username"
              style={{ width:"100%", border:"1.5px solid var(--cc-border)", borderRadius:8, padding:"11px 14px", fontSize:14, fontFamily:"'DM Mono',monospace", color:"var(--cc-text)", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s", background:"#fafafa" }}
              onFocus={e => (e.target.style.borderColor = "var(--cc-navy)")}
              onBlur={e => (e.target.style.borderColor = "var(--cc-border)")}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <label style={{ fontSize:10, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:1.5 }}>Password</label>
              <button onClick={() => setShowPass(!showPass)} style={{ fontSize:10, fontWeight:700, color:"var(--cc-orange)", background:"none", border:"none", cursor:"pointer", textTransform:"uppercase", letterSpacing:1 }}>
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              style={{ width:"100%", border:"1.5px solid var(--cc-border)", borderRadius:8, padding:"11px 14px", fontSize:14, fontFamily:"'DM Mono',monospace", color:"var(--cc-text)", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s", background:"#fafafa" }}
              onFocus={e => (e.target.style.borderColor = "var(--cc-navy)")}
              onBlur={e => (e.target.style.borderColor = "var(--cc-border)")}
            />
          </div>

          {/* Patch banners for blue team */}
          {patchedVulns.has("sqli_login") && <PatchedBanner label="SQLI — LOGIN" />}
          {patchedVulns.has("open_redirect") && redirectTarget && <PatchedBanner label="OPEN REDIRECT" />}

          {/* VULNERABILITY: Error Display — leaks SQL query via data.query AND enables Reflected XSS */}
          {error && (
            <div style={{ background:"rgba(220,38,38,0.06)", border:"1.5px solid rgba(220,38,38,0.2)", borderRadius:8, padding:"12px 16px", marginBottom:18 }}>
              {patchedVulns.has("xss_login") ? (
                /* Patched — safe text rendering */
                <>
                  <PatchedBanner label="XSS — LOGIN ERROR" />
                  <p style={{ fontSize:12, color:"#dc2626", lineHeight:1.6, margin:0, fontFamily:"monospace", whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
                    Login failed for user &apos;{form.username}&apos;: {error}
                  </p>
                </>
              ) : (
                /* VULNERABILITY: Reflected XSS via dangerouslySetInnerHTML */
                <p className="font-mono whitespace-pre-wrap break-all" style={{ fontSize:12, color:"#dc2626", lineHeight:1.6, margin:0 }}
                   dangerouslySetInnerHTML={{ __html: `<span style="font-weight:800">Login failed for user '${form.username}':</span> ${error}` }}
                />
              )}
            </div>
          )}

          {redirectTarget && !patchedVulns.has("open_redirect") && (
            <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", marginBottom:18 }}>
              ↔ You will be redirected to: <span style={{ color:"#06b6d4" }}>{redirectTarget}</span> after login.
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width:"100%", background: loading ? "#ccc" : "var(--cc-orange)", color:"#fff", border:"none", borderRadius:8, padding:"13px 0", fontSize:15, fontWeight:900, cursor: loading ? "not-allowed" : "pointer", letterSpacing:0.3, transition:"background 0.2s", marginBottom:20 }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>

          {/* Register link */}
          <div style={{ textAlign:"center", marginBottom:18 }}>
            <span style={{ fontSize:13, color:"var(--cc-text-muted)" }}>New student? </span>
            <Link href="/register" style={{ fontSize:13, fontWeight:700, color:"var(--cc-orange)", textDecoration:"none" }}>Register here</Link>
          </div>

          {/* VULNERABILITY: Dev Mode Hint */}
          <div style={{ padding:"12px 16px", background:"rgba(245,158,11,0.06)", border:"1.5px solid rgba(245,158,11,0.2)", borderRadius:8 }}>
            <p style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"rgba(180,83,9,0.85)", lineHeight:1.6, margin:0 }}>
              <span style={{ fontWeight:800, textTransform:"uppercase" }}>⚠ System Message:</span> NODE_ENV=development. System logs and verbose error tracing are currently exposed at{" "}
              <Link href="/api/config" style={{ textDecoration:"underline", color:"rgba(180,83,9,0.85)" }}>/api/config</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}