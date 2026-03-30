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
        fetch("/api/notices").then(r => r.json()),
        fetch("/api/submit").then(r => r.json()),
        fetch("/api/leaderboard").then(r => r.json())
      ]).then(([noticeData, subData, lbData]) => {
        setNotices(noticeData.notices || []);
        setSubs(subData.submissions || []);
        const idx = (lbData.scores || []).findIndex((s: any) => s.username === u.username);
        if (idx !== -1) setRank(idx + 1);
      });
    } catch {
      router.push("/login");
    }
  }, [router]);

  if (!user) return null;

  const correct = subs.filter(s => s.correct);
  const totalPts = correct.reduce((a, b) => a + b.points, 0);

  const stats = [
    { label: "User ID", value: `#${user.id}`, color: "text-gray-400" },
    { 
      label: "Role", 
      value: user.role.toUpperCase(), 
      color: user.role === "admin" ? "text-red-400" : user.role === "staff" ? "text-amber-400" : "text-blue-400" 
    },
    { label: "Flags Captured", value: `${correct.length}/4`, color: "text-emerald-400" },
    { label: "Total Points", value: totalPts, color: "text-amber-400" },
  ];

  const quickLinks = [
    { href: "/submit", emoji: "🚩", label: "Submit Flag" },
    { href: "/leaderboard", emoji: "🏆", label: "Leaderboard" },
    { href: "/search", emoji: "🔍", label: "Students" },
    { href: "/notices", emoji: "📋", label: "Notices" },
    { href: "/assignments", emoji: "📝", label: "Assignments" },
    { href: "/resources", emoji: "📚", label: "Resources" },
    { href: "/jwt-debug", emoji: "🔐", label: "JWT Debug" },
    { href: `/profile/${user.id}`, emoji: "👤", label: "My Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      <Navbar />
      
      <main className={`max-w-6xl mx-auto px-6 py-10 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Header Section */}
        <section className="mb-10">
          <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 italic">
            Welcome back, <span className="text-white not-italic">{user.full_name?.split(" ")[0] || user.username}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm max-w-xl">
            You are currently ranked <span className="text-amber-500 font-mono">#{rank || '--'}</span> on the system leaderboard. 
            Keep capturing flags to increase your clearance level.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors group">
              <div className={`text-2xl font-black mb-1 transition-transform group-hover:scale-105 ${s.color}`}>
                {s.value}
              </div>
              <div className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Account & Quick Links Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Card */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                System Credentials
              </div>
              <div className="divide-y divide-white/5">
                {[
                  ["Username", user.username, true],
                  ["Email", user.email, false],
                  ["Status", user.role.toUpperCase(), false],
                ].map(([k, v, mono]) => (
                  <div key={String(k)} className="flex justify-between px-5 py-4 hover:bg-white/[0.01] transition-colors">
                    <span className="text-xs text-gray-500 font-medium">{String(k)}</span>
                    <span className={`text-xs ${mono ? 'font-mono text-emerald-400' : 'text-gray-300'}`}>{String(v)}</span>
                  </div>
                ))}
              </div>
              {user.role === "admin" && (
                <div className="p-4">
                  <Link href="/admin" className="block w-full text-center py-2 text-[11px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-all">
                    Access Admin Core
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                Module Shortcuts
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {quickLinks.map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-black hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group">
                    <span className="text-lg group-hover:scale-110 transition-transform">{l.emoji}</span>
                    <span className="text-[11px] font-semibold text-gray-400 group-hover:text-white transition-colors">{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Submissions Table */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Deployment Logs</h3>
                <Link href="/submit" className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-tighter">View Decrypted Logs</Link>
              </div>
              <div className="min-h-[200px]">
                {subs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                    <span className="text-4xl mb-2 opacity-20">📡</span>
                    <p className="text-xs font-medium uppercase tracking-widest">No signals detected</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.01] text-[10px] text-gray-600 uppercase font-bold">
                      <tr>
                        <th className="px-6 py-3">Flag Identifier</th>
                        <th className="px-6 py-3">Verification</th>
                        <th className="px-6 py-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {subs.slice(0, 5).map((s, i) => (
                        <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="px-6 py-4 text-xs font-mono text-gray-400 group-hover:text-emerald-400 transition-colors">{s.flag_name}</td>
                          <td className="px-6 py-4">
                            {s.correct ? 
                              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">VALID</span> : 
                              <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">FAILED</span>
                            }
                          </td>
                          <td className={`px-6 py-4 text-right text-xs font-bold ${s.correct ? 'text-emerald-400' : 'text-gray-700'}`}>
                            {s.correct ? `+${s.points}` : '0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Notices Grid */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Campus Bulletins</h3>
                <Link href="/notices" className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-tighter">Archive</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
                {notices.slice(0, 4).map((n) => (
                  <div key={n.id} className="bg-[#111] p-6 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <div className="text-[10px] text-emerald-500/50 font-bold mb-2 uppercase tracking-widest">{n.author}</div>
                    <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors mb-2 line-clamp-1">{n.title}</h4>
                    <div className="text-[10px] text-gray-600 font-medium italic">
                      Transmitted on {new Date(n.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}