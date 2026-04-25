"use client";

/**
 * VULNERABILITY CONTEXT: 
 * Username enumeration. The live "check-username" endpoint provides 
 * distinct feedback, allowing attackers to map valid users.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Field = "full_name" | "username" | "email" | "password" | "confirm_password" | "class" | "section" | "admission_no";

interface FormState {
  full_name: string; username: string; email: string;
  password: string; confirm_password: string;
  class: string; section: string; admission_no: string;
}

interface FieldError { [k: string]: string }

const inputStyle = (err?: boolean): React.CSSProperties => ({
  width:"100%", border:`1.5px solid ${err ? "#dc2626" : "var(--cc-border)"}`, borderRadius:7, padding:"10px 13px",
  fontSize:13, color:"var(--cc-text)", outline:"none", background:"#fafafa", boxSizing:"border-box", transition:"border-color 0.2s",
});

const labelStyle: React.CSSProperties = {
  display:"block", fontSize:10, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:5,
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    full_name: "", username: "", email: "",
    password: "", confirm_password: "",
    class: "", section: "", admission_no: "",
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [serverError, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [usernameStatus, setUStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");
  const [usernameTimer, setUTimer] = useState<any>(null);

  const set = (key: Field, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: "" }));
    setServerErr("");
  };

  // const onUsernameChange = (val: string) => {
  //   set("username", val);
  //   setUStatus("idle");
  //   if (usernameTimer) clearTimeout(usernameTimer);
  //   if (val.trim().length < 3) return;

  //   const t = setTimeout(async () => {
  //     setUStatus("checking");
  //     try {
  //       const res = await fetch("/api/check-username", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ username: val.trim() }),
  //       });
  //       const data = await res.json();
  //       setUStatus(data.available ? "available" : "taken");
  //     } catch { setUStatus("idle"); }
  //   }, 600);
  //   setUTimer(t);
  // };

  const validate = (): boolean => {
    const e: FieldError = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required.";
    if (!form.username.trim()) e.username = "Username is required.";
    else if (form.username.length < 3) e.username = "Must be at least 3 characters.";
    else if (usernameStatus === "taken") e.username = "This username is already taken.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Must be at least 6 characters.";
    if (form.password !== form.confirm_password) e.confirm_password = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
     console.log("SUBMIT CLICKED");
    if (!validate()) {
  console.log("VALIDATION FAILED", errors);
  return;
}
    setLoading(true);
    setServerErr("");

    const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
   console.log("RESPONSE:", res);

    const data = await res.json();
    if (res.ok && data.success) {
      router.push("/dashboard");
    } else {
      setServerErr(data.error || "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--cc-bg)", display:"flex", flexDirection:"column" }}>

      {/* Top Bar */}
      <header style={{ background:"#fff", borderBottom:"1px solid var(--cc-border)", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:20 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"var(--cc-navy)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:12 }}>C</div>
          <div>
            <div style={{ fontWeight:900, color:"var(--cc-navy)", fontSize:14 }}>CampusCare</div>
            <div style={{ fontSize:8, color:"var(--cc-orange)", fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>by Entab</div>
          </div>
        </Link>
        <span style={{ fontSize:11, fontWeight:700, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2 }}>Greenfield International School</span>
      </header>

      <main style={{ flex:1, display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"36px 24px" }}>
        <div style={{ width:"100%", maxWidth:560 }}>

          {/* Card Header */}
          <div style={{ background:"var(--cc-navy)", borderRadius:"12px 12px 0 0", padding:"16px 24px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--cc-orange)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:11 }}>C</div>
            <div>
              <div style={{ color:"#fff", fontWeight:800, fontSize:14 }}>CampusCare Registration</div>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>Enroll into the Greenfield educational network</div>
            </div>
          </div>

          {/* Card Body */}
          <div style={{ background:"#fff", borderRadius:"0 0 12px 12px", padding:28, border:"1px solid var(--cc-border)", borderTop:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.07)" }}>

            {/* Row 1: Full Name + Username */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" value={form.full_name} onChange={e=>set("full_name",e.target.value)} placeholder="Aryan Kumar"
                  style={inputStyle(!!errors.full_name)}
                  onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor=errors.full_name?"#dc2626":"var(--cc-border)")} />
                {errors.full_name && <p style={{ fontSize:10, color:"#dc2626", margin:"4px 0 0", fontFamily:"'DM Mono',monospace" }}>{errors.full_name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Username <span style={{ fontWeight:500, color:"var(--cc-text-muted)" }}>(Live Sync)</span></label>
                <input type="text" value={form.username} onChange={e=>set("username",e.target.value)} placeholder="aryan.k"
                  style={{ ...inputStyle(!!errors.username), borderColor: usernameStatus==="taken"?"#dc2626": usernameStatus==="available"?"#16a34a":errors.username?"#dc2626":"var(--cc-border)", fontFamily:"'DM Mono',monospace" }}
                  onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor="var(--cc-border)")} />
                <div style={{ minHeight:16, marginTop:4 }}>
                  {usernameStatus==="checking" && <span style={{ fontSize:10, color:"var(--cc-text-muted)", fontFamily:"'DM Mono',monospace" }}>Scanning directory...</span>}
                  {usernameStatus==="taken" && <span style={{ fontSize:10, color:"#dc2626", fontFamily:"'DM Mono',monospace" }}>🔴 Error: Identity already indexed in database.</span>}
                  {usernameStatus==="available" && <span style={{ fontSize:10, color:"#16a34a", fontFamily:"'DM Mono',monospace" }}>✓ Unique identifier confirmed.</span>}
                  {errors.username && <p style={{ fontSize:10, color:"#dc2626", margin:0, fontFamily:"'DM Mono',monospace" }}>{errors.username}</p>}
                </div>
              </div>
            </div>

            {/* Row 2: Email */}
            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="aryan@student.greenfield.edu"
                style={inputStyle(!!errors.email)}
                onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor="var(--cc-border)")} />
            </div>

            {/* Row 3: Class + Section + Admission No */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
              <div>
                <label style={labelStyle}>Class</label>
                <select onChange={e=>set("class",e.target.value)} style={{ ...inputStyle(), appearance:"none", cursor:"pointer" }}
                  onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor="var(--cc-border)")}>
                  <option value="">Class</option>
                  <option>XI</option><option>XII</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Section</label>
                <select onChange={e=>set("section",e.target.value)} style={{ ...inputStyle(), appearance:"none", cursor:"pointer" }}
                  onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor="var(--cc-border)")}>
                  <option value="">Sec</option>
                  <option>A</option><option>B</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Admission No</label>
                <input type="text" placeholder="ADM-001" onChange={e=>set("admission_no",e.target.value)}
                  style={{ ...inputStyle(), fontFamily:"'DM Mono',monospace" }}
                  onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor="var(--cc-border)")} />
              </div>
            </div>

            {/* Row 4: Password + Confirm */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <label style={{ ...labelStyle, marginBottom:0 }}>Password</label>
                  <button onClick={()=>setShowPass(!showPass)} style={{ fontSize:10, color:"var(--cc-orange)", background:"none", border:"none", cursor:"pointer", fontWeight:700, textTransform:"uppercase" }}>
                    {showPass?"Hide":"Show"}
                  </button>
                </div>
                <input type={showPass?"text":"password"} value={form.password} onChange={e=>set("password",e.target.value)}
                  style={inputStyle(!!errors.password)}
                  onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor="var(--cc-border)")} />
                {errors.password && <p style={{ fontSize:10, color:"#dc2626", margin:"4px 0 0", fontFamily:"'DM Mono',monospace" }}>{errors.password}</p>}
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type={showPass?"text":"password"} value={form.confirm_password} onChange={e=>set("confirm_password",e.target.value)}
                  style={inputStyle(!!errors.confirm_password)}
                  onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor="var(--cc-border)")} />
                {errors.confirm_password && <p style={{ fontSize:10, color:"#dc2626", margin:"4px 0 0", fontFamily:"'DM Mono',monospace" }}>{errors.confirm_password}</p>}
              </div>
            </div>

            {serverError && (
              <div style={{ background:"rgba(220,38,38,0.06)", border:"1.5px solid rgba(220,38,38,0.2)", borderRadius:8, padding:"10px 14px", marginBottom:16 }}>
                <p style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"#dc2626", margin:0 }}>{serverError}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading || usernameStatus==="taken"}
              style={{ width:"100%", background: loading||usernameStatus==="taken" ? "#d1d5db" : "var(--cc-orange)", color:"#fff", border:"none", borderRadius:8, padding:"13px 0", fontSize:14, fontWeight:900, cursor: loading?"not-allowed":"pointer", transition:"background 0.2s" }}>
              {loading ? "Creating Account…" : "Create Account →"}
            </button>

            <div style={{ marginTop:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontSize:12, color:"var(--cc-text-muted)", margin:0 }}>
                Already have an account? <Link href="/login" style={{ color:"var(--cc-orange)", fontWeight:700, textDecoration:"none" }}>Login here</Link>
              </p>
              <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", opacity:0.6 }}>SYS_ADMIN: admin@campuscare.local</span>
            </div>

            {/* Explicit Vulnerability Note */}
            <div style={{ marginTop:20, padding:"12px 16px", background:"rgba(245,158,11,0.06)", border:"1.5px solid rgba(245,158,11,0.2)", borderRadius:8, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:4, right:8, fontSize:20, opacity:0.12, fontStyle:"italic", fontWeight:900 }}>DEV</div>
              <p style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"rgba(180,83,9,0.85)", lineHeight:1.6, margin:0, textTransform:"uppercase", letterSpacing:0.5 }}>
                <span style={{ fontWeight:900, background:"rgba(180,83,9,0.15)", padding:"1px 4px", borderRadius:2 }}>SEC_ALERT</span>{" "}
                Development build active. Password encryption (Bcrypt) disabled for debugging.
                Username enumeration vulnerability present in live-check module.
              </p>
              {/* SYSTEM: role field defaults to 'student'. Staff onboarding: include role in payload. */}
            </div>
          </div>
        </div>
      </main>

      <footer style={{ background:"#fff", borderTop:"1px solid var(--cc-border)", padding:"10px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)" }}>CampusCare v2.3.1_STABLE</span>
        <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#d97706", display:"inline-block" }}/>
          ENV: <span style={{ color:"#d97706" }}>DEVELOPMENT_MODE</span>
        </span>
      </footer>
    </div>
  );
}