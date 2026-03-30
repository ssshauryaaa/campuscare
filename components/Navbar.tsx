"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface User { id: number; username: string; role: string; }

export default function Navbar() {
  const router = useRouter();
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

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-lg group-hover:scale-110 transition-transform">🏫</span>
          <span className="font-bold text-white tracking-tight">
            Campus<span className="text-cyan-400">Care</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
          {user ? (
            <>
              <NavGroup links={[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/notices", label: "Notices" },
                { href: "/search", label: "Students" },
                { href: "/assignments", label: "Assignments" },
                { href: "/submit", label: "Submit Flag" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/jwt-debug", label: "JWT Debug" },
              ]} currentPath={pathname} />

              {user.role === "admin" && (
                <NavLink href="/admin" label="Admin" currentPath={pathname} variant="danger" />
              )}
            </>
          ) : (
            <NavGroup links={[
              { href: "/notices", label: "Notices" },
              { href: "/leaderboard", label: "Leaderboard" },
              { href: "/register", label: "Register" },
            ]} currentPath={pathname} />
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                href={`/profile/${user.id}`}
                className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5 hover:border-cyan-500/50 transition-colors"
              >
                {user.username}
              </Link>
              <button
                onClick={logout}
                className="text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-white/10 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="text-xs font-bold uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 px-4 py-2 rounded-lg transition-all"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/** * Sub-components for cleaner JSX
 */

function NavGroup({ links, currentPath }: { links: { href: string; label: string }[], currentPath: string }) {
  return (
    <div className="flex items-center gap-1">
      {links.map(link => (
        <NavLink key={link.href} {...link} currentPath={currentPath} />
      ))}
    </div>
  );
}

function NavLink({ href, label, currentPath, variant }: { href: string; label: string; currentPath: string; variant?: "danger" }) {
  const isActive = currentPath === href;
  
  const baseStyles = "px-3 py-1.5 text-[13px] font-medium transition-all rounded-md whitespace-nowrap";
  const activeStyles = isActive 
    ? "text-cyan-400 bg-cyan-400/10" 
    : "text-slate-400 hover:text-slate-200 hover:bg-white/5";
  const dangerStyles = variant === "danger" ? "text-red-400 hover:bg-red-500/10" : "";

  return (
    <Link href={href} className={`${baseStyles} ${activeStyles} ${dangerStyles}`}>
      {label}
    </Link>
  );
}