"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Flag, Trophy, Search, Bell, BookOpen, Library, KeyRound, User, TrendingUp, Clock, ChevronRight, BarChart2, Calendar, FileText, Shield, Activity, Layers, AlertCircle } from "lucide-react";
import { logRealAttack } from "@/lib/logAttack";
import { usePatchedVulns } from "@/hooks/useCampusDefense";
import { PatchedBanner } from "@/components/PatchedBanner";

interface User { id: number; username: string; role: string; email: string; full_name: string; }
interface Notice { id: number; title: string; author: string; created_at: string; }
interface Sub { correct: number; points: number; flag_name: string; submitted_at: string; }

const QUICK_LINKS = [
  { href: "/search", icon: Search, label: "Students", desc: "Find & manage records", color: "#1a3c6e", bg: "#eef2fb" },
  { href: "/notices", icon: Bell, label: "Notices", desc: "Campus bulletins", color: "#f5820a", bg: "#fff4e8" },
  { href: "/assignments", icon: BookOpen, label: "Assignments", desc: "Tasks & submissions", color: "#7c3aed", bg: "#f4f0ff" },
  { href: "/resources", icon: Library, label: "Resources", desc: "Library & materials", color: "#0891b2", bg: "#e8f7fb" },
  { href: "/jwt-debug", icon: KeyRound, label: "JWT Debug", desc: "Token inspector", color: "#dc2626", bg: "#fef0f0" },
];

const SCHEDULE = [
  { time: "08:30", period: "AM", subject: "Mathematics", teacher: "Dr. Sharma", room: "Rm 402", status: "done" },
  { time: "09:30", period: "AM", subject: "Physics Lab", teacher: "Ms. Iyer", room: "Lab B", status: "active" },
  { time: "11:00", period: "AM", subject: "English Literature", teacher: "Mr. D'Souza", room: "Rm 105", status: "upcoming" },
  { time: "12:30", period: "PM", subject: "Lunch Break", teacher: "", room: "Canteen", status: "break" },
  { time: "01:30", period: "PM", subject: "Computer Science", teacher: "Ms. Nair", room: "Lab A", status: "upcoming" },
  { time: "02:30", period: "PM", subject: "History", teacher: "Mr. Rao", room: "Rm 210", status: "upcoming" },
];

