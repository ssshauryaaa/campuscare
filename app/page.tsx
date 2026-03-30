"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

// VULNERABILITY (Easy — 50pts): Flag hidden in HTML source comment below.
// Right-click → View Page Source → Ctrl+F → BREACH

const QUICK_LINKS = [
  { href: "/login", icon: "🔑", label: "Student Login", desc: "Access your account" },
  { href: "/notices", icon: "📋", label: "Notice Board", desc: "School announcements" },
  { href: "/leaderboard", icon: "🏆", label: "Leaderboard", desc: "Breach@trix live scores" },
  { href: "/submit", icon: "🚩", label: "Submit Flag", desc: "Claim your points" },
  { href: "/assignments", icon: "📝", label: "Assignments", desc: "Pending class work" },
  { href: "/resources", icon: "📚", label: "Resources", desc: "Study materials" },
];

const ANNOUNCEMENTS = [
  { icon: "📅", text: "PTM scheduled — 15th April" },
  { icon: "🏆", text: "Annual Sports Day — 20th April" },
  { icon: "📋", text: "Exam timetable now available" },
  { icon: "⚔️", text: "Breach@trix Finals — 8th May" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-cyan-500/30">
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
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Hero Section */}
        <header className="mb-12">
          <div className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">
            Greenfield International School
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
            CampusCare <span className="text-slate-500 font-light">Student Portal</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Manage your academic life — access notices, assignments, and resources in a secure, unified environment.
          </p>
        </header>

        {/* Quick Access Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {QUICK_LINKS.map((card) => (
            <Link key={card.href} href={card.href} className="group">
              <div className="h-full p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                <h3 className="text-white font-semibold mb-1">{card.label}</h3>
                <p className="text-slate-400 text-sm">{card.desc}</p>
              </div>
            </Link>
          ))}
        </section>

        {/* Secondary Info Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Announcements Card */}
          <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Recent Announcements</h2>
            <div className="space-y-4">
              {ANNOUNCEMENTS.map((a, i) => (
                <div key={i} className="flex items-center gap-4 text-sm group cursor-default">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-cyan-500/20 transition-colors">
                    {a.icon}
                  </span>
                  <span className="text-slate-300">{a.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Info Card */}
          <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">System Status</h2>
            <div className="space-y-3">
              {[
                { label: "Portal Version", value: "v2.3.1" },
                { label: "Framework", value: "Next.js 14" },
                { label: "Database", value: "SQLite (campus.db)", highlight: true },
                { label: "Environment", value: "DEVELOPMENT", status: "bg-yellow-500/20 text-yellow-500" },
                { label: "Debug Mode", value: "ENABLED", status: "bg-red-500/20 text-red-500" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  {row.status ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${row.status}`}>
                      {row.value}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-300 font-mono">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2026 Greenfield International School · <span className="text-slate-600">Secure Node OS</span>
          </p>
          <div className="flex gap-6">
            {["Login", "Notices", "Leaderboard", "Register"].map((link) => (
              <Link key={link} href={`/${link.toLowerCase()}`} className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}