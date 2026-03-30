"use client";

/**
 * VULNERABILITY CONTEXT: 
 * Username enumeration. The live "check-username" endpoint provides 
 * distinct feedback, allowing attackers to map valid users.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Field = "full_name" | "username" | "email" | "password" | "confirm_password" | "class" | "section" | "admission_no";

interface FormState {
  full_name: string; username: string; email: string;
  password: string; confirm_password: string;
  class: string; section: string; admission_no: string;
}

interface FieldError { [k: string]: string }

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    full_name: "", username: "", email: "",
    password: "", confirm_password: "",
    class: "", section: "", admission_no: "",
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [serverError, setServerErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [usernameStatus, setUStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");
  const [usernameTimer, setUTimer] = useState<any>(null);

  const set = (key: Field, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: "" }));
    setServerErr("");
  };

  const onUsernameChange = (val: string) => {
    set("username", val);
    setUStatus("idle");
    if (usernameTimer) clearTimeout(usernameTimer);
    if (val.trim().length < 3) return;

    const t = setTimeout(async () => {
      setUStatus("checking");
      try {
        const res = await fetch("/api/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: val.trim() }),
        });
        const data = await res.json();
        setUStatus(data.available ? "available" : "taken");
      } catch { setUStatus("idle"); }
    }, 600);
    setUTimer(t);
  };

  const validate = (): boolean => {
    const e: FieldError = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required.";
    if (!form.username.trim()) e.username = "Username is required.";
    else if (form.username.length < 3) e.username = "Must be at least 3 characters.";
    else if (usernameStatus === "taken") e.username = "This username is already taken.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Must be at least 6 characters.";
    if (form.password !== form.confirm_password) e.confirm_password = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerErr("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      router.push("/dashboard");
    } else {
      setServerErr(data.error || "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top bar */}
      <header className="border-b border-white/5 bg-[#0f0f0f]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="text-emerald-500 font-black tracking-tighter text-lg">
          🏫 CampusCare
        </Link>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          Greenfield International School
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex justify-center py-12 px-6">
        <div className="w-full max-w-[540px]">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2">Create Identity</h1>
            <p className="text-gray-500 text-sm">Enroll into the Greenfield educational network.</p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => set("full_name", e.target.value)}
                placeholder="Aryan Kumar"
                className={`w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all ${errors.full_name && 'border-red-500/50'}`}
              />
              {errors.full_name && <p className="text-[10px] font-mono text-red-400 mt-2">{errors.full_name}</p>}
            </div>

            {/* Username - THE VULNERABILITY SURFACE */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between">
                Username <span>(Live Sync)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.username}
                  onChange={e => onUsernameChange(e.target.value)}
                  placeholder="aryan.k"
                  className={`w-full bg-black border rounded-lg px-4 py-3 text-sm font-mono outline-none transition-all ${
                    usernameStatus === "taken" ? "border-red-500/50" : 
                    usernameStatus === "available" ? "border-emerald-500/50" : "border-white/10"
                  }`}
                />
              </div>
              <div className="mt-2 min-h-[16px]">
                {usernameStatus === "checking" && <span className="text-[10px] font-mono text-gray-500 animate-pulse italic">Scanning directory...</span>}
                {usernameStatus === "taken" && <span className="text-[10px] font-mono text-red-400">🔴 Error: Identity already indexed in database.</span>}
                {usernameStatus === "available" && <span className="text-[10px] font-mono text-emerald-400">✓ Unique identifier confirmed.</span>}
                {errors.username && <p className="text-[10px] font-mono text-red-400">{errors.username}</p>}
              </div>
            </div>

            {/* Password Cluster */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                  <button onClick={() => setShowPass(!showPass)} className="text-[10px] text-emerald-500 font-mono">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-emerald-500/50 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confirm</label>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={e => set("confirm_password", e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-emerald-500/50 outline-none"
                />
              </div>
            </div>

            {/* Academic Details (Sub-Section) */}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Academic Metadata</p>
              <div className="grid grid-cols-3 gap-3">
                <select 
                  onChange={e => set("class", e.target.value)}
                  className="bg-black border border-white/10 rounded-lg px-3 py-3 text-xs outline-none focus:border-emerald-500/50 appearance-none"
                >
                  <option value="">Class</option>
                  <option>XI</option><option>XII</option>
                </select>
                <select 
                  onChange={e => set("section", e.target.value)}
                  className="bg-black border border-white/10 rounded-lg px-3 py-3 text-xs outline-none focus:border-emerald-500/50 appearance-none"
                >
                  <option value="">Sec</option>
                  <option>A</option><option>B</option>
                </select>
                <input
                  type="text"
                  placeholder="ID Number"
                  onChange={e => set("admission_no", e.target.value)}
                  className="bg-black border border-white/10 rounded-lg px-3 py-3 text-xs outline-none font-mono focus:border-emerald-500/50 col-span-1"
                />
              </div>
            </div>

            {serverError && (
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
                <p className="text-[10px] font-mono text-red-400 tracking-tight">{serverError}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || usernameStatus === "taken"}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl text-sm transition-all transform active:scale-95"
            >
              {loading ? "INITIALIZING ACCOUNT..." : "FINALIZE REGISTRATION →"}
            </button>
          </div>

          {/* Footer Link */}
          <div className="mt-8 flex justify-between items-center text-xs text-gray-500 px-2">
            <p>Already have an ID? <Link href="/login" className="text-emerald-500 hover:underline">Login here</Link></p>
            <span className="font-mono text-[10px] opacity-50">SYS_ADMIN: admin@campuscare.local</span>
          </div>

          {/* Explicit Vulnerability Note */}
          <div className="mt-12 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-20 text-2xl group-hover:rotate-12 transition-transform italic">DEV</div>
            <p className="text-[10px] font-mono text-amber-500/70 leading-relaxed uppercase tracking-tighter">
              <span className="font-black bg-amber-500 text-black px-1 mr-2">SEC_ALERT</span> 
              Development build active. Password encryption (Bcrypt) disabled for debugging. 
              Username enumeration vulnerability present in live-check module.
            </p>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="border-t border-white/5 px-8 py-4 flex justify-between items-center text-[10px] text-gray-600 font-mono">
        <span>CampusCare v2.3.1_STABLE</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          ENVIRONMENT: <span className="text-amber-500">DEVELOPMENT_MODE</span>
        </span>
      </footer>
    </div>
  );
}