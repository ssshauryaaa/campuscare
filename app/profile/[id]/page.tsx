"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Mail, Shield, School, Hash, Fingerprint, ChevronRight, AlertTriangle, Book, Star, Activity } from "lucide-react";
import { logRealAttack } from "@/lib/logAttack";
import { usePatchedVulns } from "@/hooks/useCampusDefense";
import { PatchedBanner } from "@/components/PatchedBanner";

interface Profile {
  id: number; username: string; email: string; full_name: string;
  class: string; section: string; admission_no: string; role: string;
}

const fadeInUp = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes progressFill {
    from { width: 0%; }
    to   { width: var(--target-width); }
  }
`;

const animCard = (delay = 0): React.CSSProperties => ({
  animation: `fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
});

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
    let currentSessionId: number | null = null;
    try {
      const payload = JSON.parse(atob(match[1].split(".")[1]));
      setSession(payload.id);
      currentSessionId = payload.id;
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
          // Log IDOR attack if user is viewing a profile that isn't theirs
          if (currentSessionId && d.profile.id !== currentSessionId) {
            logRealAttack({ type: "idor_profile", severity: "high", detail: "Unauthorized profile access (IDOR)", endpoint: `/api/profile/${id}`, payload: `Target ID: ${id}` });
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
    fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2,
    padding: "4px 12px", borderRadius: 20,
    background: role === "admin" ? "rgba(220,38,38,0.10)" : role === "staff" ? "rgba(202,138,4,0.10)" : "rgba(26,60,110,0.10)",
    color: role === "admin" ? "#dc2626" : role === "staff" ? "#b45309" : "#1a3c6e",
    border: `1px solid ${role === "admin" ? "rgba(220,38,38,0.22)" : role === "staff" ? "rgba(202,138,4,0.22)" : "rgba(26,60,110,0.22)"}`,
  });

  const avatarBg = (role: string) =>
    role === "admin"
      ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
      : role === "staff"
        ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
        : "linear-gradient(135deg, var(--cc-orange) 0%, #e06000 100%)";

  const shimmerStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.6s ease-in-out infinite",
    borderRadius: 12,
    border: "1px solid var(--cc-border)",
  };

  return (
    <>
      <style>{fadeInUp}</style>
      <div style={{ background: "var(--cc-bg)", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ marginLeft: 240, paddingTop: 56 }}>
          <main style={{ padding: "36px 36px 60px", maxWidth: 720 }}>

            {/* ── Breadcrumb + Warning ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, animation: "fadeIn 0.3s ease both" }}>
              <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                <Link href="/search" style={{ color: "var(--cc-orange)", textDecoration: "none", fontWeight: 700, transition: "opacity 0.15s", }}>Directory</Link>
                <ChevronRight style={{ width: 12, height: 12, opacity: 0.4 }} />
                <span style={{ color: "var(--cc-navy)", fontWeight: 700 }}>User_Record_{id}</span>
              </nav>

              {!isOwn && profile && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 20, fontSize: 10, fontWeight: 800, color: "#dc2626", letterSpacing: 0.8 }}>
                  <AlertTriangle style={{ width: 11, height: 11 }} />
                  UNAUTHORIZED_VIEW
                </div>
              )}
            </div>

            {/* ── Skeleton Loader ── */}
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease both" }}>
                <div style={{ height: 136, ...shimmerStyle }} />
                <div style={{ height: 300, ...shimmerStyle }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ height: 180, ...shimmerStyle }} />
                  <div style={{ height: 180, ...shimmerStyle }} />
                </div>
              </div>
            )}

            {/* ── Error State ── */}
            {error && !loading && (
              <div style={{ ...animCard(0), background: "rgba(220,38,38,0.04)", border: "1.5px solid rgba(220,38,38,0.15)", borderRadius: 16, padding: "64px 32px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, background: "rgba(220,38,38,0.10)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Shield style={{ width: 28, height: 28, color: "#dc2626" }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--cc-navy)", margin: "0 0 8px" }}>Null Reference Error</h2>
                <p style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: "var(--cc-text-muted)", margin: "0 0 6px" }}>Object ID {id} returned 404.</p>
                <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--cc-text-muted)", fontStyle: "italic", margin: 0, opacity: 0.6 }}>Hint: Try sequential ID enumeration (1-10)...</p>
              </div>
            )}

            {/* ── Profile ── */}
            {profile && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Own banner */}
                {isOwn && (
                  <div style={{ ...animCard(0), background: "rgba(26,60,110,0.05)", border: "1px solid rgba(26,60,110,0.15)", borderRadius: 10, padding: "11px 18px", fontSize: 12, fontWeight: 700, color: "var(--cc-navy)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
                    This is your profile
                  </div>
                )}

                {/* Patch banners */}
                {patchedVulns.has("xss_profile") && <PatchedBanner label="XSS — PROFILE NAME" />}
                {patchedVulns.has("sqli_profile") && <PatchedBanner label="SQLI — PROFILE URL" />}
                {patchedVulns.has("idor_profile") && !isOwn && <PatchedBanner label="IDOR — UNAUTHORIZED PROFILE ACCESS" />}

                {/* ── Hero Card ── */}
                <div style={{ ...animCard(0.05), background: "#fff", borderRadius: 16, border: "1px solid var(--cc-border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "32px 32px", display: "flex", alignItems: "center", gap: 26, position: "relative", overflow: "hidden" }}>
                  {/* Subtle background accent */}
                  <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: profile.role === "admin" ? "rgba(220,38,38,0.05)" : "rgba(245,130,10,0.06)", pointerEvents: "none" }} />

                  {/* Avatar */}
                  <div style={{ width: 88, height: 88, borderRadius: "50%", background: avatarBg(profile.role), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 30, fontWeight: 900, flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", letterSpacing: -1, transition: "transform 0.2s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>

                  {/* Name / meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      {patchedVulns.has("xss_profile") ? (
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--cc-navy)", margin: 0, lineHeight: 1.2 }}>{profile.full_name}</h1>
                      ) : (
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--cc-navy)", margin: 0, lineHeight: 1.2 }}
                          dangerouslySetInnerHTML={{ __html: profile.full_name }} />
                      )}
                      <span style={roleStyle(profile.role)}>{profile.role}</span>
                    </div>
                    <p style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: "var(--cc-text-muted)", margin: "0 0 12px" }}>@{profile.username}</p>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, background: "var(--cc-navy)", color: "rgba(255,255,255,0.65)", padding: "5px 12px", borderRadius: 6, display: "inline-block" }}>
                      GET /api/profile/<span style={{ color: "var(--cc-orange)" }}>{id}</span>
                    </div>
                  </div>

                  {/* Record index */}
                  <div style={{ textAlign: "right", opacity: 0.18, userSelect: "none" }}>
                    <div style={{ fontSize: 40, fontWeight: 900, fontFamily: "'DM Mono',monospace", color: "var(--cc-navy)", lineHeight: 1 }}>#{profile.id}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 4 }}>Record_Index</div>
                  </div>
                </div>

                {/* ── Info Grid ── */}
                <div style={{ ...animCard(0.10), background: "#fff", borderRadius: 16, border: "1px solid var(--cc-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  {[
                    { label: "Email Address", value: profile.email, icon: Mail, mono: true },
                    { label: "Admission Number", value: profile.admission_no, icon: Fingerprint, mono: true },
                    { label: "Class", value: profile.class || "N/A", icon: School, mono: false },
                    { label: "Section", value: profile.section || "N/A", icon: Hash, mono: false },
                    { label: "Security Role", value: profile.role, icon: Shield, mono: false, isRole: true },
                  ].map((item, i, arr) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label}
                        style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: i < arr.length - 1 ? "1px solid var(--cc-border)" : "none", transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,130,10,0.025)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                      >
                        <div style={{ padding: "16px 20px", background: "rgba(248,249,250,0.8)", borderRight: "1px solid var(--cc-border)", display: "flex", alignItems: "center", gap: 9 }}>
                          <Icon style={{ width: 14, height: 14, color: "var(--cc-text-muted)", opacity: 0.65, flexShrink: 0 }} />
                          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</span>
                        </div>
                        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center" }}>
                          {(item as any).isRole
                            ? <span style={roleStyle(profile.role)}>{item.value}</span>
                            : item.label === "Email Address"
                              ? <span style={{ fontSize: 13, color: "var(--cc-navy)", fontFamily: "'DM Mono',monospace", fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: item.value }} />
                              : <span style={{ fontSize: 13, color: "var(--cc-navy)", fontFamily: item.mono ? "'DM Mono',monospace" : "inherit", fontWeight: item.mono ? 500 : 600 }}>{item.value}</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Two Column: Progress + Activity ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                  {/* Academic / System Progress */}
                  <div style={{ ...animCard(0.15), background: "#fff", borderRadius: 16, border: "1px solid var(--cc-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "24px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(26,60,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Book style={{ width: 15, height: 15, color: "var(--cc-navy)" }} />
                      </div>
                      <h3 style={{ fontSize: 11, fontWeight: 800, color: "var(--cc-navy)", margin: 0, textTransform: "uppercase", letterSpacing: 1.1 }}>
                        {profile.role === "student" ? "Academic Progress" : "System Access Level"}
                      </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {[
                        { label: profile.role === "student" ? "Mathematics" : "Database Admin", val: profile.role === "student" ? 85 : 100 },
                        { label: profile.role === "student" ? "Computer Science" : "User Management", val: profile.role === "student" ? 92 : 100 },
                        { label: profile.role === "student" ? "Physics" : "Security Controls", val: profile.role === "student" ? 78 : 100 },
                      ].map(p => (
                        <div key={p.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--cc-text-muted)", marginBottom: 7 }}>
                            <span>{p.label}</span>
                            <span style={{ color: "var(--cc-navy)", fontFamily: "'DM Mono',monospace" }}>{p.val}%</span>
                          </div>
                          <div style={{ height: 6, background: "#f0f2f5", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{
                              height: "100%",
                              width: `${p.val}%`,
                              background: p.val === 100
                                ? "linear-gradient(90deg, #dc2626, #ef4444)"
                                : "linear-gradient(90deg, var(--cc-orange), #f59e0b)",
                              borderRadius: 4,
                              animation: `progressFill 0.8s cubic-bezier(0.22,1,0.36,1) both`,
                              ["--target-width" as any]: `${p.val}%`,
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div style={{ ...animCard(0.18), background: "#fff", borderRadius: 16, border: "1px solid var(--cc-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "24px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(26,60,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Activity style={{ width: 15, height: 15, color: "var(--cc-navy)" }} />
                      </div>
                      <h3 style={{ fontSize: 11, fontWeight: 800, color: "var(--cc-navy)", margin: 0, textTransform: "uppercase", letterSpacing: 1.1 }}>Recent Activity</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { time: "2 hours ago", action: profile.role === "student" ? "Submitted Physics Assignment" : "Updated Notice Board" },
                        { time: "Yesterday", action: profile.role === "student" ? "Viewed Mid-term Grades" : "Reviewed Student Feedback" },
                        { time: "3 days ago", action: "Logged in from IP 192.168.1.45" },
                      ].map((act, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "var(--cc-orange)" : "var(--cc-border)", flexShrink: 0, marginTop: 5, transition: "background 0.2s", boxShadow: i === 0 ? "0 0 0 3px rgba(245,130,10,0.15)" : "none" }} />
                          <div>
                            <div style={{ fontSize: 12, color: "var(--cc-navy)", fontWeight: 600, lineHeight: 1.4 }}>{act.action}</div>
                            <div style={{ fontSize: 10, color: "var(--cc-text-faint)", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{act.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Badges ── */}
                <div style={{ ...animCard(0.22), background: "#fff", borderRadius: 16, border: "1px solid var(--cc-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "24px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,130,10,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Star style={{ width: 15, height: 15, color: "var(--cc-orange)" }} />
                    </div>
                    <h3 style={{ fontSize: 11, fontWeight: 800, color: "var(--cc-navy)", margin: 0, textTransform: "uppercase", letterSpacing: 1.1 }}>Achievements & Badges</h3>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                      { icon: "🏆", title: "Top Performer" },
                      { icon: "💻", title: "Tech Enthusiast" },
                      { icon: "📚", title: "Avid Reader" },
                      { icon: "🛡️", title: profile.role === "admin" ? "System Defender" : "Safety First" },
                    ].map((b, i) => (
                      <div key={b.title}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 16px", background: "#f8f9fa", border: "1px solid var(--cc-border)", borderRadius: 10, cursor: "default", transition: "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease", animation: `scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) ${0.24 + i * 0.06}s both` }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.background = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.background = "#f8f9fa"; }}
                      >
                        <span style={{ fontSize: 18 }}>{b.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cc-navy)" }}>{b.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Privileged Access Box — UNCHANGED ── */}
                {profile.id === 1 && (
                  <div style={{
                    background: "#fff",
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.06)",
                    padding: 8,
                    marginBottom: 4,
                    maxWidth: 260
                  }}>
                    <p style={{
                      fontSize: 9,
                      color: "rgba(0,0,0,0.45)",
                      marginBottom: 6,
                      lineHeight: 1.3
                    }}>
                      Privileged profile access. BASE 64
                    </p>
                    <div style={{
                      background: "rgba(0,0,0,0.03)",
                      padding: "6px 8px",
                      borderRadius: 4,
                      borderLeft: "2px solid rgba(0,0,0,0.1)",
                      fontFamily: "'DM Mono', monospace",
                      color: "rgba(0,0,0,0.6)",
                      fontSize: 10,
                      fontWeight: 600,
                      wordBreak: "break-all"
                    }}>
                      QlJFQUNIezFkMHJfNGRtMW5fcHIwZjFsM19wd259
                    </div>
                  </div>
                )}

              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

// VULNERABILITY: Insecure Direct Object Reference (IDOR) on /api/profile/[id]