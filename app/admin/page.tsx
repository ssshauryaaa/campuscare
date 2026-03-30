"use client";
// VULNERABILITY: Role read from JWT only — forge role:"admin" to access

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type Tab = "flags" | "notices" | "users" | "submissions";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab]           = useState<Tab>("flags");
  const [flags, setFlags]       = useState<any[]>([]);
  const [notices, setNotices]   = useState<any[]>([]);
  const [users, setUsers]       = useState<any[]>([]);
  const [subs, setSubs]         = useState<any[]>([]);
  const [error, setError]       = useState("");
  const [newNotice, setNew]     = useState({ title: "", content: "" });
  const [noticeMsg, setNMsg]    = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }

    Promise.all([
      fetch("/api/admin/flags").then(r => r.json()),
      fetch("/api/admin/notices").then(r => r.json()),
      fetch("/api/users").then(r => r.json()),
      fetch("/api/admin/submissions").then(r => r.json()),
    ]).then(([f, n, u, s]) => {
      if (f.flags)   setFlags(f.flags);   else setError(f.error || "Access denied");
      if (n.notices) setNotices(n.notices);
      if (u.users)   setUsers(u.users);
      if (s.submissions) setSubs(s.submissions);
      setLoading(false);
    });
  }, []);

  const postNotice = async () => {
    if (!newNotice.title || !newNotice.content) return;
    const res = await fetch("/api/admin/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNotice),
    });
    if ((await res.json()).success) {
      setNMsg("Notice posted.");
      setNew({ title: "", content: "" });
      fetch("/api/admin/notices").then(r => r.json()).then(d => setNotices(d.notices || []));
      setTimeout(() => setNMsg(""), 3000);
    }
  };

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "flags",       label: "Flags",       count: flags.length       },
    { key: "notices",     label: "Notices",     count: notices.length     },
    { key: "users",       label: "Users",       count: users.length       },
    { key: "submissions", label: "Submissions", count: subs.length        },
  ];

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: "bold", margin: 0, letterSpacing: -0.5 }}>Admin Panel</h1>
              <span style={{
                fontSize: 10, background: "rgba(239,68,68,0.12)", color: "#fca5a5",
                border: "1px solid rgba(239,68,68,0.25)", borderRadius: 3,
                padding: "2px 7px", textTransform: "uppercase", letterSpacing: 0.5,
              }}>Restricted</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
              Greenfield International School — System Administration
            </p>
          </div>
        </div>

        {/* Access denied */}
        {error && !loading && (
          <div style={{
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 8, padding: "16px 20px", marginBottom: 24,
          }}>
            <div style={{ color: "#fca5a5", fontWeight: "bold", marginBottom: 6 }}>⛔ {error}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "monospace" }}>
              Your JWT must contain <span style={{ color: "#fca5a5" }}>"role": "admin"</span>.
              Go to <a href="/jwt-debug" style={{ color: "var(--accent)" }}>/jwt-debug</a> to forge your token.
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 0,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 6, overflow: "hidden",
          width: "fit-content", marginBottom: 24,
        }}>
          {TABS.map((t, i) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                background: tab === t.key ? "rgba(34,197,94,0.1)" : "transparent",
                color: tab === t.key ? "var(--accent)" : "var(--muted)",
                border: "none",
                borderRight: i < TABS.length - 1 ? "1px solid var(--border)" : "none",
                padding: "9px 20px", fontSize: 13,
                fontFamily: "monospace", cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{
                  background: tab === t.key ? "rgba(34,197,94,0.2)" : "var(--border)",
                  color: tab === t.key ? "var(--accent)" : "var(--muted)",
                  borderRadius: 10, padding: "1px 7px", fontSize: 11,
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ height: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, opacity: 0.4 }} />
        )}

        {/* FLAGS */}
        {!loading && tab === "flags" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "36px 160px 1fr 90px 60px 1fr",
              padding: "9px 18px", borderBottom: "1px solid var(--border)",
              fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              <span>#</span><span>Name</span><span>Flag Value</span>
              <span>Difficulty</span><span>Pts</span><span>Hint</span>
            </div>
            {flags.length === 0 ? (
              <div style={{ padding: "32px 18px", color: "var(--muted)", fontSize: 13 }}>
                No access — role must be "admin" in JWT.
              </div>
            ) : flags.map((f, i) => (
              <div key={f.id} style={{
                display: "grid", gridTemplateColumns: "36px 160px 1fr 90px 60px 1fr",
                padding: "13px 18px",
                borderBottom: i < flags.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center", transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{f.id}</span>
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>{f.flag_name}</span>
                <span>
                  <span style={{
                    fontFamily: "monospace", fontSize: 11,
                    background: "#0a1a0a", border: "1px dashed rgba(34,197,94,0.3)",
                    color: "var(--accent)", borderRadius: 4, padding: "3px 8px",
                  }}>{f.flag_value}</span>
                </span>
                <span>
                  <span className={`badge ${f.difficulty === "easy" ? "badge-green" : f.difficulty === "medium" ? "badge-yellow" : f.difficulty === "hard" ? "badge-red" : "badge-blue"}`}
                    style={{ fontSize: 10 }}>
                    {f.difficulty}
                  </span>
                </span>
                <span style={{ color: "var(--accent)", fontWeight: "bold", fontSize: 13 }}>{f.points}</span>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{f.hint}</span>
              </div>
            ))}
          </div>
        )}

        {/* NOTICES */}
        {!loading && tab === "notices" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 24 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>Post New Notice</div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 7 }}>Title</label>
                <input value={newNotice.title} onChange={e => setNew({ ...newNotice, title: e.target.value })} placeholder="Notice title"
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "9px 12px", color: "var(--text)", fontSize: 13, fontFamily: "monospace", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 7 }}>Content</label>
                <textarea value={newNotice.content} onChange={e => setNew({ ...newNotice, content: e.target.value })} rows={3} placeholder="Notice content..."
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "9px 12px", color: "var(--text)", fontSize: 13, fontFamily: "monospace", outline: "none", resize: "vertical" }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />
              </div>
              {noticeMsg && <div style={{ marginBottom: 10, fontSize: 13, color: "var(--accent)" }}>✓ {noticeMsg}</div>}
              <button onClick={postNotice}>Post Notice →</button>
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                All Notices (Including Hidden) — {notices.length}
              </div>
              {notices.map((n, i) => (
                <div key={n.id} style={{
                  display: "grid", gridTemplateColumns: "36px 1fr 100px 80px 120px",
                  padding: "11px 18px",
                  borderBottom: i < notices.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center", fontSize: 13,
                }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{n.id}</span>
                  <span>{n.title}</span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{n.author}</span>
                  <span>{n.is_hidden ? <span className="badge badge-red" style={{ fontSize: 10 }}>HIDDEN</span> : <span className="badge badge-green" style={{ fontSize: 10 }}>PUBLIC</span>}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {!loading && tab === "users" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "36px 120px 160px 80px 200px 60px 120px",
              padding: "9px 18px", borderBottom: "1px solid var(--border)",
              fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              <span>#</span><span>Username</span><span>Full Name</span><span>Role</span>
              <span>Email</span><span>Class</span><span>Adm. No</span>
            </div>
            {users.map((u, i) => (
              <div key={u.id} style={{
                display: "grid", gridTemplateColumns: "36px 120px 160px 80px 200px 60px 120px",
                padding: "12px 18px",
                borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center", transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{u.id}</span>
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>{u.username}</span>
                <span style={{ fontSize: 13 }}>{u.full_name}</span>
                <span>
                  <span className={`badge ${u.role === "admin" ? "badge-red" : u.role === "staff" ? "badge-yellow" : "badge-blue"}`} style={{ fontSize: 10 }}>
                    {u.role}
                  </span>
                </span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{u.email}</span>
                <span style={{ fontSize: 12 }}>{u.class || "—"}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{u.admission_no}</span>
              </div>
            ))}
          </div>
        )}

        {/* SUBMISSIONS */}
        {!loading && tab === "submissions" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "140px 160px 90px 60px 160px",
              padding: "9px 18px", borderBottom: "1px solid var(--border)",
              fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              <span>Username</span><span>Flag Name</span><span>Status</span><span>Pts</span><span>Time</span>
            </div>
            {subs.length === 0 ? (
              <div style={{ padding: "32px 18px", color: "var(--muted)", fontSize: 13 }}>No submissions yet.</div>
            ) : subs.map((s, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "140px 160px 90px 60px 160px",
                padding: "11px 18px",
                borderBottom: i < subs.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center", transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>{s.username}</span>
                <span style={{ fontSize: 12 }}>{s.flag_name || <span style={{ color: "var(--muted)" }}>—</span>}</span>
                <span>{s.correct ? <span className="badge badge-green" style={{ fontSize: 10 }}>CORRECT</span> : <span className="badge badge-red" style={{ fontSize: 10 }}>WRONG</span>}</span>
                <span style={{ fontWeight: "bold", color: s.correct ? "var(--accent)" : "var(--muted)", fontSize: 13 }}>
                  {s.correct ? `+${s.points}` : "—"}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                  {new Date(s.submitted_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}