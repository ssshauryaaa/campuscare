"use client";

/**
 * VULNERABILITY CONTEXT:
 * Login → POST /api/auth/login
 * SQL: WHERE username = '${username}' AND password = '${password}'
 * Bypass: admin'-- 
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) router.push("/dashboard");
  }, [router]);

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        // VULNERABILITY: Verbose error reporting leaks SQL query
        const errorMessage = data.error + (data.query ? `\n\n[Query Leaked]:\n${data.query}` : "");
        setError(errorMessage);
      }
    } catch (err) {
      setError("Connection failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="text-emerald-500 font-bold tracking-tight text-lg flex items-center gap-2">
          <span className="text-2xl">🏫</span> CampusCare
        </Link>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
          Greenfield International School
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex items-center justify-center p-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-full max-w-[400px]">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-4">
              Authorized Personnel Only
            </span>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Please enter your credentials to continue.</p>
          </div>

          {/* Form Card */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
            <div className="space-y-6">
              
              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="admin"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm font-mono focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <button 
                    onClick={() => setShowPass(!showPass)}
                    className="text-[10px] font-mono text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-wider"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm font-mono focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-red-400 text-[12px] leading-relaxed font-mono whitespace-pre-wrap break-all">
                    <span className="font-bold">Error:</span> {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900/50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-lg text-sm transition-all transform active:scale-[0.98]"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>New student? <Link href="/register" className="text-emerald-500 hover:underline">Create account</Link></span>
              <span className="hover:text-gray-300 cursor-help">Help & Support</span>
            </div>

            {/* VULNERABILITY: Dev Mode Hint */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <p className="text-[10px] font-mono text-amber-500/80 leading-relaxed">
                <span className="font-bold uppercase">⚠ System Message:</span> NODE_ENV=development. System logs and verbose error tracing are currently exposed at <Link href="/api/config" className="underline hover:text-amber-400">/api/config</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-4 flex justify-between items-center text-[10px] text-gray-600 font-mono tracking-tight">
        <div>© 2024 CAMPUSCARE v2.3.1-STABLE</div>
        <div className="flex gap-4">
          <span>STATUS: <span className="text-emerald-500">ONLINE</span></span>
          <span>ENV: <span className="text-amber-500">DEV_MODE</span></span>
        </div>
      </footer>
    </div>
  );
}