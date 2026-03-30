"use client";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";

interface Score { username: string; total_points: number; flags_captured: number; total_attempts: number; last_submission: string; }
interface FirstBlood { flag_name: string; username: string; solved_at: string; }

export default function LeaderboardPage() {
  const [scores, setScores]           = useState<Score[]>([]);
  const [bloods, setBloods]           = useState<FirstBlood[]>([]);
  const [totalFlags, setTotalFlags]   = useState(0);
  const [me, setMe]                   = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading]         = useState(true);

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
    if (match) { try { setMe(JSON.parse(atob(match[1].split(".")[1])).username); } catch {} }
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const top3 = scores.slice(0, 3);
  const rest = scores.slice(3);

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ["70px", "100px", "50px"];
  const podiumIcons   = ["🥈", "🥇", "🥉"];
  const podiumColors  = ["var(--muted)", "var(--yellow)", "var(--accent-dim)"];

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 4, letterSpacing: -0.5 }}>
              Leaderboard
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Breach@trix — Live Scoreboard
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <button onClick={load} className="secondary" style={{ fontSize: 12, padding: "6px 14px", marginBottom: 6, display: "block", marginLeft: "auto" }}>
              ↻ Refresh
            </button>
            {lastUpdated && (
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              Auto-refresh every 15s
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 56, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, opacity: 0.5 - i * 0.1 }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && scores.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", border: "1px dashed var(--border)", borderRadius: 8, color: "var(--muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🏆</div>
            <div style={{ fontSize: 16, marginBottom: 6, color: "var(--text)" }}>No scores yet</div>
            <div style={{ fontSize: 13 }}>Be the first to capture a flag!</div>
          </div>
        )}

        {/* Podium */}
        {!loading && scores.length >= 2 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
              Top Competitors
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "end" }}>
              {podiumOrder.map((s, i) => s && (
                <div key={s.username} style={{
                  background: "var(--surface)",
                  border: `1px solid ${i === 1 ? "rgba(234,179,8,0.3)" : "var(--border)"}`,
                  borderRadius: 8,
                  paddingTop: podiumHeights[i],
                  padding: `${podiumHeights[i]} 16px 18px`,
                  textAlign: "center",
                  position: "relative",
                  transition: "border-color 0.2s",
                }}>
                  {s.username === me && (
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      fontSize: 10, color: "var(--accent)",
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      borderRadius: 3, padding: "1px 6px",
                    }}>you</div>
                  )}
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{podiumIcons[i]}</div>
                  <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 4 }}>{s.username}</div>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: podiumColors[i], marginBottom: 4 }}>
                    {s.total_points}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {s.flags_captured}/{totalFlags} flags
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full table */}
        {!loading && scores.length > 0 && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, overflow: "hidden", marginBottom: 20,
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "52px 1fr 100px 80px 80px 140px",
              padding: "9px 18px", borderBottom: "1px solid var(--border)",
              fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              <span>Rank</span><span>User</span><span>Score</span>
              <span>Flags</span><span>Tries</span><span>Last Active</span>
            </div>
            {scores.map((s, i) => (
              <div key={s.username} style={{
                display: "grid", gridTemplateColumns: "52px 1fr 100px 80px 80px 140px",
                padding: "12px 18px",
                borderBottom: i < scores.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                background: s.username === me ? "rgba(34,197,94,0.03)" : "transparent",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => { if (s.username !== me) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = s.username === me ? "rgba(34,197,94,0.03)" : "transparent"; }}
              >
                <span style={{
                  fontWeight: "bold", fontFamily: "monospace",
                  color: i === 0 ? "var(--yellow)" : i === 1 ? "var(--muted)" : i === 2 ? "#cd7f32" : "var(--muted)",
                  fontSize: i < 3 ? 16 : 13,
                }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <span style={{ fontSize: 14 }}>
                  {s.username}
                  {s.username === me && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: "var(--accent)" }}>(you)</span>
                  )}
                </span>
                <span style={{ fontSize: 15, fontWeight: "bold", color: "var(--accent)" }}>{s.total_points}</span>
                <span style={{ fontSize: 13 }}>
                  <span style={{ color: "var(--accent)" }}>{s.flags_captured}</span>
                  <span style={{ color: "var(--muted)" }}>/{totalFlags}</span>
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{s.total_attempts}</span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                  {new Date(s.last_submission).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* First bloods */}
        {!loading && bloods.length > 0 && (
          <div style={{
            background: "var(--surface)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 8, overflow: "hidden",
          }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--red)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              🩸 First Bloods
            </div>
            {bloods.map(b => (
              <div key={b.flag_name} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 140px",
                padding: "10px 18px",
                borderBottom: "1px solid var(--border)",
                alignItems: "center", fontSize: 13,
              }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>{b.flag_name}</span>
                <span style={{ color: "#fca5a5" }}>🩸 {b.username}</span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                  {new Date(b.solved_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}