const PERFORMANCE = [
  { subject: "Mathematics", score: 88, max: 100 },
  { subject: "Physics", score: 76, max: 100 },
  { subject: "English", score: 92, max: 100 },
  { subject: "Comp. Sci", score: 95, max: 100 },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const patchedVulns = usePatchedVulns();

  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }

    try {
      const u = JSON.parse(atob(match[1].split(".")[1]));
      setUser(u);

      Promise.all([
        fetch("/api/notices").then(r => r.json())
      ]).then(([noticeData]) => {
        const fetchedNotices = noticeData.notices || [];
        setNotices(fetchedNotices);

        fetchedNotices.forEach((n: any) => {
          if (/<script|onerror|javascript:/i.test(n.title)) {
            logRealAttack({ type: "xss_dashboard", severity: "critical", detail: "XSS payload detected in dashboard notice title", endpoint: "/dashboard", payload: n.title });
          }
        });
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

  const firstName = user.full_name?.split(" ")[0] || user.username;
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .db-root {
          background: #f2f1ed;
          min-height: 100vh;
          font-family: 'Sora', sans-serif;
        }

        .db-wrap {
          margin-left: 240px;
          padding-top: 56px;
        }

        .db-main {
          padding: 36px 36px 60px;
          max-width: 1180px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }

        .db-main.visible {
          opacity: 1;
          transform: none;
        }

        /* ── Hero Banner ── */
        .db-hero {
          background: #1a3c6e;
          border-radius: 16px;
          padding: 32px 36px;
          margin-bottom: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }

        .db-hero::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          pointer-events: none;
        }

        .db-hero::after {
          content: '';
          position: absolute;
          bottom: -80px;
          right: 120px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(245,130,10,0.08);
          pointer-events: none;
        }

        .db-hero-left {}

        .db-greeting-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin: 0 0 8px;
        }

        .db-greeting-name {
          font-family: 'Sora', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 8px;
          line-height: 1.1;
        }

        .db-greeting-name em {
          font-style: normal;
          color: #f5a84e;
        }

        .db-greeting-date {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          margin: 0;
          font-family: 'JetBrains Mono', monospace;
        }

        .db-hero-stats {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .db-stat-pill {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 20px;
          text-align: center;
          min-width: 80px;
          backdrop-filter: blur(4px);
        }

        .db-stat-val {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          margin-bottom: 4px;
        }

        .db-stat-val.accent { color: #f5a84e; }
        .db-stat-val.green  { color: #6ee7b7; }
        .db-stat-val.red    { color: #fca5a5; }

        .db-stat-lbl {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.4);
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── Grid ── */
        .db-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 22px;
          align-items: start;
        }

        .db-col-left  { display: flex; flex-direction: column; gap: 18px; }
        .db-col-right { display: flex; flex-direction: column; gap: 18px; }

        /* ── Card base ── */
        .db-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e8e5de;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }

        .db-card-header {
          padding: 14px 20px;
          border-bottom: 1px solid #edeae3;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .db-card-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          font-weight: 500;
          color: #9a9080;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .db-card-title-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1a3c6e;
          display: inline-block;
        }

        .db-card-action {
          font-size: 11px;
          font-weight: 600;
          color: #f5820a;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 2px;
          transition: gap 0.15s;
        }

        .db-card-action:hover { gap: 5px; }

        /* ── Profile card ── */
        .db-profile-avatar {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: #1a3c6e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }

        .db-profile-hero {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid #edeae3;
        }

        .db-profile-name {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 3px;
          line-height: 1.2;
        }

        .db-profile-sub {
          font-size: 11px;
          color: #9a9080;
          margin: 0;
          font-family: 'JetBrains Mono', monospace;
        }

        .db-profile-rows {}

        .db-profile-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 11px 20px;
          border-bottom: 1px solid #f4f2ee;
          transition: background 0.12s;
        }

        .db-profile-row:last-child { border-bottom: none; }
        .db-profile-row:hover { background: #fafaf7; }

        .db-profile-key {
          font-size: 11px;
          color: #9a9080;
          font-weight: 500;
        }

        .db-profile-val {
          font-size: 11px;
          color: #1a1a1a;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          word-break: break-all;
          text-align: right;
          max-width: 180px;
        }

        .db-role-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 2px 10px;
          border-radius: 20px;
        }

        .db-admin-link {
          margin: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 0;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #dc2626;
          background: rgba(220,38,38,0.07);
          border: 1px solid rgba(220,38,38,0.18);
          border-radius: 9px;
          text-decoration: none;
          transition: background 0.15s;
        }

        .db-admin-link:hover { background: rgba(220,38,38,0.13); }

        /* ── Quick Links ── */
        .db-ql-grid {
          padding: 12px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .db-ql-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 13px;
          border-radius: 10px;
          border: 1px solid #edeae3;
          text-decoration: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.12s;
          background: #fafaf7;
        }

        .db-ql-item:hover {
          border-color: #d0cdc5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          background: #fff;
        }

        .db-ql-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .db-ql-text { flex: 1; min-width: 0; }

        .db-ql-label {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .db-ql-desc {
          font-size: 10px;
          color: #9a9080;
          line-height: 1.2;
          margin-top: 1px;
        }

        .db-ql-arrow {
          color: #ccc8c0;
          flex-shrink: 0;
        }

        /* ── Schedule ── */
        .db-schedule-list {
          padding: 0;
        }

        .db-schedule-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid #f4f2ee;
          transition: background 0.12s;
        }

        .db-schedule-row:last-child { border-bottom: none; }
        .db-schedule-row:hover { background: #fafaf7; }

        .db-schedule-row.break-row { opacity: 0.45; }

        .db-time-block {
          text-align: right;
          width: 56px;
          flex-shrink: 0;
        }

        .db-time-main {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          line-height: 1;
        }

        .db-time-period {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #9a9080;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .db-schedule-divider {
          width: 1px;
          height: 36px;
          background: #edeae3;
          flex-shrink: 0;
        }

        .db-schedule-info { flex: 1; min-width: 0; }

        .db-schedule-subject {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 2px;
        }

        .db-schedule-meta {
          font-size: 11px;
          color: #9a9080;
          display: flex;
          gap: 8px;
        }

        .db-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .db-status-active {
          background: #f5820a;
          box-shadow: 0 0 0 3px rgba(245,130,10,0.18);
          animation: pulse-dot 1.5s ease-in-out infinite;
        }

        .db-status-done     { background: #d1d5c0; }
        .db-status-upcoming { background: #e8e5de; }
        .db-status-break    { background: #e8e5de; }

        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 3px rgba(245,130,10,0.18); }
          50%       { box-shadow: 0 0 0 5px rgba(245,130,10,0.08); }
        }

        /* ── Performance ── */
        .db-perf-body { padding: 20px; }

        .db-perf-row {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .db-perf-row:last-child { margin-bottom: 0; }

        .db-perf-label {
          font-size: 12px;
          font-weight: 600;
          color: #3a3530;
          width: 110px;
          flex-shrink: 0;
        }

        .db-perf-bar-wrap {
          flex: 1;
          height: 7px;
          background: #edeae3;
          border-radius: 4px;
          overflow: hidden;
        }

        .db-perf-bar-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, #1a3c6e, #2563eb);
          transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .db-perf-score {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          color: #1a3c6e;
          width: 36px;
          text-align: right;
          flex-shrink: 0;
        }

        /* ── Bulletins ── */
        .db-bulletins-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .db-bulletin-item {
          padding: 18px 20px;
          border-bottom: 1px solid #f4f2ee;
          border-right: 1px solid #f4f2ee;
          cursor: pointer;
          transition: background 0.12s;
        }

        .db-bulletin-item:nth-child(even) { border-right: none; }
        .db-bulletin-item:nth-last-child(-n+2) { border-bottom: none; }
        .db-bulletin-item:hover { background: #fafaf7; }

        .db-bulletin-tag {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          background: #f4f2ee;
          color: #6b6560;
          border-radius: 4px;
          padding: 2px 7px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 8px;
        }

        .db-bulletin-title {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.45;
          margin: 0 0 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .db-bulletin-date {
          font-size: 10px;
          color: #9a9080;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── Activity Row ── */
        .db-activity-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

        /* ── Mini stat cards ── */
        .db-mini-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 22px;
        }

        .db-mini-stat {
          background: #fff;
          border: 1px solid #e8e5de;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .db-mini-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .db-mini-stat-val {
          font-size: 22px;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1;
          margin-bottom: 3px;
        }

        .db-mini-stat-lbl {
          font-size: 11px;
          color: #9a9080;
          font-weight: 500;
        }

        /* ── Attendance visual ── */
        .db-attendance-body { padding: 20px; }

        .db-attendance-arc {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .db-att-donut {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .db-att-legend { flex: 1; }

        .db-att-legend-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .db-att-legend-row:last-child { margin-bottom: 0; }

        .db-att-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }

        .db-att-label { color: #3a3530; font-weight: 500; }
        .db-att-count { font-family: 'JetBrains Mono', monospace; color: #1a1a1a; font-weight: 600; }
      `}</style>

      <div className="db-root">
        <Navbar />
        <div className="db-wrap">
          <main className={`db-main${mounted ? " visible" : ""}`}>

            {/* ── Hero ── */}
            <div className="db-hero">
              <div className="db-hero-left">
                <p className="db-greeting-label">{greeting}</p>
                <h1 className="db-greeting-name">
                  Welcome back, <em>{firstName}</em>
                </h1>
                <p className="db-greeting-date">{today}</p>
              </div>

              <div className="db-hero-stats">
                {[
                  { label: "User ID", value: `#${user.id}`, cls: "" },
                  { label: "Role", value: user.role.toUpperCase(), cls: user.role === "admin" ? "red" : "accent" },
                  { label: "Class", value: "12-A", cls: "" },
                  { label: "Attendance", value: "94%", cls: "green" },
                  { label: "Rank", value: rank ? `#${rank}` : "—", cls: "" },
                ].map(s => (
                  <div key={s.label} className="db-stat-pill">
                    <div className={`db-stat-val ${s.cls}`}>{s.value}</div>
                    <div className="db-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Mini stats row ── */}
            <div className="db-mini-stats">
              {[
                { icon: BookOpen, iconBg: "#eef2fb", iconColor: "#1a3c6e", val: "3", lbl: "Due Assignments" },
                { icon: Bell, iconBg: "#fff4e8", iconColor: "#f5820a", val: notices.length || "—", lbl: "Active Notices" },
                { icon: TrendingUp, iconBg: "#f0fdf4", iconColor: "#16a34a", val: "88%", lbl: "Avg. Score" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="db-mini-stat">
                    <div className="db-mini-stat-icon" style={{ background: s.iconBg }}>
                      <Icon style={{ width: 18, height: 18, color: s.iconColor }} />
                    </div>
                    <div>
                      <div className="db-mini-stat-val">{String(s.val)}</div>
                      <div className="db-mini-stat-lbl">{s.lbl}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Main Grid ── */}
            <div className="db-grid">

              {/* ── Left Column ── */}
              <div className="db-col-left">

                {/* Profile */}
                <div className="db-card">
                  <div className="db-profile-hero">
                    <div className="db-profile-avatar">
                      {firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="db-profile-name">{user.full_name || user.username}</p>
                      <p className="db-profile-sub">@{user.username}</p>
                    </div>
                  </div>
                  <div className="db-profile-rows">
                    {[
                      { key: "Email", val: user.email },
                      { key: "User ID", val: `#${user.id}` },
                      { key: "Status", val: "role" },
                      { key: "Section", val: "12-A" },
                    ].map(row => (
                      <div key={row.key} className="db-profile-row">
                        <span className="db-profile-key">{row.key}</span>
                        {row.val === "role" ? (
                          <span
                            className="db-role-badge"
                            style={{
                              background: user.role === "admin" ? "rgba(220,38,38,0.1)" : user.role === "staff" ? "rgba(202,138,4,0.1)" : "rgba(26,60,110,0.1)",
                              color: user.role === "admin" ? "#dc2626" : user.role === "staff" ? "#b45309" : "#1a3c6e",
                              border: `1px solid ${user.role === "admin" ? "rgba(220,38,38,0.25)" : user.role === "staff" ? "rgba(202,138,4,0.25)" : "rgba(26,60,110,0.25)"}`,
                            }}
                          >
                            {user.role}
                          </span>
                        ) : (
                          <span className="db-profile-val">{row.val}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {user.role === "admin" && (
                    <Link href="/admin" className="db-admin-link">
                      <Shield style={{ width: 13, height: 13 }} />
                      Admin Panel
                    </Link>
                  )}
                </div>

                {/* Quick Links */}
                <div className="db-card">
                  <div className="db-card-header">
                    <span className="db-card-title">
                      <span className="db-card-title-dot" />
                      Quick Links
                    </span>
                  </div>
                  <div className="db-ql-grid">
                    {QUICK_LINKS.map(l => {
                      const Icon = l.icon;
                      return (
                        <Link key={l.href} href={l.href} className="db-ql-item">
                          <div className="db-ql-icon-wrap" style={{ background: l.bg }}>
                            <Icon style={{ width: 14, height: 14, color: l.color }} />
                          </div>
                          <div className="db-ql-text">
                            <div className="db-ql-label">{l.label}</div>
                            <div className="db-ql-desc">{l.desc}</div>
                          </div>
                          <ChevronRight className="db-ql-arrow" style={{ width: 13, height: 13 }} />
                        </Link>
                      );
                    })}
                    <Link href={`/profile/${user.id}`} className="db-ql-item">
                      <div className="db-ql-icon-wrap" style={{ background: "#f4f2ee" }}>
                        <User style={{ width: 14, height: 14, color: "#6b6560" }} />
                      </div>
                      <div className="db-ql-text">
                        <div className="db-ql-label">My Profile</div>
                        <div className="db-ql-desc">View full profile</div>
                      </div>
                      <ChevronRight className="db-ql-arrow" style={{ width: 13, height: 13 }} />
                    </Link>
                  </div>
                </div>

                {/* Attendance */}
                <div className="db-card">
                  <div className="db-card-header">
                    <span className="db-card-title">
                      <span className="db-card-title-dot" style={{ background: "#16a34a" }} />
                      Attendance — April
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: "#16a34a" }}>94%</span>
                  </div>
                  <div className="db-attendance-body">
                    <div className="db-attendance-arc">
                      <svg className="db-att-donut" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#edeae3" strokeWidth="10" />
                        <circle
                          cx="40" cy="40" r="30" fill="none" stroke="#1a3c6e" strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 30 * 0.94} ${2 * Math.PI * 30}`}
                          strokeLinecap="round"
                          transform="rotate(-90 40 40)"
                        />
                        <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1a1a" fontFamily="Sora, sans-serif">94%</text>
                      </svg>
                      <div className="db-att-legend">
                        {[
                          { label: "Present", count: "18", color: "#1a3c6e" },
                          { label: "Absent", count: "1", color: "#fca5a5" },
                          { label: "Late", count: "1", color: "#f5820a" },
                        ].map(r => (
                          <div key={r.label} className="db-att-legend-row">
                            <div className="db-att-label">
                              <span className="db-att-dot" style={{ background: r.color }} />
                              {r.label}
                            </div>
                            <span className="db-att-count">{r.count} days</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right Column ── */}
              <div className="db-col-right">

                {/* Today's Schedule */}
                <div className="db-card">
                  <div className="db-card-header">
                    <span className="db-card-title">
                      <span className="db-card-title-dot" style={{ background: "#f5820a" }} />
                      Today's Schedule
                    </span>
                    <Link href="/schedule" className="db-card-action">
                      View full <ChevronRight style={{ width: 13, height: 13 }} />
                    </Link>
                  </div>
                  <div className="db-schedule-list">
                    {SCHEDULE.map((cls, i) => (
                      <div key={i} className={`db-schedule-row${cls.status === "break" ? " break-row" : ""}`}>
                        <div className="db-time-block">
                          <div className="db-time-main">{cls.time}</div>
                          <div className="db-time-period">{cls.period}</div>
                        </div>
                        <div className="db-schedule-divider" />
                        <div className="db-schedule-info">
                          <div className="db-schedule-subject">{cls.subject}</div>
                          {cls.teacher && (
                            <div className="db-schedule-meta">
                              <span>{cls.teacher}</span>
                              <span>·</span>
                              <span>{cls.room}</span>
                            </div>
                          )}
                        </div>
                        <div
                          className={`db-status-dot db-status-${cls.status}`}
                          title={cls.status}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance */}
                <div className="db-card">
                  <div className="db-card-header">
                    <span className="db-card-title">
                      <span className="db-card-title-dot" style={{ background: "#7c3aed" }} />
                      Academic Performance
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9a9080" }}>Term 2 · 2025</span>
                  </div>
                  <div className="db-perf-body">
                    {PERFORMANCE.map(p => (
                      <div key={p.subject} className="db-perf-row">
                        <div className="db-perf-label">{p.subject}</div>
                        <div className="db-perf-bar-wrap">
                          <div className="db-perf-bar-fill" style={{ width: `${(p.score / p.max) * 100}%` }} />
                        </div>
                        <div className="db-perf-score">{p.score}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campus Bulletins */}
                <div className="db-card">
                  <div className="db-card-header">
                    <span className="db-card-title">
                      <span className="db-card-title-dot" style={{ background: "#f5820a" }} />
                      Campus Bulletins
                    </span>
                    <Link href="/notices" className="db-card-action">
                      All notices <ChevronRight style={{ width: 13, height: 13 }} />
                    </Link>
                  </div>

                  {patchedVulns.has("xss_dashboard") && (
                    <div style={{ padding: "8px 20px" }}>
                      <PatchedBanner label="XSS — DASHBOARD" />
                    </div>
                  )}

                  <div className="db-bulletins-grid">
                    {notices.slice(0, 4).map((n, i) => (
                      <div key={n.id} className="db-bulletin-item">
                        <span className="db-bulletin-tag">{n.author}</span>
                        {patchedVulns.has("xss_dashboard") ? (
                          /* PATCHED: safe text rendering */
                          <h4 className="db-bulletin-title">{n.title}</h4>
                        ) : (
                          /* VULNERABILITY: notice titles on dashboard rendered as raw HTML */
                          <h4
                            className="db-bulletin-title"
                            dangerouslySetInnerHTML={{ __html: n.title }}
                          />
                        )}
                        <div className="db-bulletin-date">
                          {new Date(n.created_at).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}