"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Bell, Search, BookOpen, Library,
  Flag, Trophy, KeyRound, ShieldAlert, LogOut,
  ChevronRight, GraduationCap, FileText, MessageSquare
} from "lucide-react";

interface User { id: number; username: string; role: string; }

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notices", label: "Notices", icon: Bell },
  { href: "/search", label: "Search Directory", icon: Search },
  { href: "/documents", label: "Campus Documents", icon: FileText },
  { href: "/assignments", label: "Assignments", icon: BookOpen },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/jwt-debug", label: "JWT Debugger", icon: KeyRound },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/notices": "Notice Board",
  "/documents": "Campus Documents",
  "/search": "Student Directory",
  "/assignments": "Assignments",
  "/resources": "Resources",
  "/jwt-debug": "JWT Debugger",
  "/feedback": "Feedback",
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [hasCritical, setHasCritical] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isForged, setIsForged] = useState(false);

  useEffect(() => {
    // Poll for unacknowledged critical attacks
    const checkCritical = () => {
      try {
        const raw = localStorage.getItem("campus_attack_log");
        if (raw) {
          const events: any[] = JSON.parse(raw);
          const hasUnacked = events.some(e => e.severity === "critical" && !e.detected && !e.patched);
          setHasCritical(hasUnacked);
        }
      } catch { /* ignore */ }
    };
    checkCritical();
    const interval = setInterval(checkCritical, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync user state with JWT in cookies
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { setUser(null); setIsForged(false); return; }
    try {
      // Classic CTF hint: Client-side JWT decoding via atob
      const parts = match[1].split(".");
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
      const payload = JSON.parse(atob(padded));
      setUser(payload);
      setIsForged(parts.length < 3 || !parts[2]);
    } catch {
      setUser(null);
      setIsForged(false);
    }
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    document.cookie = "token=; path=/; max-age=0";
    setUser(null);
    router.push("/login");
  };

  // Determine current page title (handles dynamic segments like /profile/[id])
  const pageTitle =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/profile") ? "Student Profile" : "CampusCare");

  // Get initials from username
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        /* ── Sidebar ── */
        .nb-aside {
          position: fixed;
          inset-block: 0;
          left: 0;
          z-index: 40;
          width: 240px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid #e8e5de;
          font-family: 'Sora', sans-serif;
        }

        /* ── Logo ── */
        .nb-logo {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 20px 18px 18px;
          border-bottom: 1px solid #edeae3;
          flex-shrink: 0;
        }

        .nb-logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f5820a 0%, #e06700 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(245,130,10,0.25);
        }

        .nb-logo-text {}

        .nb-logo-name {
          font-size: 14px;
          font-weight: 800;
          color: #1a3c6e;
          line-height: 1.1;
          letter-spacing: -0.3px;
        }

        .nb-logo-sub {
          font-size: 9px;
          font-weight: 600;
          color: #f5820a;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-top: 1px;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── Section label ── */
        .nb-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #b0a898;
          padding: 14px 18px 6px;
          user-select: none;
        }

        /* ── Nav scroll area ── */
        .nb-nav {
          flex: 1;
          overflow-y: auto;
          padding: 8px 10px 12px;
          scrollbar-width: none;
        }

        .nb-nav::-webkit-scrollbar { display: none; }

        /* ── Nav Item ── */
        .nb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          position: relative;
          margin-bottom: 2px;
          transition: background 0.18s ease, color 0.18s ease;
          color: #6b6560;
          outline: none;
        }

        .nb-item-active {
          background: #fff4e8;
          color: #1a3c6e;
        }

        .nb-item-hover {
          background: #f4f2ee;
          color: #3a3530;
        }

        /* Active indicator pill on left */
        .nb-item-active-bar {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          border-radius: 0 3px 3px 0;
          background: #f5820a;
          transition: opacity 0.18s, height 0.18s;
        }

        .nb-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.18s;
        }

        .nb-icon-wrap-active {
          background: rgba(245,130,10,0.14);
        }

        .nb-icon-wrap-hover {
          background: #edeae3;
        }

        .nb-item-label {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Critical alert dot */
        .nb-alert-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 0 2px rgba(239,68,68,0.3);
          animation: nb-pulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes nb-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(239,68,68,0.3); }
          50%       { box-shadow: 0 0 0 5px rgba(239,68,68,0.08); }
        }

        /* ── Divider ── */
        .nb-divider {
          height: 1px;
          background: #edeae3;
          margin: 6px 10px;
        }

        /* ── User section ── */
        .nb-user-section {
          border-top: 1px solid #edeae3;
          padding: 12px 10px 10px;
          flex-shrink: 0;
          background: #fafaf7;
        }

        .nb-user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.18s;
          margin-bottom: 4px;
          cursor: pointer;
        }

        .nb-user-card:hover { background: #f0ede7; }

        .nb-avatar {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #f5820a, #e06700);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(245,130,10,0.25);
          font-family: 'Sora', sans-serif;
        }

        .nb-user-info { flex: 1; min-width: 0; }

        .nb-user-name {
          font-size: 12px;
          font-weight: 700;
          color: #1a3c6e;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nb-user-role {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
          display: inline-block;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .nb-user-role-admin {
          background: rgba(220,38,38,0.1);
          color: #dc2626;
        }

        .nb-user-role-staff {
          background: rgba(202,138,4,0.1);
          color: #b45309;
        }

        .nb-user-role-default {
          background: rgba(245,130,10,0.12);
          color: #c2550a;
        }

        .nb-user-chevron {
          color: #c4bfb8;
          flex-shrink: 0;
          transition: color 0.15s, transform 0.15s;
        }

        .nb-user-card:hover .nb-user-chevron {
          color: #9a9080;
          transform: translateX(2px);
        }

        .nb-logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          color: #9a9080;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          font-family: 'Sora', sans-serif;
          text-align: left;
        }

        .nb-logout-btn:hover {
          background: rgba(220,38,38,0.07);
          color: #dc2626;
        }

        /* ── Top Header ── */
        .nb-topbar {
          position: fixed;
          top: 0;
          right: 0;
          left: 240px;
          z-index: 30;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #edeae3;
          font-family: 'Sora', sans-serif;
        }

        .nb-topbar-title {
          font-size: 15px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nb-topbar-crumb {
          font-size: 11px;
          font-weight: 500;
          color: #9a9080;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.5px;
        }

        .nb-topbar-sep {
          color: #d0cdc5;
          font-size: 14px;
          margin: 0 2px;
        }

        .nb-topbar-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .nb-topbar-school {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          color: #6b6560;
        }

        .nb-topbar-date {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          color: #9a9080;
          padding: 4px 10px;
          background: #f4f2ee;
          border-radius: 6px;
        }

        .nb-topbar-divider {
          width: 1px;
          height: 18px;
          background: #e8e5de;
        }
      `}</style>

      {/* ─── Left Sidebar ── */}
      <aside className="nb-aside">

        {/* Logo */}
        <div className="nb-logo">
          <div className="nb-logo-mark">C</div>
          <div className="nb-logo-text">
            <div className="nb-logo-name">CampusCare</div>
            <div className="nb-logo-sub">by Entab</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="nb-nav">
          <div className="nb-section-label">Main Menu</div>

          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            const isHovered = hoveredHref === href;

            return (
              <Link
                key={href}
                href={href}
                className={`nb-item ${isActive ? "nb-item-active" : isHovered ? "nb-item-hover" : ""}`}
                onMouseEnter={() => setHoveredHref(href)}
                onMouseLeave={() => setHoveredHref(null)}
              >
                {isActive && <span className="nb-item-active-bar" />}
                <div className={`nb-icon-wrap ${isActive ? "nb-icon-wrap-active" : isHovered ? "nb-icon-wrap-hover" : ""}`}>
                  <Icon
                    style={{
                      width: 15, height: 15,
                      color: isActive ? "#f5820a" : isHovered ? "#3a3530" : "#b0a898",
                      transition: "color 0.18s",
                    }}
                  />
                </div>
                <span className="nb-item-label">{label}</span>
                {hasCritical && href === "/defense" && <span className="nb-alert-dot" />}
              </Link>
            );
          })}

          {/* {user?.role === "admin" && (
            <Link href="/admin" ...>...</Link>
          )} */}

          {/* {(user?.role === "admin" || user?.role === "staff") && (
            <Link href="/defense" ...>...</Link>
          )} */}
        </nav>

        {/* User Section */}
        {user && (
          <div className="nb-user-section">
            <Link
              href={`/profile/${user.id}`}
              className="nb-user-card"
            >
              <div className="nb-avatar">{initials}</div>
              <div className="nb-user-info">
                <div className="nb-user-name">{user.username}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    className={`nb-user-role ${user.role === "admin" ? "nb-user-role-admin" :
                        user.role === "staff" ? "nb-user-role-staff" :
                          "nb-user-role-default"
                      }`}
                  >
                    {user.role}
                  </span>
                  {isForged && (
                    <span style={{ 
                      fontSize: 8, fontWeight: 800, background: "#ef4444", color: "#fff", 
                      padding: "2px 5px", borderRadius: 4, letterSpacing: 0.5 
                    }}>
                      JWT FORGED
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="nb-user-chevron" style={{ width: 14, height: 14 }} />
            </Link>

            {isForged ? (
              <button onClick={logout} className="nb-logout-btn" style={{ color: "#ef4444" }}>
                <KeyRound style={{ width: 14, height: 14 }} />
                Revert Forgery
              </button>
            ) : (
              <button onClick={logout} className="nb-logout-btn">
                <LogOut style={{ width: 14, height: 14 }} />
                Sign Out
              </button>
            )}
          </div>
        )}
      </aside>

      {/* ─── Top Header Bar ── */}
      <header className="nb-topbar">
        <div className="nb-topbar-title">
          <span className="nb-topbar-crumb">CampusCare</span>
          <span className="nb-topbar-sep">/</span>
          <span>{pageTitle}</span>
        </div>
        <div className="nb-topbar-right">
          <div className="nb-topbar-school">
            <GraduationCap style={{ width: 15, height: 15, color: "#9a9080" }} />
            Tagore International School
          </div>
          <div className="nb-topbar-divider" />
          <div className="nb-topbar-date">
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
      </header>
    </>
  );
}