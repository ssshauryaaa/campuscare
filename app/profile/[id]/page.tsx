"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  User, Mail, Shield, School, Hash, Key, 
  ChevronLeft, ChevronRight, AlertTriangle, Fingerprint 
} from "lucide-react";

interface Profile {
  id: number; username: string; email: string; full_name: string;
  class: string; section: string; admission_no: string; role: string;
}

const ROLE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  admin: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  staff: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  student: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSession] = useState<number | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    try {
      const payload = JSON.parse(atob(match[1].split(".")[1]));
      setSession(payload.id);
    } catch { router.push("/login"); return; }

    if (!id) return;
    setLoading(true);
    fetch(`/api/profile/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.profile) {
          setProfile(d.profile);
          setError("");
        } else {
          setError(d.error || "User not found");
          setProfile(null);
        }
        setLoading(false);
      });
  }, [id, router]);

  const isOwn = sessionUserId === profile?.id;
  const currentRole = profile?.role || "student";
  const theme = ROLE_CONFIG[currentRole] || ROLE_CONFIG.student;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            <Link href="/search" className="hover:text-emerald-500 transition-colors">Directory</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-300">User_Record_{id}</span>
          </nav>
          
          {!isOwn && profile && (
            <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] font-bold text-rose-500 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> UNAUTHORIZED_VIEW
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-zinc-900 rounded-2xl border border-white/5" />
            <div className="h-64 bg-zinc-900 rounded-2xl border border-white/5" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Null Reference Error</h2>
              <p className="text-zinc-500 text-sm font-mono mt-1">Object ID {id} returned 404.</p>
            </div>
            <p className="text-xs text-zinc-600 italic font-mono">Hint: Try sequential ID enumeration (1-10)...</p>
          </div>
        )}

        {profile && !loading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Card */}
            <div className="relative overflow-hidden bg-zinc-900 border border-white/5 rounded-2xl p-8">
              {/* Grid Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
              
              <div className="relative flex items-center gap-6">
                <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-2xl font-black ${theme.border} ${theme.bg} ${theme.color}`}>
                  {profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-white tracking-tight">{profile.full_name}</h1>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${theme.bg} ${theme.color} ${theme.border}`}>
                      {profile.role}
                    </span>
                  </div>
                  <p className="text-zinc-500 font-mono text-sm">@{profile.username}</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-zinc-800 font-mono leading-none">#{profile.id}</div>
                  <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Record_Index</div>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="grid grid-cols-1 divide-y divide-white/5">
                {[
                  { label: "Email Address", value: profile.email, icon: Mail },
                  { label: "Admission Number", value: profile.admission_no, icon: Fingerprint, mono: true },
                  { label: "Class Designation", value: profile.class || "Not Assigned", icon: School },
                  { label: "Section", value: profile.section || "N/A", icon: Hash },
                  { label: "Security Role", value: profile.role, icon: Shield, color: theme.color },
                ].map((item) => (
                  <div key={item.label} className="grid grid-cols-3 group hover:bg-white/[0.01] transition-colors">
                    <div className="col-span-1 p-4 bg-white/[0.02] border-r border-white/5 flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <item.icon className="w-3.5 h-3.5 opacity-50" />
                      {item.label}
                    </div>
                    <div className={`col-span-2 p-4 text-sm ${item.mono ? 'font-mono' : ''} ${item.color || 'text-zinc-300'}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IDOR Navigation Controls */}
            <div className="flex items-center justify-between pt-4">
              {/* <div className="flex gap-2">
                <Link 
                  href={`/profile/${Math.max(1, Number(id) - 1)}`}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4 text-emerald-500" /> PREV
                </Link>
                <Link 
                  href={`/profile/${Number(id) + 1}`}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95"
                >
                  NEXT <ChevronRight className="w-4 h-4 text-emerald-500" />
                </Link>
              </div> */}
              
              <div className="text-[10px] font-mono text-zinc-600 bg-black px-3 py-1.5 rounded-lg border border-white/5">
                GET /api/profile/<span className="text-emerald-500">{id}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// VULENERABILITY: Insecure Direct Object Reference (IDOR) on /api/profile/[id]


//1. What an attacker does: Log in as student1 (ID 3), then click PREV twice to reach ID 1 — which is the admin account. No tools needed, just clicking arrows. The API /api/profile/[id] never checks whether the requesting user's ID matches the requested ID.
// What they get: Full name, email, role, admission number, class, section of every user including admin and staff.

// 2. Sensitive Data Exposure via Profile Fields
// The API returns and the page renders:

// email — admin's internal email address
// role — confirms who is admin vs student vs staff
// admission_no — a unique identifier useful for social engineering

// For ID 1 specifically, you see admin@campuscare.local + role: admin + ADM001 — enough to target the admin account precisely.



