"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface User { id: number; username: string; role: string; email: string; full_name: string; }
interface Notice { id: number; title: string; author: string; created_at: string; }
interface Sub { correct: number; points: number; flag_name: string; submitted_at: string; }

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [subs, setSubs]       = useState<Sub[]>([]);
  const [rank, setRank]       = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    let u: User;
    try { u = JSON.parse(atob(match[1].split(".")[1])); setUser(u); }
    catch { router.push("/login"); return; }

    fetch("/api/notices").then(r => r.json()).then(d => setNotices(d.notices || []));
    fetch("/api/submit").then(r => r.json()).then(d => setSubs(d.submissions || []));
    fetch("/api/leaderboard").then(r => r.json()).then(d => {
      const idx = (d.scores || []).findIndex((s: any) => s.username === u.username);
      if (idx !== -1) setRank(idx + 1);
    });
  }, []);

  if (!user) return null;

  const correct   = subs.filter(s => s.correct);
  const totalPts  = correct.reduce((a, b) => a + b.points, 0);
  const roleColor = user.role === "admin" ? "var(--red)" : user.role === "staff" ? "var(--yellow)" : "var(--blue)";

  const quickLinks = [
    { href: "/submit",             emoji: "🚩", label: "Submit Flag" },
    { href: "/leaderboard",        emoji: "🏆", label: "Leaderboard" },
    { href: "/search",             emoji: "🔍", label: "Students" },
    { href: "/notices",            emoji: "📋", label: "Notices" },
    { href: "/assignments",        emoji: "📝", label: "Assignments" },
    { href: "/resources",          emoji: "📚", label: "Resources" },
    { href: "/jwt-debug",          emoji: "🔐", label: "JWT Debug" },
    { href: `/profile/${user.id}`, emoji: "👤", label: "My Profile" },
  ];

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px", opacity: mounted ? 1 : 0, transition: "opacity 0.3s" }}>

        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4, letterSpacing: -0.5 }}>
            Welcome back, {user.full_name?.split(" ")[0] || user.username} 👋
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Here's what's happening on CampusCare today.
          </p>
        </div>

        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "User ID",         value: `#${user.id}`,                   color: "var(--muted)" },
            { label: "Role",            value: user.role.toUpperCase(),          color: roleColor },
            { label: "Flags Captured",  value: `${correct.length}/4`,            color: "var(--accent)" },
            { label: "Total Points",    value: totalPts,                          color: "var(--yellow)" },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "18px 20px", textAlign: "center",
            }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: s.color, marginBottom: 5 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Account info */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Account
            </div>
            {[
              ["Username",  user.username,                           true ],
              ["Email",     user.email,                              false],
              ["User ID",   String(user.id),                         true ],
              ["LB Rank",   rank ? `#${rank} on leaderboard` : "—", false],
            ].map(([k, v, mono]) => (
              <div key={String(k)} style={{
                display: "grid", gridTemplateColumns: "130px 1fr",
                borderBottom: "1px solid var(--border)",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ padding: "11px 18px", fontSize: 12, color: "var(--muted)", background: "rgba(0,0,0,0.12)", borderRight: "1px solid var(--border)" }}>{String(k)}</div>
                <div style={{ padding: "11px 18px", fontSize: 13, fontFamily: mono ? "monospace" : undefined }}>{String(v)}</div>
              </div>
            ))}
            {user.role === "admin" && (
              <div style={{ padding: "12px 18px" }}>
                <Link href="/admin" style={{
                  display: "block", textAlign: "center", fontSize: 13,
                  color: "var(--red)", background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)", borderRadius: 5, padding: "8px 0",
                  textDecoration: "none",
                }}>
                  ⚙️ Open Admin Panel →
                </Link>
              </div>
            )}
          </div>

          {/* Quick links grid */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Quick Links
            </div>
            <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {quickLinks.map(l => (
                <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "9px 12px", borderRadius: 6,
                    border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 13, color: "var(--muted)",
                    transition: "all 0.15s", cursor: "pointer",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
                  >
                    <span>{l.emoji}</span>
                    <span>{l.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Recent submissions */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Recent Submissions</span>
              <Link href="/submit" style={{ fontSize: 12 }}>View all →</Link>
            </div>
            {subs.length === 0 ? (
              <div style={{ padding: "28px 18px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>🚩</div>
                <div>No submissions yet.</div>
                <Link href="/submit" style={{ fontSize: 12, display: "block", marginTop: 8 }}>Submit a flag →</Link>
              </div>
            ) : subs.slice(0, 5).map((s, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 70px 50px",
                padding: "10px 18px",
                borderBottom: i < Math.min(subs.length, 5) - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
              }}>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: s.correct ? "var(--text)" : "var(--muted)" }}>
                  {s.flag_name || "—"}
                </span>
                <span>{s.correct ? <span className="badge badge-green" style={{ fontSize: 10 }}>✓</span> : <span className="badge badge-red" style={{ fontSize: 10 }}>✗</span>}</span>
                <span style={{ fontSize: 12, fontWeight: "bold", color: s.correct ? "var(--accent)" : "var(--muted)" }}>
                  {s.correct ? `+${s.points}` : "—"}
                </span>
              </div>
            ))}
          </div>

          {/* Recent notices */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Notices</span>
              <Link href="/notices" style={{ fontSize: 12 }}>View all →</Link>
            </div>
            {notices.slice(0, 4).map((n, i) => (
              <div key={n.id} style={{
                padding: "11px 18px",
                borderBottom: i < 3 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontSize: 13, marginBottom: 4 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {n.author} · {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}