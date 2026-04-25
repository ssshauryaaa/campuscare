"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Trophy, Flame, Swords, Timer, RefreshCw, Target } from "lucide-react";

interface Score { username: string; total_points: number; flags_captured: number; total_attempts: number; last_submission: string; }
interface FirstBlood { flag_name: string; username: string; solved_at: string; }

const MEDAL = ["🥈","👑","🥉"];
const MEDAL_COLOR = ["#9ca3af","#f59e0b","#b45309"];

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
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:960 }}>

          {/* Header Banner */}
          <div style={{ background:"linear-gradient(135deg,var(--cc-navy) 0%,#2d5f8a 100%)", borderRadius:12, padding:"22px 28px", marginBottom:22, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", margin:"0 0 4px", display:"flex", alignItems:"center", gap:10 }}>
                <Trophy style={{ width:22, height:22, color:"var(--cc-orange)" }} />
                Breach@trix Live Scoreboard
              </h1>
              <p style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"rgba(255,255,255,0.6)", margin:0, textTransform:"uppercase", letterSpacing:2 }}>
                Auto-refreshing every 15 seconds
              </p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:9, fontWeight:700, color:"var(--cc-orange)", textTransform:"uppercase", letterSpacing:2, marginBottom:2 }}>
                  <Timer style={{ width:10, height:10, display:"inline-block", verticalAlign:"middle", marginRight:4 }} />Last Sync
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#fff", fontWeight:700 }}>
                  {lastUpdated ? lastUpdated.toLocaleTimeString("en-IN") : "--:--:--"}
                </div>
              </div>
              <button onClick={load} style={{ padding:10, borderRadius:8, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.2s" }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.2)"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.1)"}>
                <RefreshCw style={{ width:18, height:18, color:"#fff", animation: loading?"spin 1s linear infinite":"none" }} />
              </button>
            </div>
          </div>

          {/* Podium */}
          {!loading && scores.length >= 1 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1.3fr 1fr", gap:12, maxWidth:600, margin:"0 auto 24px", alignItems:"flex-end" }}>
              {podiumOrder.map((s, i) => {
                const isFirst = s?.username === scores[0]?.username;
                const isMe = s?.username === me;
                const heights = [140, 180, 110];
                return (
                  <div key={s.username} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>{MEDAL[i]}</div>
                    <div style={{ width:"100%", height:heights[i], background:"#fff", borderRadius:"10px 10px 0 0", border:"1px solid var(--cc-border)", borderTop:`4px solid ${MEDAL_COLOR[i]}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px 8px", boxShadow: isFirst?"0 4px 20px rgba(245,130,10,0.2)":"0 2px 8px rgba(0,0,0,0.05)" }}>
                      <span style={{ fontWeight:800, color:"var(--cc-navy)", fontSize:14, textAlign:"center", wordBreak:"break-word" }}>{s.username}</span>
                      <span style={{ fontSize:22, fontWeight:900, fontFamily:"'DM Mono',monospace", color:"var(--cc-orange)", lineHeight:1.2 }}>{s.total_points}</span>
                      <div style={{ fontSize:10, color:"var(--cc-text-muted)", fontWeight:600 }}>{s.flags_captured} flags</div>
                      {isMe && <div style={{ marginTop:4, fontSize:9, fontWeight:800, background:"var(--cc-orange)", color:"#fff", padding:"1px 8px", borderRadius:20 }}>YOU</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Main Table */}
          <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden", marginBottom:20 }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--cc-navy)" }}>
                  {["Rank","Participant","Flags Captured","Total Points","Last Submission"].map(h=>(
                    <th key={h} style={{ padding:"10px 18px", fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.85)", textTransform:"uppercase", letterSpacing:1, textAlign:"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={s.username} style={{ background: s.username===me ? "rgba(245,130,10,0.06)" : i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid var(--cc-border)", transition:"background 0.15s" }}
                    onMouseEnter={e=>{ if(s.username!==me)(e.currentTarget as HTMLElement).style.background="#f0f4ff" }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background = s.username===me?"rgba(245,130,10,0.06)":i%2===0?"#fff":"#f8f9fa" }}>
                    <td style={{ padding:"12px 18px", fontFamily:"'DM Mono',monospace", fontWeight:700, color: i<3?"var(--cc-orange)":"var(--cc-text-muted)", fontSize:13 }}>
                      {i<3 ? ["🥈","👑","🥉"][i] : null} {String(i+1).padStart(2,"0")}
                    </td>
                    <td style={{ padding:"12px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background: s.username===me?"var(--cc-orange)":"var(--cc-border)", display:"inline-block", flexShrink:0 }}/>
                        <span style={{ fontSize:13, fontWeight:700, color:"var(--cc-navy)" }}>{s.username}</span>
                        {s.username===me && <span style={{ fontSize:9, fontWeight:800, background:"var(--cc-orange)", color:"#fff", padding:"1px 6px", borderRadius:20 }}>YOU</span>}
                      </div>
                    </td>
                    <td style={{ padding:"12px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:60, height:6, background:"#e5e7eb", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", background:"var(--cc-orange)", width:`${(s.flags_captured/(totalFlags||1))*100}%`, borderRadius:3 }}/>
                        </div>
                        <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", fontWeight:600 }}>{s.flags_captured}/{totalFlags}</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <Target style={{ width:12, height:12, color:"var(--cc-text-muted)" }} />
                        <span style={{ fontSize:14, fontWeight:900, color:"var(--cc-orange)", fontFamily:"'DM Mono',monospace" }}>{s.total_points}</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 18px", fontSize:11, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)" }}>
                      {new Date(s.last_submission).toLocaleTimeString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* First Blood */}
          {bloods.length > 0 && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", borderLeft:"4px solid var(--cc-orange)", padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize:11, fontWeight:800, color:"var(--cc-orange)", textTransform:"uppercase", letterSpacing:2, margin:"0 0 16px", display:"flex", alignItems:"center", gap:6 }}>
                <Swords style={{ width:14, height:14 }} /> ⚔ First Blood
              </h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
                {bloods.map(b => (
                  <div key={b.flag_name} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, background:"rgba(245,130,10,0.05)", border:"1px solid rgba(245,130,10,0.15)", transition:"border-color 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="var(--cc-orange)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor="rgba(245,130,10,0.15)"}>
                    <div style={{ padding:6, background:"rgba(245,130,10,0.1)", borderRadius:6 }}>
                      <Flame style={{ width:14, height:14, color:"var(--cc-orange)" }} />
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.flag_name}</div>
                      <div style={{ fontSize:12, fontWeight:800, color:"var(--cc-navy)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}