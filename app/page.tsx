"use client";

import Link from "next/link";
import {
  Shield, Bell, Trophy, Flag, FileText, Library,
  ArrowRight, Terminal, Code, BookOpen,
  ChevronRight, GraduationCap, Users, Calendar,
  Clock, Star, MapPin, Phone, Mail,
  Bus, FlaskConical, Music, Dumbbell,
  Monitor, BookMarked, Award, TrendingUp,
  Sun, CloudRain, Wind, Thermometer, Camera,
  Heart, Globe, Calculator,
  MessageSquare, Download, ExternalLink,
  Layers
} from "lucide-react";

const QUICK_LINKS = [
  { href: "/login", icon: Shield, label: "Student Login", desc: "Access your portal account", color: "#1d4ed8", bg: "#eff6ff" },
  { href: "/notices", icon: Bell, label: "Notice Board", desc: "School announcements", color: "#b45309", bg: "#fffbeb" },
  { href: "/assignments", icon: FileText, label: "Assignments", desc: "Pending class work", color: "#6d28d9", bg: "#f5f3ff" },
  { href: "/resources", icon: Library, label: "Resources", desc: "Study materials & timetable", color: "#0e7490", bg: "#ecfeff" },
];

const ANNOUNCEMENTS = [
  { date: "15", month: "Apr", text: "Parent-Teacher Meeting scheduled for Block A students", type: "PTM", typeColor: "#1d4ed8", typeBg: "#eff6ff" },
  { date: "20", month: "Apr", text: "Annual Sports Day to be held at the Main Ground", type: "Event", typeColor: "#059669", typeBg: "#ecfdf5" },
  { date: "22", month: "Apr", text: "Semester exam timetable is now available for download", type: "Exam", typeColor: "#b45309", typeBg: "#fffbeb" },
  { date: "8", month: "May", text: "Breach@trix Cybersecurity Finals — Registration open", type: "Contest", typeColor: "#7c3aed", typeBg: "#f5f3ff" },
  { date: "12", month: "May", text: "Inter-school debate competition — sign-ups now open", type: "Event", typeColor: "#059669", typeBg: "#ecfdf5" },
  { date: "18", month: "May", text: "Summer break begins — classes resume 1st July 2026", type: "Holiday", typeColor: "#dc2626", typeBg: "#fef2f2" },
];

const STATS = [
  { label: "Session", value: "2026–27", icon: Calendar, iconColor: "#1d4ed8", iconBg: "#eff6ff" },
  { label: "Affiliation", value: "CBSE #1234", icon: Trophy, iconColor: "#b45309", iconBg: "#fffbeb" },
  { label: "Curriculum", value: "Integrated", icon: BookOpen, iconColor: "#7c3aed", iconBg: "#f5f3ff" },
  { label: "Students", value: "2,400+", icon: Users, iconColor: "#059669", iconBg: "#ecfdf5" },
];

const SYSTEM = [
  { label: "Portal Version", value: "v2.3.1", status: "ok" },
  { label: "Framework", value: "Next.js 14", status: "ok" },
  { label: "Database", value: "SQLite (campus.db)", status: "ok" },
  { label: "Environment", value: "Development", status: "warn" },
  { label: "Debug Mode", value: "Enabled", status: "danger" },
];

const FACILITIES = [
  { icon: FlaskConical, label: "Science Labs", desc: "Physics, Chemistry & Biology labs with modern equipment and digital simulations.", color: "#0e7490", bg: "#ecfeff" },
  { icon: Monitor, label: "Computer Lab", desc: "120-seat lab with high-speed fibre internet and licensed software suites.", color: "#1d4ed8", bg: "#eff6ff" },
  { icon: Dumbbell, label: "Sports Complex", desc: "Olympic-size pool, basketball courts, and a 400-metre athletics track.", color: "#059669", bg: "#ecfdf5" },
  { icon: Music, label: "Performing Arts", desc: "Fully equipped auditorium seating 800 and dedicated music rehearsal studios.", color: "#7c3aed", bg: "#f5f3ff" },
  { icon: BookMarked, label: "Central Library", desc: "40,000+ volumes, digital catalogue, periodical section and a quiet reading lounge.", color: "#b45309", bg: "#fffbeb" },
  { icon: Bus, label: "Transport", desc: "GPS-tracked fleet of 28 buses covering 18 routes across the city.", color: "#dc2626", bg: "#fef2f2" },
];

