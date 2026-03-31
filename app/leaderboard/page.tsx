"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Trophy, Flame, Swords, Timer, RefreshCw, Award, Target, Skull } from "lucide-react";

interface Score { username: string; total_points: number; flags_captured: number; total_attempts: number; last_submission: string; }
interface FirstBlood { flag_name: string; username: string; solved_at: string; }

export default function LeaderboardPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [bloods, setBloods] = useState<FirstBlood[]>([]);
  const [totalFlags, setTotalFlags] = useState(0);
  const [me, setMe] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => {
        setScores(d.scores || []);
        setBloods(d.firstBloods || []);
        setTotalFlags(d.totalFlags || 0);
        setLastUpdated(new Date());
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) { 
      try { 
        const payload = JSON.parse(atob(match[1].split(".")[1]));
        setMe(payload.username); 
      } catch {} 
    }
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const top3 = scores.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-400 selection:bg-yellow-500/30">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
              <Swords className="text-yellow-500 w-10 h-10" /> HALL_OF_FAME
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">
              Live Scoreboard <span className="text-zinc-700 mx-2">|</span> Syncing Node_01
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex items-center gap-6">
            <div className="text-right">
               <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                 <Timer className="w-3 h-3" /> Auto-Refresh
               </div>
               <div className="text-white font-mono text-sm">
                 {lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--:--"}
               </div>
            </div>
            <button 
              onClick={load}
              className="p-3 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-all active:scale-95 group"
            >
              <RefreshCw className={`w-5 h-5 text-zinc-400 group-hover:text-yellow-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Podium Section */}
        {!loading && scores.length >= 1 && (
          <section className="grid grid-cols-3 gap-4 items-end max-w-3xl mx-auto pt-12 pb-4">
            {podiumOrder.map((s, i) => {
              const isFirst = s?.username === scores[0]?.username;
              const isMe = s?.username === me;
              
              return (
                <div key={s.username} className="flex flex-col items-center group relative">
                  {/* Avatar / Rank Icon */}
                  <div className={`mb-4 p-1 rounded-full border-2 transition-transform duration-500 group-hover:-translate-y-2 ${isFirst ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-zinc-700'}`}>
                    <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center text-2xl">
                      {isFirst ? "👑" : i === 0 ? "🥈" : "🥉"}
                    </div>
                  </div>

                  {/* Podium Base */}
                  <div className={`w-full rounded-t-2xl flex flex-col items-center p-6 border-x border-t transition-all ${
                    isFirst 
                      ? 'h-48 bg-gradient-to-b from-yellow-500/20 to-transparent border-yellow-500/30' 
                      : i === 0 ? 'h-36 bg-zinc-900/80 border-zinc-700' : 'h-28 bg-zinc-900/40 border-zinc-800'
                  }`}>
                    <span className={`font-black tracking-tight text-lg truncate w-full text-center ${isFirst ? 'text-white' : 'text-zinc-400'}`}>
                      {s.username}
                    </span>
                    <span className={`text-2xl font-black font-mono ${isFirst ? 'text-yellow-500' : 'text-zinc-500'}`}>
                      {s.total_points}
                    </span>
                    <div className="mt-2 text-[10px] uppercase font-bold tracking-widest text-zinc-600">
                      {s.flags_captured} Flags
                    </div>
                    {isMe && <div className="mt-auto px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] rounded-full font-bold">YOU</div>}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Main Leaderboard Table */}
        <section className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="grid grid-cols-6 px-8 py-4 bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5">
            <span className="col-span-1">Rank</span>
            <span className="col-span-2">Operative</span>
            <span>Efficiency</span>
            <span>Score</span>
            <span className="text-right">Last Signal</span>
          </div>

          <div className="divide-y divide-white/5">
            {scores.map((s, i) => (
              <div 
                key={s.username} 
                className={`grid grid-cols-6 px-8 py-5 items-center transition-colors group ${s.username === me ? 'bg-emerald-500/[0.03]' : 'hover:bg-white/[0.02]'}`}
              >
                <div className="col-span-1 font-mono font-bold flex items-center gap-3">
                  <span className={i < 3 ? 'text-yellow-500' : 'text-zinc-700'}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {i < 3 && <Trophy className="w-3 h-3 text-yellow-500/50" />}
                </div>

                <div className="col-span-2 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.username === me ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`} />
                  <span className={`font-bold ${s.username === me ? 'text-white' : 'text-zinc-300'}`}>
                    {s.username}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden max-w-[60px]">
                    <div 
                      className="h-full bg-emerald-500/50" 
                      style={{ width: `${(s.flags_captured / (totalFlags || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono">{s.flags_captured}/{totalFlags}</span>
                </div>

                <div className="font-black text-white font-mono flex items-center gap-1">
                  <Target className="w-3 h-3 text-zinc-600" /> {s.total_points}
                </div>

                <div className="text-right font-mono text-[10px] text-zinc-600">
                  {new Date(s.last_submission).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* First Blood Ticker */}
        {bloods.length > 0 && (
          <section className="bg-rose-500/5 border border-rose-500/20 rounded-2xl overflow-hidden p-6">
            <h3 className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
               <Skull className="w-4 h-4" /> First Blood Archives
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bloods.map(b => (
                <div key={b.flag_name} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-rose-500/10 hover:border-rose-500/30 transition-all group">
                  <div className="p-2 bg-rose-500/10 rounded-lg group-hover:scale-110 transition-transform">
                    <Flame className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-zinc-600 font-mono truncate">{b.flag_name}</div>
                    <div className="text-xs font-bold text-rose-200 truncate">{b.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}