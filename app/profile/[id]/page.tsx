"use client";
// VULNERABILITY: IDOR — change [id] in URL to view any user's profile
// No server-side authorization check that id === session user id

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Profile {
  id: number; username: string; email: string; full_name: string;
  class: string; section: string; admission_no: string; role: string;
}

function RoleColor(role: string) {
  if (role === "admin")  return { bg: "#7f1d1d", text: "#fca5a5", border: "#991b1b" };
  if (role === "staff")  return { bg: "#713f12", text: "#fde047", border: "#854d0e" };
  return                        { bg: "#1e3a5f", text: "#93c5fd", border: "#1d4ed8" };
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile]       = useState<Profile | null>(null);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(true);
  const [sessionUserId, setSession] = useState<number | null>(null);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    try {
      const payload = JSON.parse(atob(match[1].split(".")[1]));
      setSession(payload.id);
    } catch { router.push("/login"); return; }

    if (!id) return;
    fetch(`/api/profile/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.profile) setProfile(d.profile);
        else setError(d.error || "User not found");
        setLoading(false);
      });
  }, [id]);

  const isOwn = sessionUserId === profile?.id;
  const roleStyle = profile ? RoleColor(profile.role) : null;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24, fontFamily: "monospace" }}>
          <Link href="/search" style={{ color: "var(--muted)" }}>Students</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <span style={{ color: "var(--text)" }}>Profile #{id}</span>
          {!isOwn && profile && (
            <span style={{
              marginLeft: 10,
              fontSize: 10,
              color: "var(--red)",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 3,
              padding: "2px 6px",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              ⚠ Not your profile
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ height: 120, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, opacity: 0.5 }} />
            <div style={{ height: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, opacity: 0.4 }} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div>
            <div style={{
              background: "#1c0a0a", border: "1px solid #7f1d1d",
              borderRadius: 8, padding: 24, marginBottom: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⚠</div>
              <div style={{ color: "#fca5a5", fontSize: 15, marginBottom: 6 }}>User not found</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>{error}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace", textAlign: "center" }}>
              Try IDs 1–6 to enumerate all users
            </div>
          </div>
        )}

        {/* Profile card */}
        {profile && !loading && (
          <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.3s" }}>

            {/* Hero banner */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px 8px 0 0",
              padding: "28px 28px 20px",
              borderBottom: "none",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Background grid pattern */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(255,255,255,0.02) 24px, rgba(255,255,255,0.02) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(255,255,255,0.02) 24px, rgba(255,255,255,0.02) 25px)",
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 20, position: "relative" }}>
                {/* Avatar */}
                <div style={{
                  width: 64, height: 64, borderRadius: 10,
                  background: roleStyle ? `rgba(${profile.role === "admin" ? "239,68,68" : profile.role === "staff" ? "234,179,8" : "59,130,246"},0.15)` : "#1e1e22",
                  border: `2px solid ${roleStyle?.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: "bold",
                  color: roleStyle?.text,
                  fontFamily: "monospace",
                  flexShrink: 0,
                }}>
                  {(profile.full_name || profile.username).split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: 20, fontWeight: "bold", margin: 0 }}>
                      {profile.full_name || profile.username}
                    </h1>
                    <span style={{
                      fontSize: 11, fontWeight: "bold",
                      background: roleStyle?.bg,
                      color: roleStyle?.text,
                      border: `1px solid ${roleStyle?.border}`,
                      borderRadius: 4,
                      padding: "2px 8px",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}>
                      {profile.role}
                    </span>
                    {isOwn && (
                      <span style={{
                        fontSize: 11, color: "var(--accent)",
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        borderRadius: 4, padding: "2px 8px",
                      }}>You</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "monospace" }}>
                    @{profile.username}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                    {profile.email}
                  </div>
                </div>

                {/* ID badge */}
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "6px 12px",
                  textAlign: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ fontSize: 18, fontWeight: "bold", fontFamily: "monospace", color: "var(--muted)" }}>
                    #{profile.id}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    User ID
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "0 0 8px 8px",
              overflow: "hidden",
            }}>
              {[
                { label: "Full Name",     value: profile.full_name,     icon: "👤" },
                { label: "Username",      value: profile.username,       icon: "🔑", mono: true },
                { label: "Email",         value: profile.email,          icon: "✉️" },
                { label: "Role",          value: profile.role,           icon: "🎭" },
                { label: "Class",         value: profile.class || "—",   icon: "🏫" },
                { label: "Section",       value: profile.section || "—", icon: "📌" },
                { label: "Admission No",  value: profile.admission_no,   icon: "🪪", mono: true },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    padding: "12px 20px",
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderRight: "1px solid var(--border)",
                    background: "rgba(0,0,0,0.15)",
                  }}>
                    <span>{row.icon}</span>
                    <span style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>{row.label}</span>
                  </div>
                  <div style={{
                    padding: "12px 20px",
                    fontSize: 14,
                    fontFamily: row.mono ? "monospace" : undefined,
                    color: row.label === "Role" ? roleStyle?.text : "var(--text)",
                  }}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            {/* IDOR nav */}
            <div style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", gap: 8 }}>
                {Number(id) > 1 && (
                  <Link
                    href={`/profile/${Number(id) - 1}`}
                    style={{
                      fontSize: 12, color: "var(--muted)",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 4, padding: "5px 12px",
                      textDecoration: "none",
                      fontFamily: "monospace",
                    }}
                  >
                    ← #{Number(id) - 1}
                  </Link>
                )}
                <Link
                  href={`/profile/${Number(id) + 1}`}
                  style={{
                    fontSize: 12, color: "var(--muted)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 4, padding: "5px 12px",
                    textDecoration: "none",
                    fontFamily: "monospace",
                  }}
                >
                  #{Number(id) + 1} →
                </Link>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                /profile/<span style={{ color: "var(--accent)" }}>{id}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}