const ACHIEVEMENTS = [
  { year: "2026", title: "National Science Olympiad", result: "1st Place", students: "Riya Sharma, Aryan Mehta", icon: Trophy, color: "#b45309" },
  { year: "2026", title: "CBSE Merit List", result: "12 students", students: "Class XII Board Toppers", icon: Star, color: "#1d4ed8" },
  { year: "2025", title: "Inter-School Robotics", result: "Gold Medal", students: "Team Synapse (Class 10)", icon: Award, color: "#7c3aed" },
  { year: "2025", title: "State Debate Championship", result: "Runner-Up", students: "Priya Nair, Kabir Singh", icon: MessageSquare, color: "#059669" },
];

const GALLERY_ITEMS = [
  { label: "Annual Day 2026", tag: "Cultural", color: "#eff6ff", tcolor: "#1d4ed8" },
  { label: "Science Expo", tag: "Academic", color: "#ecfdf5", tcolor: "#059669" },
  { label: "Sports Day", tag: "Athletics", color: "#fef2f2", tcolor: "#dc2626" },
  { label: "Robotics Club", tag: "Tech", color: "#f5f3ff", tcolor: "#7c3aed" },
  { label: "Nature Camp", tag: "Outdoor", color: "#ecfeff", tcolor: "#0e7490" },
  { label: "Art Exhibition", tag: "Creative", color: "#fffbeb", tcolor: "#b45309" },
];

const TIMETABLE = [
  { period: "1st", time: "8:00 – 8:45", subject: "Mathematics", room: "A-201", teacher: "Mr. Kapoor" },
  { period: "2nd", time: "8:45 – 9:30", subject: "Physics", room: "Lab 1", teacher: "Ms. Reddy" },
  { period: "3rd", time: "9:30 – 10:15", subject: "English", room: "A-203", teacher: "Ms. D'Souza" },
  { period: "Break", time: "10:15 – 10:30", subject: "—", room: "—", teacher: "—" },
  { period: "4th", time: "10:30 – 11:15", subject: "Chemistry", room: "Lab 2", teacher: "Mr. Sharma" },
  { period: "5th", time: "11:15 – 12:00", subject: "History", room: "A-205", teacher: "Ms. Iyer" },
];

const DOWNLOADS = [
  { name: "Academic Calendar 2026–27", size: "1.2 MB", type: "PDF", icon: Calendar },
  { name: "Exam Timetable — Term 2", size: "340 KB", type: "PDF", icon: FileText },
  { name: "Prospectus & Fee Structure", size: "2.8 MB", type: "PDF", icon: BookOpen },
  { name: "Transport Route Map", size: "890 KB", type: "PDF", icon: Bus },
  { name: "Scholarship Application Form", size: "210 KB", type: "DOCX", icon: Award },
];

