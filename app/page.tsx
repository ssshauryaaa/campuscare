"use client";

import Link from "next/link";
import { Shield, Bell, Trophy, Flag, FileText, Library, ArrowRight, Activity, Terminal, Code } from "lucide-react";

// VULNERABILITY (Easy — 50pts): Flag hidden in HTML source comment below.
// Right-click → View Page Source → Ctrl+F → BREACH

const QUICK_LINKS = [
  { href: "/login",       icon: Shield,   label: "Student Login",    desc: "Access your portal account",  accent: "#3b82f6" },
  { href: "/notices",     icon: Bell,     label: "Notice Board",     desc: "School announcements",         accent: "#f59e0b" },
  { href: "/assignments", icon: FileText, label: "Assignments",      desc: "Pending class work",           accent: "#8b5cf6" },
  { href: "/resources",   icon: Library,  label: "Resources",        desc: "Study materials & timetable", accent: "#06b6d4" },
];

const ANNOUNCEMENTS = [
  { date: "15 Apr", text: "Parent-Teacher Meeting — Block A",  type: "PTM"     },
  { date: "20 Apr", text: "Annual Sports Day — Main Ground",   type: "EVENT"   },
  { date: "22 Apr", text: "Exam timetable now available",      type: "EXAM"    },
  { date: "8 May",  text: "Breach@trix Finals — 8th May",      type: "CONTEST" },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
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
      
      {/* Dynamic Style Blocks for Keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
          100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        }
        .hero-bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          position: relative;
          overflow: hidden;
        }
        .hero-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                            radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .nav-link {
          position: relative;
          color: #1e293b;
          font-weight: 600;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          background: #f1f5f9;
          color: #3b82f6;
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        .stagger-1 { animation: fadeUp 0.6s ease-out 0.1s both; }
        .stagger-2 { animation: fadeUp 0.6s ease-out 0.2s both; }
        .stagger-3 { animation: fadeUp 0.6s ease-out 0.3s both; }
      `}</style>

      {/* Top Navigation */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(226, 232, 240, 0.8)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: "10px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
              C
            </div>
            <div>
              <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 18, letterSpacing: "-0.5px" }}>CampusCare</div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>by Entab</div>
            </div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/notices" className="nav-link">Notices</Link>
            <Link href="/assignments" className="nav-link">Assignments</Link>
            <Link href="/feedback" className="nav-link">Feedback</Link>
            <div style={{ width: 1, height: 24, background: "#cbd5e1", margin: "0 8px" }} />
            <Link href="/login" className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>
              Student Login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-bg" style={{ padding: "100px 24px 80px", textAlign: "center", minHeight: "450px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div className="stagger-1" style={{ display: "inline-block", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "6px 16px", borderRadius: "20px", color: "#60a5fa", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 24 }}>
            Academic Year 2025–26 · CBSE Affiliated
          </div>
          <h1 className="stagger-2" style={{ fontSize: 56, fontWeight: 900, color: "#f8fafc", margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
            Tagore International <span style={{ color: "#3b82f6" }}>School</span>
          </h1>
          <p className="stagger-3" style={{ fontSize: 18, color: "#94a3b8", margin: "0 auto 40px", fontWeight: 500, maxWidth: "600px", lineHeight: 1.6 }}>
            Empowering excellence in education with our state-of-the-art digital campus management system.
          </p>
          <div className="stagger-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" className="btn-primary" style={{ padding: "16px 36px", fontSize: 16 }}>
              Access Student Portal <ArrowRight size={18} />
            </Link>
            <Link href="/notices" style={{ padding: "16px 36px", borderRadius: 12, fontWeight: 700, fontSize: 16, color: "#f8fafc", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", transition: "all 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
              View Latest Notices
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: 1280, margin: "-40px auto 0", padding: "0 24px 60px", position: "relative", zIndex: 20 }}>
        
        {/* Info Strip */}
        <div className="stagger-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
          {[
            { label: "Current Session", value: "2025–26", icon: Activity, color: "#3b82f6" },
            { label: "Affiliation", value: "CBSE #1234", icon: Trophy, color: "#f59e0b" },
            { label: "Curriculum", value: "Integrated Program", icon: Library, color: "#8b5cf6" },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "12px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <item.icon size={24} color={item.color} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
          {/* Left Column: Quick Access & Announcements */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Quick Links */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 4, height: 24, background: "#3b82f6", borderRadius: 4 }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Quick Access</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {QUICK_LINKS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
                      <div className="glass-card" style={{ padding: "20px", display: "flex", alignItems: "flex-start", gap: 16, height: "100%" }}>
                        <div style={{ width: 44, height: 44, borderRadius: "12px", background: `${card.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={22} color={card.accent} />
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{card.label}</div>
                          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>{card.desc}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Announcements */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 4, height: 24, background: "#f59e0b", borderRadius: 4 }} />
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Recent Announcements</h2>
              </div>
              <div className="glass-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {ANNOUNCEMENTS.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: i !== ANNOUNCEMENTS.length - 1 ? 20 : 0, borderBottom: i !== ANNOUNCEMENTS.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "14px", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", lineHeight: 1.1 }}>{a.date.split(" ")[0]}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{a.date.split(" ")[1]}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{a.text}</div>
                        <div style={{ display: "inline-block", padding: "4px 10px", background: "#f1f5f9", borderRadius: "6px", fontSize: 10, fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.5px" }}>{a.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: System Status */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 4, height: 24, background: "#ef4444", borderRadius: 4 }} />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>System Status</h2>
            </div>
            <div className="glass-card" style={{ padding: "0", overflow: "hidden", background: "#0f172a" }}>
              <div style={{ padding: "16px 20px", background: "#1e293b", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #334155" }}>
                <Terminal size={16} color="#94a3b8" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "monospace" }}>system_diagnostics.sh</span>
              </div>
              <div style={{ padding: "24px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {[
                      { label: "Portal Version", value: "v2.3.1",           st: null       },
                      { label: "Framework",      value: "Next.js 14",        st: null       },
                      { label: "Database",       value: "SQLite (campus.db)", st: null      },
                      { label: "Environment",    value: "DEVELOPMENT",        st: "warning" },
                      { label: "Debug Mode",     value: "ENABLED",            st: "danger"  },
                    ].map((row, i, arr) => (
                      <tr key={i} style={{ borderBottom: i < arr.length - 1 ? "1px dashed #334155" : "none" }}>
                        <td style={{ padding: "12px 0", fontSize: 13, color: "#94a3b8", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                          <Code size={14} color="#475569" /> {row.label}
                        </td>
                        <td style={{ padding: "12px 0", textAlign: "right" }}>
                          {row.st === "warning"
                            ? <span style={{ fontSize: 11, fontWeight: 800, background: "rgba(245,158,11,0.2)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "6px", padding: "4px 8px", textTransform: "uppercase" }}>{row.value}</span>
                            : row.st === "danger"
                            ? <span style={{ fontSize: 11, fontWeight: 800, background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", padding: "4px 8px", textTransform: "uppercase", animation: "glow 2s infinite" }}>{row.value}</span>
                            : <span style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "monospace", fontWeight: 600 }}>{row.value}</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "6px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12 }}>
                C
              </div>
              <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>CampusCare</div>
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              © 2026 Tagore International School. Powered by <strong style={{ color: "#0f172a" }}>Entab</strong>
            </div>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {[["Login", "/login"], ["Notices", "/notices"], ["Assignments", "/assignments"], ["Register", "/register"]].map(([label, href]) => (
              <Link key={href} href={href} className="nav-link" style={{ fontSize: 13, color: "#64748b", padding: 0 }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}