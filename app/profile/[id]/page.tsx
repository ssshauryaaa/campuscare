"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Mail, Shield, School, Hash, Fingerprint, ChevronRight, AlertTriangle } from "lucide-react";
import { logRealAttack } from "@/lib/logAttack";
import { usePatchedVulns } from "@/hooks/useCampusDefense";
import { PatchedBanner } from "@/components/PatchedBanner";

interface Profile {
  id: number; username: string; email: string; full_name: string;
  class: string; section: string; admission_no: string; role: string;
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSession] = useState<number | null>(null);
  const patchedVulns = usePatchedVulns();

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    try {
      const payload = JSON.parse(atob(match[1].split(".")[1]));
      setSession(payload.id);
    } catch { router.push("/login"); return; }

    if (!id) return;
    setLoading(true);

    if (typeof id === "string" && !/^\d+$/.test(id)) {
      logRealAttack({ type: "sqli_profile", severity: "critical", detail: "SQLi via profile URL parameter", endpoint: `/api/profile/${id}`, payload: id });
    }

    fetch(`/api/profile/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.profile) {
          setProfile(d.profile);
          setError("");
          if (/<script|onerror|javascript:/i.test(d.profile.full_name)) {
            logRealAttack({ type: "xss_profile", severity: "high", detail: "Stored XSS via full_name", endpoint: `/profile/${id}`, payload: d.profile.full_name });
          }
        } else {
          setError(d.error || "User not found");
          setProfile(null);
        }
        setLoading(false);
      });
  }, [id, router]);

  const isOwn = sessionUserId === profile?.id;

  const roleStyle = (role: string): React.CSSProperties => ({
    fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:1, padding:"3px 10px", borderRadius:20,
    background: role==="admin" ? "rgba(220,38,38,0.12)" : role==="staff" ? "rgba(202,138,4,0.12)" : "rgba(26,60,110,0.12)",
    color:      role==="admin" ? "#dc2626"              : role==="staff" ? "#b45309"             : "#1a3c6e",
    border:     `1px solid ${role==="admin" ? "rgba(220,38,38,0.25)" : role==="staff" ? "rgba(202,138,4,0.25)" : "rgba(26,60,110,0.25)"}`,
  });

  const avatarColor = (role: string) => role==="admin" ? "#dc2626" : role==="staff" ? "#d97706" : "var(--cc-orange)";

  return (
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:680 }}>

          {/* Breadcrumbs */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <nav style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1 }}>
              <Link href="/search" style={{ color:"var(--cc-orange)", textDecoration:"none", fontWeight:700 }}>Directory</Link>
              <ChevronRight style={{ width:12, height:12 }} />
              <span style={{ color:"var(--cc-navy)", fontWeight:700 }}>User_Record_{id}</span>
            </nav>

            {!isOwn && profile && (
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 12px", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:6, fontSize:10, fontWeight:800, color:"#dc2626" }}>
                <AlertTriangle style={{ width:12, height:12 }} />
                UNAUTHORIZED_VIEW
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ height:120, background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", opacity:0.5, animation:"pulse 1.5s ease-in-out infinite" }}/>
              <div style={{ height:260, background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", opacity:0.5, animation:"pulse 1.5s ease-in-out infinite" }}/>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ background:"rgba(220,38,38,0.05)", border:"1.5px solid rgba(220,38,38,0.2)", borderRadius:12, padding:"48px 24px", textAlign:"center" }}>
              <div style={{ width:60, height:60, background:"rgba(220,38,38,0.1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <Shield style={{ width:28, height:28, color:"#dc2626" }} />
              </div>
              <h2 style={{ fontSize:18, fontWeight:800, color:"var(--cc-navy)", margin:"0 0 6px" }}>Null Reference Error</h2>
              <p style={{ fontSize:12, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", margin:"0 0 12px" }}>Object ID {id} returned 404.</p>
              <p style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", fontStyle:"italic", margin:0, opacity:0.7 }}>Hint: Try sequential ID enumeration (1-10)...</p>
            </div>
          )}

          {/* Profile Card */}
          {profile && !loading && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Own profile banner */}
              {isOwn && (
                <div style={{ background:"rgba(26,60,110,0.06)", border:"1.5px solid rgba(26,60,110,0.2)", borderRadius:8, padding:"10px 16px", fontSize:12, fontWeight:700, color:"var(--cc-navy)" }}>
                  ✓ This is your profile
                </div>
              )}

              {/* Patch banners */}
              {patchedVulns.has("xss_profile") && <PatchedBanner label="XSS — PROFILE NAME" />}
              {patchedVulns.has("sqli_profile") && <PatchedBanner label="SQLI — PROFILE URL" />}

              {/* Header Card */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"28px 28px", display:"flex", alignItems:"center", gap:22 }}>
                <div style={{ width:80, height:80, borderRadius:"50%", background: avatarColor(profile.role), display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:28, fontWeight:900, flexShrink:0, boxShadow:"0 4px 16px rgba(245,130,10,0.3)" }}>
                  {profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4, flexWrap:"wrap" }}>
                    {patchedVulns.has("xss_profile") ? (
                      /* PATCHED: safe text rendering for full_name */
                      <>
                        <h1 style={{ fontSize:22, fontWeight:900, color:"var(--cc-navy)", margin:0 }}>{profile.full_name}</h1>
                      </>
                    ) : (
                      /* VULNERABILITY: Stored XSS via dangerouslySetInnerHTML on profile name */
                      <h1 style={{ fontSize:22, fontWeight:900, color:"var(--cc-navy)", margin:0 }}
                          dangerouslySetInnerHTML={{ __html: profile.full_name }} />
                    )}
                    <span style={roleStyle(profile.role)}>{profile.role}</span>
                  </div>
                  <p style={{ fontSize:13, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", margin:"0 0 4px" }}>@{profile.username}</p>
                </div>
                <div style={{ textAlign:"right", opacity:0.25 }}>
                  <div style={{ fontSize:28, fontWeight:900, fontFamily:"'DM Mono',monospace", color:"var(--cc-navy)", lineHeight:1 }}>#{profile.id}</div>
                  <div style={{ fontSize:9, fontWeight:700, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1 }}>Record_Index</div>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden" }}>
                {[
                  { label:"Email Address",    value:profile.email,         icon:Mail,        mono:true  },
                  { label:"Admission Number", value:profile.admission_no,  icon:Fingerprint, mono:true  },
                  { label:"Class",            value:profile.class||"N/A",  icon:School,      mono:false },
                  { label:"Section",          value:profile.section||"N/A",icon:Hash,        mono:false },
                  { label:"Security Role",    value:profile.role,          icon:Shield,      mono:false, isRole:true },
                ].map((item, i, arr) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} style={{ display:"grid", gridTemplateColumns:"180px 1fr", borderBottom: i<arr.length-1?"1px solid var(--cc-border)":"none" }}>
                      <div style={{ padding:"13px 18px", background:"#f8f9fa", borderRight:"1px solid var(--cc-border)", display:"flex", alignItems:"center", gap:8 }}>
                        <Icon style={{ width:13, height:13, color:"var(--cc-text-muted)", opacity:0.7 }} />
                        <span style={{ fontSize:10, fontWeight:800, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1 }}>{item.label}</span>
                      </div>
                      <div style={{ padding:"13px 18px", display:"flex", alignItems:"center" }}>
                        {(item as any).isRole
                          ? <span style={roleStyle(profile.role)}>{item.value}</span>
                          : item.label === "Email Address"
                            ? <span style={{ fontSize:13, color:"var(--cc-navy)", fontFamily: item.mono?"'DM Mono',monospace":"inherit", fontWeight: item.mono?500:600 }} dangerouslySetInnerHTML={{ __html: item.value }} />
                            : <span style={{ fontSize:13, color:"var(--cc-navy)", fontFamily: item.mono?"'DM Mono',monospace":"inherit", fontWeight: item.mono?500:600 }}>{item.value}</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* API endpoint display */}
              <div>
                <div style={{ display:"inline-block", fontFamily:"'DM Mono',monospace", fontSize:11, background:"var(--cc-navy)", color:"rgba(255,255,255,0.7)", padding:"6px 14px", borderRadius:6 }}>
                  GET /api/profile/<span style={{ color:"var(--cc-orange)" }}>{id}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// VULENERABILITY: Insecure Direct Object Reference (IDOR) on /api/profile/[id]


//1. What an attacker does: Log in as student1 (ID 3), then click PREV twice to reach ID 1 — which is the admin account. No tools needed, just clicking arrows. The API /api/profile/[id] never checks whether the requesting user's ID matches the requested ID.
// What they get: Full name, email, role, admission number, class, section of every user including admin and staff.

// 2. Sensitive Data Exposure via Profile Fields
// The API returns and the page renders:

// email — admin's internal email address
// role — confirms who is admin vs student vs staff
// admission_no — a unique identifier useful for social engineering

// For ID 1 specifically, you see admin@campuscare.local + role: admin + ADM001 — enough to target the admin account precisely.
