"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Flag, Trophy, Activity, CheckCircle2, XCircle, Zap, Clock } from "lucide-react";

interface Submission { flag_name: string; correct: number; points: number; submitted_at: string; }
interface Result { correct: boolean; message: string; points?: number; bonus?: number; total?: number; first_blood?: boolean; difficulty?: string; flag_name?: string; alreadyScored?: boolean; }

const DIFFICULTY_META: Record<string, { color: string; border: string; bg: string; pts: number; label: string }> = {
  easy:   { color:"#16a34a", border:"rgba(22,163,74,0.3)",   bg:"rgba(22,163,74,0.07)",   pts:50,  label:"Easy"   },
  medium: { color:"#d97706", border:"rgba(202,138,4,0.3)",   bg:"rgba(202,138,4,0.07)",   pts:100, label:"Medium" },
  hard:   { color:"#dc2626", border:"rgba(220,38,38,0.3)",   bg:"rgba(220,38,38,0.07)",   pts:150, label:"Hard"   },
  bonus:  { color:"#1a3c6e", border:"rgba(26,60,110,0.3)",   bg:"rgba(26,60,110,0.07)",   pts:75,  label:"Bonus"  },
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
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:860 }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,var(--cc-navy) 0%,#2d5f8a 100%)", borderRadius:12, padding:"22px 28px", marginBottom:22, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14 }}>
            <div>
              <h1 style={{ fontSize:20, fontWeight:900, color:"#fff", margin:"0 0 4px", display:"flex", alignItems:"center", gap:8 }}>
                <Flag style={{ width:20, height:20, color:"var(--cc-orange)" }} /> Submit Flag
              </h1>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.65)", margin:0 }}>Enter your captured flag to claim points</p>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              {[
                { icon:Trophy,   val:totalPts,                   label:"Points",   color:"var(--cc-orange)" },
                { icon:Activity, val:`${correct.length}/${totalFlags}`, label:"Captured", color:"#4ade80"          },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"10px 18px", textAlign:"center", minWidth:80 }}>
                    <div style={{ fontSize:18, fontWeight:900, color:stat.color, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                      <Icon style={{ width:14, height:14 }} /> {stat.val}
                    </div>
                    <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:1, marginTop:2 }}>{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty Reference Strip */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
            {Object.entries(DIFFICULTY_META).map(([diff, meta]) => {
              const solved = correct.find(s => s.flag_name?.toLowerCase().includes(diff));
              return (
                <div key={diff} style={{ borderRadius:10, border:`1.5px solid ${meta.border}`, padding:"14px 16px", background: solved?meta.bg:"#fff", opacity: solved?1:0.55, position:"relative", overflow:"hidden", transition:"opacity 0.3s" }}>
                  <div style={{ fontSize:10, fontWeight:800, color:meta.color, textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>{meta.label}</div>
                  <div style={{ fontSize:20, fontWeight:900, color:"var(--cc-navy)", lineHeight:1 }}>{meta.pts} <span style={{ fontSize:10, fontWeight:600, color:"var(--cc-text-muted)" }}>pts</span></div>
                  {solved && <CheckCircle2 style={{ position:"absolute", bottom:8, right:8, width:18, height:18, color:meta.color, opacity:0.6 }} />}
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", padding:24, marginBottom:20, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", gap:12 }}>
              <input
                type="text"
                value={flag}
                onChange={e => setFlag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="BREACH{...}"
                style={{ flex:1, border:"2px solid var(--cc-border)", borderRadius:8, padding:"12px 16px", fontFamily:"'DM Mono',monospace", fontSize:14, color:"var(--cc-orange)", outline:"none", background:"#fafafa", transition:"border-color 0.2s", boxSizing:"border-box" }}
                onFocus={e=>(e.target.style.borderColor="var(--cc-orange)")}
                onBlur={e=>(e.target.style.borderColor="var(--cc-border)")}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !flag.trim()}
                style={{ padding:"12px 28px", background: loading||!flag.trim() ? "#d1d5db" : "var(--cc-orange)", color:"#fff", border:"none", borderRadius:8, fontWeight:900, fontSize:14, cursor: loading||!flag.trim()?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6, transition:"background 0.2s", whiteSpace:"nowrap" }}
              >
                {loading ? <><Zap style={{ width:16, height:16, animation:"spin 0.5s linear infinite" }} /> Checking…</> : <><Zap style={{ width:16, height:16 }} /> Submit Flag</>}
              </button>
            </div>

            {/* Result Banner */}
            {result && (
              <div style={{ marginTop:16, padding:"14px 18px", borderRadius:8, border:"1.5px solid", background: result.correct?"rgba(22,163,74,0.06)":"rgba(220,38,38,0.06)", borderColor: result.correct?"rgba(22,163,74,0.25)":"rgba(220,38,38,0.25)" }}>
                {result.first_blood && (
                  <div style={{ fontSize:12, fontWeight:900, color:"#dc2626", marginBottom:6 }}>🩸 FIRST BLOOD RECORDED</div>
                )}
                <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:800, color: result.correct?"#16a34a":"#dc2626", fontSize:14 }}>
                  {result.correct ? <CheckCircle2 style={{ width:18, height:18 }} /> : <XCircle style={{ width:18, height:18 }} />}
                  {result.message}
                </div>
                {result.correct && !result.alreadyScored && (
                  <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid rgba(0,0,0,0.06)", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", fontSize:10, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1 }}>
                    <span>{result.flag_name}</span>
                    <span style={{ textAlign:"center" }}>{result.difficulty}</span>
                    <span style={{ textAlign:"right", color:"var(--cc-orange)", fontWeight:800 }}>+{result.points} pts</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History Table */}
          <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--cc-border)", fontSize:10, fontWeight:800, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2 }}>
              Submission History
            </div>
            {subLoading ? (
              <div style={{ height:80, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Activity style={{ width:20, height:20, color:"var(--cc-border)", animation:"pulse 1s ease-in-out infinite" }} />
              </div>
            ) : subs.length > 0 ? (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"var(--cc-navy)" }}>
                    {["Flag Name","Status","Points","Time"].map(h=>(
                      <th key={h} style={{ padding:"9px 18px", fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.8)", textTransform:"uppercase", letterSpacing:1, textAlign:"left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s, i) => (
                    <tr key={i} style={{ background:i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid var(--cc-border)" }}>
                      <td style={{ padding:"11px 18px", fontSize:12, fontFamily:"'DM Mono',monospace", color:"var(--cc-navy)" }}>{s.flag_name || "???"}</td>
                      <td style={{ padding:"11px 18px" }}>
                        {s.correct
                          ? <span className="badge badge-green">CORRECT</span>
                          : <span className="badge badge-red">FAILED</span>
                        }
                      </td>
                      <td style={{ padding:"11px 18px", fontSize:13, fontWeight:800, color: s.correct?"var(--cc-orange)":"var(--cc-text-muted)" }}>{s.correct ? `+${s.points}` : "0"}</td>
                      <td style={{ padding:"11px 18px", fontSize:11, fontFamily:"'DM Mono',monospace", color:"var(--cc-text-muted)", display:"flex", alignItems:"center", gap:4 }}>
                        <Clock style={{ width:11, height:11 }} /> {new Date(s.submitted_at).toLocaleTimeString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding:"40px 0", textAlign:"center", color:"var(--cc-text-muted)", fontSize:13 }}>
                <Flag style={{ width:28, height:28, margin:"0 auto 10px", opacity:0.25 }} />
                <p style={{ margin:0 }}>No submissions yet.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}