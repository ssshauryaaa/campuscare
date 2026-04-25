"use client";

import Link from "next/link";
import { Shield, Bell, Trophy, Flag, FileText, Library } from "lucide-react";

// VULNERABILITY (Easy — 50pts): Flag hidden in HTML source comment below.
// Right-click → View Page Source → Ctrl+F → BREACH

const QUICK_LINKS = [
  { href: "/login",       icon: Shield,   label: "Student Login",    desc: "Access your portal account",  accent: "#1a3c6e" },
  { href: "/notices",     icon: Bell,     label: "Notice Board",     desc: "School announcements",         accent: "#f5820a" },
  { href: "/assignments", icon: FileText, label: "Assignments",      desc: "Pending class work",           accent: "#7c3aed" },
  { href: "/resources",   icon: Library,  label: "Resources",        desc: "Study materials & timetable", accent: "#0891b2" },
];

const ANNOUNCEMENTS = [
  { date: "15 Apr", text: "Parent-Teacher Meeting — Block A",  type: "PTM"     },
  { date: "20 Apr", text: "Annual Sports Day — Main Ground",   type: "EVENT"   },
  { date: "22 Apr", text: "Exam timetable now available",      type: "EXAM"    },
  { date: "8 May",  text: "Breach@trix Finals — 8th May",      type: "CONTEST" },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cc-bg)" }}>
      {/* =====================================================
          Developer Notes — TODO: REMOVE BEFORE GO-LIVE
          =====================================================
          Admin panel: /admin
          Admin creds backup: admin / Admin@Campus2025
          Flag: BREACH{s0urce_c0de_n3v3r_li3s}
          DB location: ./campus.db
          Secrets: see /.env
          JWT_SECRET is set to "secret" for now — change this!
          =====================================================
      */}

      {/* Top Bar */}
      <header style={{ background:"#fff", borderBottom:"1px solid var(--cc-border)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"var(--cc-navy)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:14 }}>C</div>
            <div>
              <div style={{ fontWeight:900, color:"var(--cc-navy)", fontSize:15, lineHeight:1.1 }}>CampusCare</div>
              <div style={{ fontSize:9, color:"var(--cc-orange)", fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>by Entab</div>
            </div>
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Link href="/notices" style={{ padding:"6px 16px", fontSize:13, fontWeight:600, color:"var(--cc-navy)", textDecoration:"none" }}>Notices</Link>
            <Link href="/assignments" style={{ padding:"6px 16px", fontSize:13, fontWeight:600, color:"var(--cc-navy)", textDecoration:"none" }}>Assignments</Link>
            <Link href="/login" style={{ padding:"8px 20px", borderRadius:8, fontSize:13, fontWeight:800, color:"#fff", background:"var(--cc-orange)", textDecoration:"none" }}>Student Login →</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background:"linear-gradient(135deg,#1a3c6e 0%,#2d5f8a 60%,#1a3c6e 100%)", padding:"72px 24px", textAlign:"center" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"rgba(245,130,10,0.9)", letterSpacing:3, textTransform:"uppercase", marginBottom:14 }}>
            Affiliated: CBSE · School No. 1234 · Est. 1998
          </div>
          <h1 style={{ fontSize:36, fontWeight:900, color:"#fff", margin:"0 0 12px", lineHeight:1.15 }}>
            Greenfield International School
          </h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.75)", margin:"0 0 36px", fontWeight:500 }}>
            Empowering Excellence in Education — Academic Year 2025–26
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/login" style={{ padding:"12px 32px", borderRadius:8, fontWeight:800, fontSize:14, color:"#fff", background:"var(--cc-orange)", textDecoration:"none" }}>Student Login →</Link>
            <Link href="/notices" style={{ padding:"12px 32px", borderRadius:8, fontWeight:700, fontSize:14, color:"#fff", border:"2px solid rgba(255,255,255,0.4)", textDecoration:"none" }}>View Notices</Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 0" }}>
        {/* Info strip */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
          {[
            { label:"Academic Year", value:"2025–26", sub:"Current Session" },
            { label:"Affiliation",   value:"CBSE",    sub:"School No. 1234" },
            { label:"Curriculum",    value:"Integrated", sub:"Academic Program" },
          ].map(c => (
            <div key={c.label} style={{ background:"#fff", borderRadius:12, padding:"18px 22px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid var(--cc-border)" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>{c.label}</div>
              <div style={{ fontSize:17, fontWeight:900, color:"var(--cc-navy)" }}>{c.value}</div>
              <div style={{ fontSize:12, color:"var(--cc-text-muted)", marginTop:2 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ fontSize:10, fontWeight:700, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2, marginBottom:14 }}>Quick Access</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:28 }}>
          {QUICK_LINKS.map(card => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} style={{ textDecoration:"none" }}>
                <div style={{ background:"#fff", borderRadius:12, padding:"18px 20px", border:"1px solid var(--cc-border)", borderLeft:`4px solid ${card.accent}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)", display:"flex", alignItems:"flex-start", gap:14, transition:"box-shadow 0.2s,transform 0.2s", cursor:"pointer" }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow="0 6px 24px rgba(0,0,0,0.12)";(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow="0 2px 8px rgba(0,0,0,0.04)";(e.currentTarget as HTMLElement).style.transform="none"}}>
                  <div style={{ width:36, height:36, borderRadius:8, background:card.accent+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon style={{ width:18, height:18, color:card.accent }} />
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:"var(--cc-navy)", marginBottom:2 }}>{card.label}</div>
                    <div style={{ fontSize:12, color:"var(--cc-text-muted)" }}>{card.desc}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Announcements + System Status */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:40 }}>
          <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid var(--cc-border)" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2, marginBottom:18 }}>Recent Announcements</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {ANNOUNCEMENTS.map((a,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--cc-orange)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, flexDirection:"column" }}>
                    <span style={{ fontSize:9, fontWeight:800, color:"#fff", textAlign:"center", lineHeight:1.2 }}>{a.date}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--cc-text)" }}>{a.text}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--cc-orange)", textTransform:"uppercase", letterSpacing:0.5 }}>{a.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid var(--cc-border)" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2, marginBottom:18 }}>System Status</div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <tbody>
                {[
                  { label:"Portal Version", value:"v2.3.1",           st:null       },
                  { label:"Framework",      value:"Next.js 14",        st:null       },
                  { label:"Database",       value:"SQLite (campus.db)", st:null      },
                  { label:"Environment",    value:"DEVELOPMENT",        st:"warning" },
                  { label:"Debug Mode",     value:"ENABLED",            st:"danger"  },
                ].map((row,i,arr) => (
                  <tr key={i} style={{ borderBottom:i<arr.length-1?"1px solid var(--cc-border)":"none" }}>
                    <td style={{ padding:"9px 0", fontSize:13, color:"var(--cc-text-muted)", fontWeight:600 }}>{row.label}</td>
                    <td style={{ padding:"9px 0", textAlign:"right" }}>
                      {row.st==="warning"
                        ? <span style={{ fontSize:10, fontWeight:800, background:"rgba(202,138,4,0.12)", color:"#b45309", border:"1px solid rgba(202,138,4,0.25)", borderRadius:20, padding:"2px 10px", textTransform:"uppercase" }}>{row.value}</span>
                        : row.st==="danger"
                        ? <span style={{ fontSize:10, fontWeight:800, background:"rgba(220,38,38,0.10)", color:"#dc2626", border:"1px solid rgba(220,38,38,0.25)", borderRadius:20, padding:"2px 10px", textTransform:"uppercase" }}>{row.value}</span>
                        : <span style={{ fontSize:12, color:"var(--cc-navy)", fontFamily:"'DM Mono',monospace", fontWeight:500 }}>{row.value}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background:"#fff", borderTop:"1px solid var(--cc-border)", padding:"18px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:12, color:"var(--cc-text-muted)" }}>
            © 2026 Greenfield International School &nbsp;·&nbsp; Powered by <strong style={{ color:"var(--cc-navy)" }}>Entab CampusCare</strong>
          </div>
          <div style={{ display:"flex", gap:20 }}>
            {[["Login","/login"],["Notices","/notices"],["Assignments","/assignments"],["Register","/register"]].map(([label,href])=>(
              <Link key={href} href={href} style={{ fontSize:12, color:"var(--cc-text-muted)", textDecoration:"none", fontWeight:600 }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}