const CLUBS = [
  { name: "Coding Club", members: 48, meet: "Every Friday", icon: Code, color: "#1d4ed8", bg: "#eff6ff" },
  { name: "Astronomy Society", members: 32, meet: "Alt. Saturdays", icon: Globe, color: "#7c3aed", bg: "#f5f3ff" },
  { name: "Eco Warriors", members: 61, meet: "Every Wednesday", icon: Layers, color: "#059669", bg: "#ecfdf5" },
  { name: "Debate Club", members: 40, meet: "Every Tuesday", icon: MessageSquare, color: "#b45309", bg: "#fffbeb" },
  { name: "Photography Club", members: 27, meet: "Every Saturday", icon: Camera, color: "#dc2626", bg: "#fef2f2" },
  { name: "Math Olympiad Prep", members: 55, meet: "Mon & Thu", icon: Calculator, color: "#0e7490", bg: "#ecfeff" },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fc", fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif", color: "#0f172a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .d1{animation-delay:.05s}.d2{animation-delay:.12s}.d3{animation-delay:.20s}.d4{animation-delay:.28s}.d5{animation-delay:.36s}
        .nav-item { font-size: 14px; font-weight: 500; color: #475569; text-decoration: none; padding: 7px 14px; border-radius: 8px; transition: background .15s, color .15s; letter-spacing: -.01em; }
        .nav-item:hover { background: #f1f5f9; color: #0f172a; }
        .card { background: #fff; border: 1px solid #e8ecf0; border-radius: 14px; }
        .card-hover { transition: box-shadow .2s, transform .2s; }
        .card-hover:hover { box-shadow: 0 8px 28px rgba(15,23,42,.08); transform: translateY(-2px); }
        .quick-link-card { background: #fff; border: 1px solid #e8ecf0; border-radius: 14px; padding: 20px; text-decoration: none; display: flex; align-items: center; gap: 14px; transition: box-shadow .2s, transform .2s; }
        .quick-link-card:hover { box-shadow: 0 8px 24px rgba(15,23,42,.07); transform: translateY(-2px); }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 10px; font-weight: 600; font-size: 14px; letter-spacing: -.01em; text-decoration: none; transition: opacity .15s, transform .15s; background: #1e293b; color: #fff; }
        .btn-primary:hover { opacity: .85; transform: translateY(-1px); }
        .btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 10px; font-weight: 500; font-size: 14px; text-decoration: none; transition: background .15s; background: rgba(255,255,255,.08); color: rgba(255,255,255,.9); border: 1px solid rgba(255,255,255,.14); }
        .btn-ghost:hover { background: rgba(255,255,255,.15); }
        .section-label { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; }
        .section-title { font-size: 24px; font-weight: 600; color: #0f172a; letter-spacing: -.03em; line-height: 1.2; }
        .section-sub { font-size: 14.5px; color: #64748b; line-height: 1.6; margin-top: 6px; }
        .badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 6px; letter-spacing: .02em; }
        .footer-link { font-size: 13px; color: #64748b; text-decoration: none; transition: color .15s; }
        .footer-link:hover { color: #0f172a; }
        .announcement-row { display: flex; align-items: flex-start; gap: 16px; padding: 18px 0; }
        .announcement-row + .announcement-row { border-top: 1px solid #f1f5f9; }
        .pulse-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ef4444; animation: pulse-dot 1.6s ease-in-out infinite; }
        .facility-card { background: #fff; border: 1px solid #e8ecf0; border-radius: 14px; padding: 26px; transition: box-shadow .2s, transform .2s; }
        .facility-card:hover { box-shadow: 0 8px 28px rgba(15,23,42,.08); transform: translateY(-3px); }
        .ticker-wrap { overflow: hidden; white-space: nowrap; }
        .ticker-inner { display: inline-block; animation: ticker 36s linear infinite; }
        .gallery-tile { border-radius: 14px; overflow: hidden; min-height: 160px; display: flex; flex-direction: column; justify-content: flex-end; padding: 16px; position: relative; cursor: pointer; transition: transform .2s; border: 1px solid #e8ecf0; }
        .gallery-tile:hover { transform: scale(1.02); }
        .table-row-alt:nth-child(even) { background: #f8f9fc; }
        .club-card { background: #fff; border: 1px solid #e8ecf0; border-radius: 12px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; transition: box-shadow .15s, transform .15s; }
        .club-card:hover { box-shadow: 0 6px 20px rgba(15,23,42,.07); transform: translateY(-2px); }
        .download-row { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-radius: 10px; transition: background .15s; cursor: pointer; }
        .download-row:hover { background: #f8f9fc; }
        .achievement-card { background: #fff; border: 1px solid #e8ecf0; border-radius: 14px; padding: 22px; transition: box-shadow .2s, transform .2s; }
        .achievement-card:hover { box-shadow: 0 8px 24px rgba(15,23,42,.07); transform: translateY(-2px); }
      `}</style>

      {/* Developer Notes (intentional CTF) */}
      {/* Admin: /admin | admin / Admin@Campus2025 | Flag: BREACH{s0urce_c0de_n3v3r_li3s} | JWT_SECRET="secret" */}

      {/* ── Ticker ── */}
      <div style={{ background: "#0f172a", padding: "9px 0", overflow: "hidden" }}>
        <div className="ticker-wrap">
          <div className="ticker-inner" style={{ fontSize: 12, color: "rgba(255,255,255,.55)", letterSpacing: ".02em" }}>
            {["PTM: 15 April — Block A", "Sports Day: 20 April at Main Ground", "Exam timetable now available", "Breach@trix CTF Finals — 8 May", "Annual Day ticket booking opens 1 May", "Term 2 results declared — check portal", "Eco Warriors drive — 25 April", "Coding Club open house — Fri 3 PM"].concat(
              ["PTM: 15 April — Block A", "Sports Day: 20 April at Main Ground", "Exam timetable now available", "Breach@trix CTF Finals — 8 May", "Annual Day ticket booking opens 1 May", "Term 2 results declared — check portal", "Eco Warriors drive — 25 April", "Coding Club open house — Fri 3 PM"]
            ).map((item, i) => (
              <span key={i} style={{ marginRight: 64 }}>· &nbsp;{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(255,255,255,.93)", backdropFilter: "saturate(180%) blur(12px)", borderBottom: "1px solid #e8ecf0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={18} color="#f8fafc" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 16, letterSpacing: "-.03em", lineHeight: 1.2 }}>CampusCare</div>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase" }}>by Entab</div>
            </div>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link href="/notices" className="nav-item">Notices</Link>
            <Link href="/assignments" className="nav-item">Assignments</Link>
            <Link href="/resources" className="nav-item">Resources</Link>
            <Link href="/clubs" className="nav-item">Clubs</Link>
            <Link href="/feedback" className="nav-item">Feedback</Link>
            <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 10px" }} />
            <Link href="/login" className="btn-primary" style={{ padding: "9px 18px", fontSize: 13 }}>Student Login <ArrowRight size={14} /></Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(160deg,#0f172a 0%,#1e293b 65%,#0c1f3a 100%)", padding: "120px 28px 140px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 15% 50%,rgba(56,189,248,.08) 0%,transparent 55%),radial-gradient(circle at 85% 20%,rgba(139,92,246,.08) 0%,transparent 50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 60, top: 60, opacity: .05, display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 14 }}>
          {Array.from({ length: 64 }).map((_, i) => (<div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "#fff" }} />))}
        </div>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="fade-up d1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", padding: "6px 14px 6px 10px", borderRadius: 40, marginBottom: 32 }}>
            <div style={{ background: "#22c55e", width: 6, height: 6, borderRadius: "50%" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 500, letterSpacing: ".04em" }}>Academic Year 2026–27 &nbsp;·&nbsp; CBSE Affiliated</span>
          </div>
          <h1 className="fade-up d2" style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 68, fontWeight: 400, color: "#f8fafc", letterSpacing: "-.03em", lineHeight: 1.05, marginBottom: 24 }}>
            Tagore International<br /><span style={{ color: "#38bdf8" }}>School</span>
          </h1>
          <p className="fade-up d3" style={{ fontSize: 17.5, color: "rgba(248,250,252,.5)", fontWeight: 400, maxWidth: 540, margin: "0 auto 44px", lineHeight: 1.7 }}>
            A state-of-the-art digital campus management system for students, parents, and educators — empowering every learner since 1991.
          </p>
          <div className="fade-up d4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" className="btn-primary" style={{ padding: "15px 30px", fontSize: 15 }}>Access Student Portal <ArrowRight size={16} /></Link>
            <Link href="/notices" className="btn-ghost" style={{ padding: "15px 30px", fontSize: 15 }}>View Notices</Link>
          </div>
        </div>
      </section>

      {/* ── Stat strip ── */}
      <div style={{ maxWidth: 1180, margin: "-30px auto 0", padding: "0 28px", position: "relative", zIndex: 10 }}>
        <div className="fade-up d5" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {STATS.map((s, i) => {
            const Icon = s.icon; return (
              <div key={i} className="card" style={{ padding: "22px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={20} color={s.iconColor} /></div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", letterSpacing: "-.03em", marginTop: 2 }}>{s.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Two-col content ── */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 28, alignItems: "start" }}>

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <p className="section-label">Navigate</p>
              <p className="section-title" style={{ fontSize: 20, marginBottom: 16 }}>Quick Access</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {QUICK_LINKS.map(card => {
                  const Icon = card.icon; return (
                    <Link key={card.href} href={card.href} className="quick-link-card">
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={19} color={card.color} /></div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", letterSpacing: "-.01em", marginBottom: 2 }}>{card.label}</div>
                        <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.4 }}>{card.desc}</div>
                      </div>
                      <ChevronRight size={14} color="#cbd5e1" style={{ marginLeft: "auto", flexShrink: 0 }} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="section-label">Latest Updates</p>
              <p className="section-title" style={{ fontSize: 20, marginBottom: 16 }}>Announcements</p>
              <div className="card" style={{ padding: "4px 24px" }}>
                {ANNOUNCEMENTS.map((a, i) => (
                  <div key={i} className="announcement-row">
                    <div style={{ width: 50, height: 54, borderRadius: 11, background: "#f8f9fc", border: "1px solid #e8ecf0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 19, fontWeight: 600, color: "#0f172a", lineHeight: 1, letterSpacing: "-.03em" }}>{a.date}</span>
                      <span style={{ fontSize: 9.5, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em" }}>{a.month}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", lineHeight: 1.45, marginBottom: 8, letterSpacing: "-.01em" }}>{a.text}</p>
                      <span className="badge" style={{ background: a.typeBg, color: a.typeColor }}>{a.type}</span>
                    </div>
                    <ChevronRight size={14} color="#e2e8f0" style={{ flexShrink: 0, marginTop: 4 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* System Status */}
            <div>
              <p className="section-label">Diagnostics</p>
              <p className="section-title" style={{ fontSize: 20, marginBottom: 16 }}>System Status</p>
              <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                <div style={{ background: "#1e293b", padding: "13px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #334155" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["#ef4444", "#f59e0b", "#22c55e"].map(c => (<div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: .7 }} />))}
                  </div>
                  <Terminal size={12} color="#64748b" style={{ marginLeft: 6 }} />
                  <span style={{ fontSize: 11.5, color: "#64748b", fontFamily: "monospace" }}>system_diagnostics.sh</span>
                </div>
                <div style={{ background: "#0f172a", padding: "4px 0 8px" }}>
                  {SYSTEM.map((row, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", borderBottom: i < SYSTEM.length - 1 ? "1px solid rgba(51,65,85,.5)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}><Code size={12} color="#475569" /><span style={{ fontSize: 12.5, color: "#94a3b8", fontFamily: "monospace" }}>{row.label}</span></div>
                      {row.status === "ok" && <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{row.value}</span>}
                      {row.status === "warn" && <span style={{ fontSize: 11, fontWeight: 600, background: "rgba(245,158,11,.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,.25)", borderRadius: 5, padding: "3px 9px", letterSpacing: ".04em", textTransform: "uppercase" }}>{row.value}</span>}
                      {row.status === "danger" && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, background: "rgba(239,68,68,.12)", color: "#f87171", border: "1px solid rgba(239,68,68,.25)", borderRadius: 5, padding: "3px 9px", letterSpacing: ".04em", textTransform: "uppercase" }}><span className="pulse-dot" />{row.value}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weather */}
            <div className="card" style={{ padding: "24px", background: "linear-gradient(135deg,#0c4a6e 0%,#0369a1 100%)", border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.5)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>Campus Weather</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} />New Delhi, India</p>
                </div>
                <Sun size={36} color="rgba(255,255,255,.75)" />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 52, fontWeight: 300, color: "#fff", letterSpacing: "-.04em", lineHeight: 1 }}>34</span>
                <span style={{ fontSize: 24, color: "rgba(255,255,255,.5)", fontWeight: 300 }}>°C</span>
              </div>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.6)", marginBottom: 20 }}>Sunny — feels like 38°C</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[{ icon: Wind, label: "Wind", val: "14 km/h" }, { icon: CloudRain, label: "Humidity", val: "42%" }, { icon: Thermometer, label: "UV Index", val: "High" }].map((w, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.08)", borderRadius: 9, padding: "10px 12px" }}>
                    <w.icon size={13} color="rgba(255,255,255,.45)" />
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 4, letterSpacing: ".05em", textTransform: "uppercase" }}>{w.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{w.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTF */}
            <div className="card" style={{ padding: "24px", background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", border: "1px solid #1e293b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(56,189,248,.1)", border: "1px solid rgba(56,189,248,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Flag size={16} color="#38bdf8" /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-.01em" }}>Breach@trix CTF</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>Cybersecurity Contest</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>Test your hacking skills in this capture-the-flag event. Open to all students in Classes 9–12.</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={12} color="#475569" /><span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>8 May 2026</span></div>
                <Link href="/ctf" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#38bdf8", textDecoration: "none", padding: "6px 12px", borderRadius: 7, background: "rgba(56,189,248,.08)", border: "1px solid rgba(56,189,248,.15)" }}>Register <ArrowRight size={12} /></Link>
              </div>
            </div>

            {/* Downloads */}
            <div>
              <p className="section-label" style={{ marginBottom: 12 }}>Downloads</p>
              <div className="card" style={{ padding: "8px 0" }}>
                {DOWNLOADS.map((d, i) => {
                  const Icon = d.icon; return (
                    <div key={i} className="download-row">
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={16} color="#475569" /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", lineHeight: 1.3, letterSpacing: "-.01em" }}>{d.name}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{d.type} · {d.size}</p>
                      </div>
                      <Download size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Facilities ── */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <p className="section-label">Infrastructure</p>
            <p className="section-title">World-Class Facilities</p>
            <p className="section-sub">Built for curious minds and ambitious learners.</p>
          </div>
          <Link href="/campus" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1d4ed8", textDecoration: "none" }}>Campus Tour <ExternalLink size={13} /></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {FACILITIES.map((f, i) => {
            const Icon = f.icon; return (
              <div key={i} className="facility-card">
                <div style={{ width: 48, height: 48, borderRadius: 13, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}><Icon size={22} color={f.color} /></div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", letterSpacing: "-.02em", marginBottom: 9 }}>{f.label}</p>
                <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Achievements ── */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ marginBottom: 36 }}>
          <p className="section-label">Recognition</p>
          <p className="section-title">Recent Achievements</p>
          <p className="section-sub">Our students consistently excel at regional and national levels.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {ACHIEVEMENTS.map((a, i) => {
            const Icon = a.icon; return (
              <div key={i} className="achievement-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `${a.color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={20} color={a.color} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: ".04em" }}>{a.year}</span>
                      <span className="badge" style={{ background: `${a.color}16`, color: a.color, fontSize: 10 }}>{a.result}</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", letterSpacing: "-.02em", marginBottom: 5 }}>{a.title}</p>
                    <p style={{ fontSize: 12.5, color: "#64748b" }}>{a.students}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Clubs ── */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <p className="section-label">Extracurricular</p>
            <p className="section-title">Clubs & Activities</p>
            <p className="section-sub">Join a community that matches your passion.</p>
          </div>
          <Link href="/clubs" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1d4ed8", textDecoration: "none" }}>View all <ChevronRight size={14} /></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {CLUBS.map((c, i) => {
            const Icon = c.icon; return (
              <div key={i} className="club-card">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} color={c.color} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", letterSpacing: "-.01em" }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{c.meet}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", letterSpacing: "-.03em" }}>{c.members}</p>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>members</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Timetable ── */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ marginBottom: 32 }}>
          <p className="section-label">Class X-A · Today</p>
          <p className="section-title">Sample Timetable</p>
          <p className="section-sub">Log in to your portal to view your personalised daily schedule.</p>
        </div>
        <div className="card" style={{ overflow: "hidden", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "#f8f9fc", borderBottom: "1px solid #e8ecf0" }}>
                {["Period", "Time", "Subject", "Room", "Teacher"].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE.map((row, i) => (
                <tr key={i} className="table-row-alt" style={{ borderBottom: i < TIMETABLE.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <td style={{ padding: "15px 20px", fontWeight: 600, color: row.period === "Break" ? "#94a3b8" : "#0f172a", fontSize: 13 }}>{row.period}</td>
                  <td style={{ padding: "15px 20px", color: "#64748b", fontFamily: "monospace", fontSize: 12.5 }}>{row.time}</td>
                  <td style={{ padding: "15px 20px", fontWeight: 500, color: row.period === "Break" ? "#94a3b8" : "#1e293b" }}>{row.subject}</td>
                  <td style={{ padding: "15px 20px", color: "#64748b" }}>{row.room}</td>
                  <td style={{ padding: "15px 20px", color: "#64748b" }}>{row.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Gallery ── */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <p className="section-label">Memories</p>
            <p className="section-title">Campus Gallery</p>
            <p className="section-sub">A glimpse into life at Tagore International School.</p>
          </div>
          <Link href="/gallery" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1d4ed8", textDecoration: "none" }}>View all <ChevronRight size={14} /></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {GALLERY_ITEMS.map((g, i) => (
            <div key={i} className="gallery-tile" style={{ background: g.color }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: .25 }}><Camera size={44} color={g.tcolor} /></div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <span className="badge" style={{ background: "rgba(255,255,255,.85)", color: g.tcolor, marginBottom: 7, display: "inline-block" }}>{g.tag}</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{g.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Big stats banner ── */}
      <div style={{ maxWidth: 1180, margin: "80px auto 0", padding: "0 28px" }}>
        <div style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)", borderRadius: 20, padding: "60px 64px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 220, height: 220, borderRadius: "50%", background: "rgba(56,189,248,.05)", border: "1px solid rgba(56,189,248,.07)" }} />
          <div style={{ position: "absolute", left: 80, bottom: -60, width: 160, height: 160, borderRadius: "50%", background: "rgba(139,92,246,.04)", border: "1px solid rgba(139,92,246,.06)" }} />
          {[
            { val: "35+", label: "Years of Excellence", icon: Star },
            { val: "98%", label: "Board Pass Rate", icon: TrendingUp },
            { val: "120+", label: "Faculty Members", icon: Users },
            { val: "50+", label: "Clubs & Societies", icon: Heart },
          ].map((s, i) => {
            const Icon = s.icon; return (
              <div key={i} style={{ textAlign: "center", position: "relative" }}>
                <Icon size={20} color="rgba(56,189,248,.45)" style={{ marginBottom: 14 }} />
                <p style={{ fontSize: 46, fontWeight: 700, color: "#f8fafc", letterSpacing: "-.04em", lineHeight: 1, marginBottom: 10 }}>{s.val}</p>
                <p style={{ fontSize: 13, color: "rgba(248,250,252,.4)", lineHeight: 1.4 }}>{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Contact ── */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div>
            <p className="section-label">Get in Touch</p>
            <p className="section-title" style={{ marginBottom: 8 }}>Contact the School</p>
            <p className="section-sub" style={{ marginBottom: 28 }}>Our administrative team is available Monday to Saturday, 8 AM – 4 PM.</p>
            <div className="card" style={{ padding: "8px 0" }}>
              {[
                { icon: MapPin, label: "Address", val: "12, Institutional Area, New Delhi – 110016", color: "#1d4ed8" },
                { icon: Phone, label: "Phone", val: "+91-11-2654-8800 / 2654-8801", color: "#059669" },
                { icon: Mail, label: "Email", val: "admin@tagore-school.edu.in", color: "#7c3aed" },
                { icon: Globe, label: "Website", val: "www.tagore-school.edu.in", color: "#b45309" },
              ].map((c, i) => {
                const Icon = c.icon; return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "17px 22px", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${c.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><Icon size={15} color={c.color} /></div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>{c.label}</p>
                      <p style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 500 }}>{c.val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="section-label" style={{ opacity: 0 }}>map</p>
            <p className="section-title" style={{ marginBottom: 8 }}>Find Us</p>
            <p className="section-sub" style={{ marginBottom: 28 }}>Centrally located, accessible by metro, bus, and school transport.</p>
            <div className="card" style={{ height: 300, background: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(203,213,225,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(203,213,225,.4) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
              <div style={{ position: "relative", zIndex: 1, width: 46, height: 46, borderRadius: "50%", background: "#fff", border: "3px solid #1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 12px rgba(29,78,216,.1)" }}>
                <GraduationCap size={20} color="#1d4ed8" />
              </div>
              <p style={{ position: "relative", zIndex: 1, fontSize: 13, fontWeight: 600, color: "#475569" }}>Tagore International School</p>
              <Link href="https://maps.google.com" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#1d4ed8", textDecoration: "none", background: "#fff", padding: "7px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>Open in Maps <ExternalLink size={12} /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div style={{ maxWidth: 1180, margin: "80px auto 0", padding: "0 28px" }}>
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 18, padding: "52px 56px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>New to CampusCare?</p>
            <p style={{ fontSize: 28, fontWeight: 600, color: "#0c4a6e", letterSpacing: "-.03em", lineHeight: 1.2, marginBottom: 12 }}>Everything your child needs,<br />in one place.</p>
            <p style={{ fontSize: 14.5, color: "#0369a1", lineHeight: 1.65, maxWidth: 420 }}>Attendance, assignments, grades, notices, transport tracking — all accessible from any device, any time.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
            <Link href="/register" className="btn-primary" style={{ background: "#0369a1", padding: "15px 28px", whiteSpace: "nowrap", fontSize: 15 }}>Register Now <ArrowRight size={15} /></Link>
            <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#0369a1", textDecoration: "none" }}>Already have an account? Login</Link>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e8ecf0", marginTop: 80, padding: "52px 28px 36px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 52 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}><GraduationCap size={16} color="#f8fafc" /></div>
                <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 15, letterSpacing: "-.02em" }}>CampusCare</span>
              </div>
              <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.65, maxWidth: 260 }}>A comprehensive school management solution designed for modern educational institutions.</p>
            </div>
            {[
              { heading: "Portal", links: [["Student Login", "/login"], ["Register", "/register"], ["Assignments", "/assignments"], ["Results", "/results"]] },
              { heading: "School", links: [["Notices", "/notices"], ["Timetable", "/timetable"], ["Resources", "/resources"], ["Gallery", "/gallery"]] },
              { heading: "Support", links: [["Help Centre", "/help"], ["Contact Us", "/contact"], ["Feedback", "/feedback"], ["Privacy Policy", "/privacy"]] },
            ].map(col => (
              <div key={col.heading}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 18 }}>{col.heading}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map(([label, href]) => (<Link key={href} href={href} className="footer-link">{label}</Link>))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 26, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12.5, color: "#94a3b8" }}>© 2026 Tagore International School. Powered by <span style={{ color: "#475569", fontWeight: 500 }}>Entab</span>. All rights reserved.</p>
            <div style={{ display: "flex", gap: 22 }}>
              {[["Terms", "/terms"], ["Privacy", "/privacy"], ["Cookies", "/cookies"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}