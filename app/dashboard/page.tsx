"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Flag, Trophy, Search, Bell, BookOpen, Library, KeyRound, User } from "lucide-react";

interface User { id: number; username: string; role: string; email: string; full_name: string; }
interface Notice { id: number; title: string; author: string; created_at: string; }
interface Sub { correct: number; points: number; flag_name: string; submitted_at: string; }

const QUICK_LINKS = [
  { href: "/search",      icon: Search,  label: "Students",    color: "#1a3c6e" },
  { href: "/notices",     icon: Bell,    label: "Notices",     color: "#f5820a" },
  { href: "/assignments", icon: BookOpen,label: "Assignments", color: "#7c3aed" },
  { href: "/resources",   icon: Library, label: "Resources",   color: "#0891b2" },
  { href: "/jwt-debug",   icon: KeyRound,label: "JWT Debug",   color: "#dc2626" },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    
    try {
      const u = JSON.parse(atob(match[1].split(".")[1]));
      setUser(u);
      
      // Parallel data fetching
      Promise.all([
        fetch("/api/notices").then(r => r.json())
      ]).then(([noticeData]) => {
        setNotices(noticeData.notices || []);
      });
    } catch {
      router.push("/login");
    }
  }, [router]);

  if (!user) return null;

  const correct = subs.filter(s => s.correct);
  const totalPts = correct.reduce((a, b) => a + b.points, 0);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const roleBadgeStyle: React.CSSProperties = {
    fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:1, padding:"2px 10px", borderRadius:20,
    background: user.role==="admin" ? "rgba(220,38,38,0.12)" : user.role==="staff" ? "rgba(202,138,4,0.12)" : "rgba(26,60,110,0.12)",
    color:      user.role==="admin" ? "#dc2626"              : user.role==="staff" ? "#b45309"             : "#1a3c6e",
    border:     `1px solid ${user.role==="admin" ? "rgba(220,38,38,0.25)" : user.role==="staff" ? "rgba(202,138,4,0.25)" : "rgba(26,60,110,0.25)"}`,
  };

  return (
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:1100, opacity: mounted?1:0, transform: mounted?"none":"translateY(8px)", transition:"all 0.4s" }}>

          {/* Greeting Banner */}
          <div style={{ background:"#fff", borderRadius:12, padding:"22px 28px", marginBottom:22, border:"1px solid var(--cc-border)", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:900, color:"var(--cc-navy)", margin:"0 0 4px" }}>
                {greeting}, {user.full_name?.split(" ")[0] || user.username}! 👋
              </h1>
              <p style={{ fontSize:13, color:"var(--cc-text-muted)", margin:0 }}>
                {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
              </p>
            </div>
            {/* Stat strip */}
            <div style={{ display:"flex", gap:12 }}>
              {[
                { label:"User ID",       value:`#${user.id}`,          bg:"#f0f4ff", color:"var(--cc-navy)" },
                { label:"Role",          value:user.role.toUpperCase(), bg: user.role==="admin"?"#fff0f0":"#fef3e2", color: user.role==="admin"?"#dc2626":"var(--cc-orange)" },
                { label:"Class",         value:"12-A",                  bg:"#f0fdf4", color:"#16a34a" },
                { label:"Attendance",    value:"94%",                   bg:"#fef3e2", color:"var(--cc-orange)" },
              ].map(s => (
                <div key={s.label} style={{ background:s.bg, borderRadius:10, padding:"10px 16px", textAlign:"center", minWidth:72 }}>
                  <div style={{ fontSize:18, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:9, fontWeight:700, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1, marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:20 }}>

            {/* Left Column */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* My Profile */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", borderLeft:"4px solid var(--cc-navy)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden" }}>
                <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--cc-border)", fontSize:10, fontWeight:800, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2 }}>My Profile</div>
                <div>
                  {[
                    ["Username", user.username, true],
                    ["Email",    user.email,    false],
                    ["Status",   user.role,     false],
                  ].map(([k,v,mono]) => (
                    <div key={String(k)} style={{ display:"flex", justifyContent:"space-between", padding:"11px 18px", borderBottom:"1px solid var(--cc-border)", alignItems:"center" }}>
                      <span style={{ fontSize:12, color:"var(--cc-text-muted)", fontWeight:600 }}>{String(k)}</span>
                      {k==="Status"
                        ? <span style={roleBadgeStyle}>{String(v).toUpperCase()}</span>
                        : <span style={{ fontSize:12, color:"var(--cc-navy)", fontFamily: mono?"'DM Mono',monospace":"inherit", fontWeight: mono?600:500 }}>{String(v)}</span>
                      }
                    </div>
                  ))}
                </div>
                {user.role === "admin" && (
                  <div style={{ padding:"12px 18px" }}>
                    <Link href="/admin" style={{ display:"block", textAlign:"center", padding:"8px 0", fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:1, color:"#dc2626", background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:7, textDecoration:"none" }}>
                      Access Admin Panel
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden" }}>
                <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--cc-border)", fontSize:10, fontWeight:800, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2 }}>Quick Links</div>
                <div style={{ padding:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {QUICK_LINKS.map(l => {
                    const Icon = l.icon;
                    return (
                      <Link key={l.href} href={l.href} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:8, border:"1px solid var(--cc-border)", textDecoration:"none", transition:"border-color 0.15s,background 0.15s" }}
                        onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.borderLeftColor="var(--cc-orange)";t.style.background="#fef3e2"}}
                        onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.borderLeftColor="var(--cc-border)";t.style.background="transparent"}}>
                        <Icon style={{ width:14, height:14, color:l.color, flexShrink:0 }} />
                        <span style={{ fontSize:11, fontWeight:700, color:"var(--cc-text)" }}>{l.label}</span>
                      </Link>
                    );
                  })}
                  <Link href={`/profile/${user.id}`} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:8, border:"1px solid var(--cc-border)", textDecoration:"none", transition:"border-color 0.15s,background 0.15s" }}
                    onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.borderLeftColor="var(--cc-orange)";t.style.background="#fef3e2"}}
                    onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.borderLeftColor="var(--cc-border)";t.style.background="transparent"}}>
                    <User style={{ width:14, height:14, color:"#6b7280", flexShrink:0 }} />
                    <span style={{ fontSize:11, fontWeight:700, color:"var(--cc-text)" }}>My Profile</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Recent Activity / Classes */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden" }}>
                <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--cc-border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:10, fontWeight:800, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2 }}>Today's Schedule</div>
                </div>
                <div style={{ padding:18 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {[
                      { time: "08:30 AM", subject: "Mathematics", room: "Rm 402" },
                      { time: "09:30 AM", subject: "Physics Lab", room: "Lab B" },
                      { time: "11:00 AM", subject: "English Lit", room: "Rm 105" },
                    ].map((cls, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ fontSize:11, fontWeight:800, color:"var(--cc-navy)", width:70 }}>{cls.time}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:"var(--cc-text)" }}>{cls.subject}</div>
                          <div style={{ fontSize:10, color:"var(--cc-text-muted)" }}>{cls.room}</div>
                        </div>
                        <div style={{ width:8, height:8, borderRadius:"50%", background: i===0?"var(--cc-orange)":"var(--cc-border)" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campus Bulletins */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden" }}>
                <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--cc-border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:10, fontWeight:800, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2 }}>Campus Bulletins</div>
                  <Link href="/notices" style={{ fontSize:11, fontWeight:700, color:"var(--cc-orange)", textDecoration:"none" }}>View All →</Link>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
                  {notices.slice(0, 4).map((n, i) => (
                    <div key={n.id} style={{ padding:"16px 18px", borderBottom: i<2?"1px solid var(--cc-border)":"none", borderRight: i%2===0?"1px solid var(--cc-border)":"none", cursor:"pointer" }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#f8f9fa"}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                      <div style={{ marginBottom:6 }}>
                        <span style={{ fontSize:10, fontWeight:800, background:"rgba(245,130,10,0.12)", color:"var(--cc-orange)", border:"1px solid rgba(245,130,10,0.25)", borderRadius:20, padding:"2px 8px", textTransform:"uppercase" }}>{n.author}</span>
                      </div>
                      {/* VULNERABILITY: notice titles on dashboard rendered as raw HTML */}
                      <h4
                        className="font-semibold text-[#1a3c6e] text-sm"
                        style={{ fontSize:13, fontWeight:700, color:"var(--cc-navy)", marginBottom:4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any }}
                        dangerouslySetInnerHTML={{ __html: n.title }}
                      />
                      <div style={{ fontSize:11, color:"var(--cc-text-muted)" }}>{new Date(n.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}