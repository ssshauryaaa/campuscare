"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// VULNERABILITY: Login → POST /api/auth/login
// SQL built as: WHERE username = '${username}' AND password = '${password}'
// Bypass: username = admin'--   (any password)

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

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      router.push("/dashboard");
    } else {
      // VULNERABILITY: Raw SQL error + query leaked here
      setError(data.error + (data.query ? `\n\n[SYSTEM_LOG]: Executed query:\n${data.query}` : ""));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-white font-bold tracking-tighter flex items-center gap-2">
          <span className="text-lg">🏫</span> CampusCare
        </Link>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
          Greenfield International
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div 
          className={`w-full max-w-[420px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {/* Portal Tag */}
          <div className="mb-8 text-center">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">
              Student & Staff Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-4 tracking-tight">Sign in</h1>
            <p className="text-slate-500 text-sm mt-2">Authorized access only.</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            <div className="space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. admin"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-cyan-50 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between mb-2 px-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <button 
                    onClick={() => setShowPass(!showPass)}
                    className="text-[10px] font-mono text-slate-600 hover:text-cyan-400 uppercase tracking-tighter transition-colors"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              {/* Error Box (The CTF Clue) */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 overflow-hidden">
                  <div className="flex gap-2 items-start text-red-400 font-mono text-[11px] leading-relaxed">
                    <span className="mt-1">✖</span>
                    <pre className="whitespace-pre-wrap break-all">{error}</pre>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] text-sm uppercase tracking-widest shadow-lg shadow-cyan-500/20"
              >
                {loading ? "Authenticating..." : "Login →"}
              </button>
            </div>
          </div>

          {/* Secondary Links */}
          <div className="mt-6 flex justify-between text-[12px] text-slate-500 px-2">
            <span>New here? <Link href="/register" className="text-cyan-500 hover:underline">Register</Link></span>
            <span className="cursor-help hover:text-slate-300">Forgot Password?</span>
          </div>

          {/* Dev Mode Footer (Intentional Misconfiguration) */}
          <div className="mt-12 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-start gap-3">
            <span className="text-yellow-500 text-xs mt-0.5">⚠️</span>
            <div>
              <p className="text-[11px] font-mono text-yellow-500/70 leading-normal">
                <strong className="text-yellow-500">DEV MODE ACTIVE:</strong> Enhanced error reporting enabled. 
                Sensitive system info exposed at <Link href="/api/config" className="underline decoration-yellow-500/30">/api/config</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* System Footer */}
      <footer className="border-t border-white/10 px-8 py-3 flex justify-between text-[10px] text-slate-600 font-mono tracking-tighter">
        <span>CAMPUSCARE_KERN_v2.3.1</span>
        <span>ENV: <span className="text-yellow-600/80">development_node_01</span></span>
      </footer>
    </div>
  );
}