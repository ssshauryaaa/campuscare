"use client";
// VULNERABILITY: Role read from JWT only — forge role:"admin" to access

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ShieldAlert } from "lucide-react";

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
    { key:"flags",       label:"Flags",       count:flags.length       },
    { key:"notices",     label:"Notices",     count:notices.length     },
    { key:"users",       label:"Users",       count:users.length       },
    { key:"submissions", label:"Submissions", count:subs.length        },
  ];

  const th = (label: string) => (
    <th key={label} style={{ padding:"9px 14px", fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.85)", textTransform:"uppercase", letterSpacing:1, textAlign:"left" }}>{label}</th>
  );

  const td = (content: React.ReactNode, mono=false) => (
    <td style={{ padding:"10px 14px", fontSize:12, color:"var(--cc-text)", fontFamily: mono?"'DM Mono',monospace":"inherit" }}>{content}</td>
  );

  const inputStyle: React.CSSProperties = {
    width:"100%", border:"1.5px solid var(--cc-border)", borderRadius:7, padding:"9px 12px",
    fontSize:13, color:"var(--cc-text)", outline:"none", background:"#fafafa", boxSizing:"border-box", transition:"border-color 0.2s",
  };

  return (
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:1100 }}>

          {/* Warning Banner */}
          <div style={{ background:"rgba(220,38,38,0.07)", border:"1.5px solid rgba(220,38,38,0.25)", borderRadius:10, padding:"12px 18px", marginBottom:22, display:"flex", alignItems:"center", gap:10 }}>
            <ShieldAlert style={{ width:18, height:18, color:"#dc2626", flexShrink:0 }} />
            <p style={{ fontSize:12, fontWeight:800, color:"#dc2626", margin:0 }}>⚠ Admin Access — Restricted Personnel Only</p>
          </div>

          {/* Header */}
          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:20, fontWeight:900, color:"var(--cc-navy)", margin:"0 0 3px" }}>Admin Panel</h1>
            <p style={{ fontSize:12, color:"var(--cc-text-muted)", margin:0 }}>Greenfield International School — System Administration</p>
          </div>

          {/* Access Denied */}
          {error && !loading && (
            <div style={{ background:"rgba(220,38,38,0.06)", border:"1.5px solid rgba(220,38,38,0.2)", borderRadius:8, padding:"14px 18px", marginBottom:18 }}>
              <div style={{ fontWeight:800, color:"#dc2626", marginBottom:6 }}>⛔ {error}</div>
              <div style={{ fontSize:12, color:"var(--cc-text-muted)", fontFamily:"'DM Mono',monospace" }}>
                Your JWT must contain <span style={{ color:"#dc2626" }}>&quot;role&quot;: &quot;admin&quot;</span>.
                Go to <a href="/jwt-debug" style={{ color:"var(--cc-orange)" }}>/jwt-debug</a> to forge your token.
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, borderBottom:"2px solid var(--cc-border)", marginBottom:20 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding:"10px 20px", fontSize:13, fontWeight:700, border:"none", background:"transparent", cursor:"pointer", transition:"all 0.15s", borderBottom: tab===t.key?"2px solid var(--cc-orange)":"2px solid transparent", marginBottom:-2, color: tab===t.key?"var(--cc-orange)":"var(--cc-text-muted)", display:"flex", alignItems:"center", gap:6 }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{ fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:20, background: tab===t.key?"rgba(245,130,10,0.12)":"var(--cc-border)", color: tab===t.key?"var(--cc-orange)":"var(--cc-text-muted)" }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {loading && <div style={{ height:200, background:"#fff", borderRadius:10, border:"1px solid var(--cc-border)", opacity:0.4 }} />}

          {/* FLAGS */}
          {!loading && tab==="flags" && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:"var(--cc-navy)" }}>
                  {["#","Name","Flag Value","Difficulty","Pts","Hint"].map(th)}
                </tr></thead>
                <tbody>
                  {flags.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding:24, color:"var(--cc-text-muted)", fontSize:13 }}>No access — role must be &quot;admin&quot; in JWT.</td></tr>
                  ) : flags.map((f, i) => (
                    <tr key={f.id} style={{ background:i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid var(--cc-border)" }}>
                      {td(f.id, true)}
                      {td(<span style={{ fontFamily:"'DM Mono',monospace", fontSize:11 }}>{f.flag_name}</span>)}
                      {td(<span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, background:"rgba(26,60,110,0.07)", color:"var(--cc-navy)", border:"1px dashed rgba(26,60,110,0.25)", borderRadius:4, padding:"2px 8px" }}>{f.flag_value}</span>)}
                      {td(<span className={`badge ${f.difficulty==="easy"?"badge-green":f.difficulty==="medium"?"badge-yellow":f.difficulty==="hard"?"badge-red":"badge-blue"}`}>{f.difficulty}</span>)}
                      {td(<span style={{ fontWeight:800, color:"var(--cc-orange)" }}>{f.points}</span>)}
                      {td(f.hint)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* NOTICES */}
          {!loading && tab==="notices" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", padding:22, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:11, fontWeight:800, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:16 }}>Post New Notice</div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ display:"block", fontSize:10, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>Title</label>
                  <input value={newNotice.title} onChange={e=>setNew({...newNotice,title:e.target.value})} placeholder="Notice title"
                    style={inputStyle} onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor="var(--cc-border)")} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:"block", fontSize:10, fontWeight:800, color:"var(--cc-navy)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>Content</label>
                  <textarea value={newNotice.content} onChange={e=>setNew({...newNotice,content:e.target.value})} rows={3} placeholder="Notice content..."
                    style={{ ...inputStyle, resize:"vertical", fontFamily:"'DM Mono',monospace" }} onFocus={e=>(e.target.style.borderColor="var(--cc-navy)")} onBlur={e=>(e.target.style.borderColor="var(--cc-border)")} />
                </div>
                {noticeMsg && <div style={{ fontSize:13, color:"#16a34a", marginBottom:10 }}>✓ {noticeMsg}</div>}
                <button onClick={postNotice} style={{ padding:"9px 22px", background:"var(--cc-orange)", color:"#fff", border:"none", borderRadius:7, fontWeight:800, fontSize:13, cursor:"pointer" }}>
                  Post Notice →
                </button>
              </div>
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ padding:"11px 18px", borderBottom:"1px solid var(--cc-border)", fontSize:10, fontWeight:800, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1.5 }}>
                  All Notices ({notices.length})
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr style={{ background:"var(--cc-navy)" }}>
                    {["#","Title","Author","Visibility","Date"].map(th)}
                  </tr></thead>
                  <tbody>
                    {notices.map((n, i) => (
                      <tr key={n.id} style={{ background:i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid var(--cc-border)" }}>
                        {td(n.id, true)}{td(n.title)}{td(n.author)}
                        {td(n.is_hidden ? <span className="badge badge-red">HIDDEN</span> : <span className="badge badge-green">PUBLIC</span>)}
                        {td(new Date(n.created_at).toLocaleDateString("en-IN"), true)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS */}
          {!loading && tab==="users" && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:"var(--cc-navy)" }}>
                  {["#","Username","Full Name","Role","Email","Class","Adm. No"].map(th)}
                </tr></thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ background:i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid var(--cc-border)" }}>
                      {td(u.id, true)}
                      {td(<span style={{ fontFamily:"'DM Mono',monospace", fontSize:11 }}>{u.username}</span>)}
                      {td(u.full_name)}
                      {td(<span className={`badge ${u.role==="admin"?"badge-red":u.role==="staff"?"badge-yellow":"badge-blue"}`}>{u.role}</span>)}
                      {td(u.email)}{td(u.class||"—")}{td(u.admission_no, true)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUBMISSIONS */}
          {!loading && tab==="submissions" && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:"var(--cc-navy)" }}>
                  {["Username","Flag Name","Status","Points","Time"].map(th)}
                </tr></thead>
                <tbody>
                  {subs.length===0 ? (
                    <tr><td colSpan={5} style={{ padding:24, color:"var(--cc-text-muted)", fontSize:13 }}>No submissions yet.</td></tr>
                  ) : subs.map((s, i) => (
                    <tr key={i} style={{ background:i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid var(--cc-border)" }}>
                      {td(<span style={{ fontFamily:"'DM Mono',monospace", fontSize:11 }}>{s.username}</span>)}
                      {td(s.flag_name || "—")}
                      {td(s.correct ? <span className="badge badge-green">CORRECT</span> : <span className="badge badge-red">WRONG</span>)}
                      {td(<span style={{ fontWeight:800, color: s.correct?"var(--cc-orange)":"var(--cc-text-muted)" }}>{s.correct?`+${s.points}`:"—"}</span>)}
                      {td(new Date(s.submitted_at).toLocaleString("en-IN"), true)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}