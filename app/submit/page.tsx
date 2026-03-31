"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Flag, Trophy, Activity, CheckCircle2, XCircle, Zap, Clock, History } from "lucide-react";

interface Submission { flag_name: string; correct: number; points: number; submitted_at: string; }
interface Result { correct: boolean; message: string; points?: number; bonus?: number; total?: number; first_blood?: boolean; difficulty?: string; flag_name?: string; alreadyScored?: boolean; }

const DIFFICULTY_META: Record<string, { color: string; border: string; bg: string; pts: number }> = {
  easy:   { color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5", pts: 50 },
  medium: { color: "text-yellow-400",  border: "border-yellow-500/30",  bg: "bg-yellow-500/5",  pts: 100 },
  hard:   { color: "text-rose-400",    border: "border-rose-500/30",    bg: "bg-rose-500/5",    pts: 150 },
  bonus:  { color: "text-blue-400",    border: "border-blue-500/30",    bg: "bg-blue-500/5",    pts: 75 },
};

export default function SubmitPage() {
  const router = useRouter();
  const [flag, setFlag] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [subLoading, setSubLoad] = useState(true);

  const loadSubs = useCallback(() => {
    fetch("/api/submit").then(r => r.json()).then(d => { 
      setSubs(d.submissions || []); 
      setSubLoad(false); 
    });
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    loadSubs();
  }, [router, loadSubs]);

  const handleSubmit = async () => {
    if (!flag.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag: flag.trim() }),
    });
    const data = await res.json();
    setResult(data);
    if (data.correct) setFlag("");
    setLoading(false);
    loadSubs();
  };

  const correct = subs.filter(s => s.correct);
  const totalPts = correct.reduce((a, b) => a + b.points, 0);
  const totalFlags = 4;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-emerald-500/30">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              <Flag className="w-8 h-8 text-emerald-500" /> SUBMIT_FLAG
            </h1>
            <p className="text-zinc-500 text-sm">
              Standard format: <code className="text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">BREACH&#123;...&#125;</code>
            </p>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="flex gap-4">
            {[
              { icon: Trophy, val: totalPts, label: "Points", color: "text-yellow-500" },
              { icon: Activity, val: `${correct.length}/${totalFlags}`, label: "Captured", color: "text-emerald-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-xl px-5 py-3 min-w-[120px] text-center">
                <div className={`text-xl font-black ${stat.color} flex items-center justify-center gap-2`}>
                   <stat.icon className="w-4 h-4" /> {stat.val}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Challenge Map / Difficulty Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(DIFFICULTY_META).map(([diff, meta]) => {
            const solved = correct.find(s => s.flag_name?.toLowerCase().includes(diff));
            return (
              <div key={diff} className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${solved ? `${meta.bg} ${meta.border}` : 'bg-zinc-900/20 border-white/5 opacity-40'}`}>
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${meta.color}`}>
                  {diff}
                </div>
                <div className="text-xl font-bold text-white leading-tight">{meta.pts} <span className="text-[10px] text-zinc-500">PTS</span></div>
                {solved && <CheckCircle2 className={`absolute bottom-2 right-2 w-5 h-5 ${meta.color} opacity-50`} />}
              </div>
            );
          })}
        </div>

        {/* Input Interface */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Decorative background pulse */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32 rounded-full transition-opacity group-focus-within:opacity-100 opacity-50" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={flag}
                  onChange={e => setFlag(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="Paste flag hash here..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-zinc-700"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !flag.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-xl transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 group/btn"
              >
                {loading ? <Zap className="w-5 h-5 animate-spin" /> : <>EXECUTE <Zap className="w-4 h-4 group-hover/btn:fill-current" /></>}
              </button>
            </div>

            {/* Response Banner */}
            {result && (
              <div className={`p-5 rounded-xl border animate-in slide-in-from-top-2 duration-300 ${result.correct ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                {result.first_blood && (
                  <div className="text-rose-500 font-black text-sm mb-2 flex items-center gap-2 tracking-tighter">
                    🩸 FIRST BLOOD RECORDED
                  </div>
                )}
                <div className={`flex items-center gap-3 font-bold ${result.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {result.message}
                </div>
                {result.correct && !result.alreadyScored && (
                  <div className="mt-2 grid grid-cols-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-2">
                    <span>{result.flag_name}</span>
                    <span className="text-center">{result.difficulty}</span>
                    <span className="text-right text-emerald-500">+{result.points} PTS</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <History className="w-4 h-4" /> RECENT_TRANSMISSIONS
          </h3>
          
          <div className="bg-zinc-900/20 border border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
            {subLoading ? (
               <div className="h-32 flex items-center justify-center"><Activity className="w-6 h-6 text-zinc-800 animate-pulse" /></div>
            ) : subs.length > 0 ? (
              <div className="divide-y divide-white/5">
                {subs.map((s, i) => (
                  <div key={i} className="grid grid-cols-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
                    <div className="font-mono text-xs text-zinc-400 truncate pr-4">{s.flag_name || "???"}</div>
                    <div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${s.correct ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                        {s.correct ? "SUCCESS" : "REJECTED"}
                      </span>
                    </div>
                    <div className={`font-black text-sm ${s.correct ? 'text-emerald-500' : 'text-zinc-700'}`}>
                      {s.correct ? `+${s.points}` : '0'}
                    </div>
                    <div className="text-right text-[10px] text-zinc-600 font-mono flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> {new Date(s.submitted_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-600">
                <Flag className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm italic">No data found in transmission history.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}