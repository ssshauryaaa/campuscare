"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Bell, Search, BookOpen, Library,
  Flag, Trophy, KeyRound, ShieldAlert, LogOut,
  ChevronRight, GraduationCap,
} from "lucide-react";

interface User { id: number; username: string; role: string; }

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",        icon: LayoutDashboard },
  { href: "/notices",     label: "Notices",           icon: Bell            },
  { href: "/search",      label: "Search Directory",  icon: Search          },
  { href: "/assignments", label: "Assignments",       icon: BookOpen        },
  { href: "/resources",   label: "Resources",         icon: Library         },
  { href: "/submit",      label: "Submit Flag",       icon: Flag            },
  { href: "/leaderboard", label: "Leaderboard",       icon: Trophy          },
  { href: "/jwt-debug",   label: "JWT Debugger",      icon: KeyRound        },
];

const PAGE_TITLES: Record<string, string> = {
  "/":            "Home",
  "/dashboard":   "Dashboard",
  "/notices":     "Notice Board",
  "/search":      "Student Directory",
  "/assignments": "Assignments",
  "/resources":   "Resources",
  "/submit":      "Submit Flag",
  "/leaderboard": "Leaderboard",
  "/jwt-debug":   "JWT Debugger",
  "/admin":       "Admin Console",
};

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  // Sync user state with JWT in cookies
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { setUser(null); return; }
    try {
      // Classic CTF hint: Client-side JWT decoding via atob
      const payload = JSON.parse(atob(match[1].split(".")[1]));
      setUser(payload);
    } catch {
      setUser(null);
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
      {/* ─── Left Sidebar ───────────────────────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex flex-col"
        style={{ width: 240, background: "var(--cc-navy)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-black text-base flex-shrink-0"
            style={{ background: "var(--cc-orange)", color: "#fff" }}
          >
            C
          </div>
          <div>
            <div className="font-black text-white text-sm leading-tight tracking-tight">CampusCare</div>
            <div className="text-[10px] font-semibold leading-tight" style={{ color: "var(--cc-orange)" }}>by Entab</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group"
                style={{
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--cc-orange)" : "3px solid transparent",
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0 transition-colors"
                  style={{ color: isActive ? "var(--cc-orange)" : "rgba(255,255,255,0.5)" }}
                />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all mt-2"
              style={{
                color: pathname === "/admin" ? "#fca5a5" : "rgba(252,165,165,0.7)",
                background: pathname === "/admin" ? "rgba(220,38,38,0.15)" : "transparent",
                borderLeft: pathname === "/admin" ? "3px solid #dc2626" : "3px solid transparent",
              }}
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0" style={{ color: "#fca5a5" }} />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t p-3 space-y-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                style={{ background: "var(--cc-orange)", color: "#fff" }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-bold truncate">{user.username}</div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                  style={{
                    background: user.role === "admin" ? "rgba(220,38,38,0.2)" : "rgba(245,130,10,0.2)",
                    color:      user.role === "admin" ? "#fca5a5" : "var(--cc-orange)",
                  }}
                >
                  {user.role}
                </div>
              </div>
              <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-70 transition-opacity" style={{ color: "#fff" }} />
            </Link>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ color: "rgba(255,255,255,0.5)", background: "transparent" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.15)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* ─── Top Header Bar ─────────────────────────────────────────────── */}
      <header
        className="fixed top-0 right-0 z-30 flex items-center justify-between px-6"
        style={{
          left: 240,
          height: 56,
          background: "#fff",
          borderBottom: "1px solid var(--cc-border)",
        }}
      >
        <h2 className="font-bold text-base" style={{ color: "var(--cc-navy)" }}>
          {pageTitle}
        </h2>
        <div className="flex items-center gap-4">
          <GraduationCap className="w-4 h-4" style={{ color: "var(--cc-text-muted)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--cc-text-muted)" }}>
            Greenfield International School
          </span>
          <Bell className="w-4 h-4" style={{ color: "var(--cc-text-muted)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--cc-text-muted)" }}>
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </header>
    </>
  );
}