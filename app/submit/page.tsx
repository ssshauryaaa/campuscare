"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Submission { flag_name: string; correct: number; points: number; submitted_at: string; }
interface Result { correct: boolean; message: string; points?: number; bonus?: number; total?: number; first_blood?: boolean; difficulty?: string; flag_name?: string; alreadyScored?: boolean; }

const DIFFICULTY_META: Record<string, { color: string; bg: string; pts: number }> = {
  easy:   { color: "#4ade80", bg: "rgba(34,197,94,0.08)",   pts: 50  },
  medium: { color: "#fde047", bg: "rgba(234,179,8,0.08)",   pts: 100 },
  hard:   { color: "#fca5a5", bg: "rgba(239,68,68,0.08)",   pts: 150 },
  bonus:  { color: "#93c5fd", bg: "rgba(59,130,246,0.08)",  pts: 75  },
};

export default function SubmitPage() {
  const router  = useRouter();
  const [flag, setFlag]           = useState("");
  const [result, setResult]       = useState<Result | null>(null);
  const [loading, setLoading]     = useState(false);
  const [subs, setSubs]           = useState<Submission[]>([]);
  const [subLoading, setSubLoad]  = useState(true);

  const loadSubs = useCallback(() => {
    fetch("/api/submit").then(r => r.json()).then(d => { setSubs(d.submissions || []); setSubLoad(false); });
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    loadSubs();
  }, []);

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
    setFlag("");
    setLoading(false);
    loadSubs();
  };

  const correct = subs.filter(s => s.correct);
  const totalPts = correct.reduce((a, b) => a + b.points, 0);
  const totalFlags = 4; // easy, medium, hard, bonus

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 4, letterSpacing: -0.5 }}>
            Submit Flag
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Found a flag? Submit it here for points. Format:{" "}
            <span style={{ fontFamily: "monospace", color: "var(--accent)" }}>BREACH&#123;...&#125;</span>
          </p>
        </div>

        {/* Score stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Flags Captured",   value: `${correct.length}/${totalFlags}`, color: "var(--accent)" },
            { label: "Total Points",     value: totalPts,                           color: "var(--yellow)" },
            { label: "Total Attempts",   value: subs.length,                        color: "var(--muted)"  },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "16px 20px", textAlign: "center",
            }}>
              <div style={{ fontSize: 26, fontWeight: "bold", color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Difficulty guide */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20,
        }}>
          {Object.entries(DIFFICULTY_META).map(([diff, meta]) => {
            const solved = correct.find(s => s.flag_name?.includes(diff) ||
              (diff === "easy" && s.points === 50) ||
              (diff === "medium" && s.points >= 100 && s.points < 150) ||
              (diff === "hard" && s.points >= 150) ||
              (diff === "bonus" && s.flag_name === "bonus_env"));
            return (
              <div key={diff} style={{
                background: solved ? meta.bg : "var(--surface)",
                border: `1px solid ${solved ? meta.color.replace(")", ", 0.3)").replace("rgb", "rgba") : "var(--border)"}`,
                borderRadius: 6, padding: "10px 14px",
                opacity: solved ? 1 : 0.6,
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 12, fontWeight: "bold", color: meta.color, marginBottom: 3, textTransform: "capitalize" }}>
                  {solved ? "✓ " : ""}{diff}
                </div>
                <div style={{ fontSize: 13, color: "var(--text)", fontWeight: "bold" }}>{meta.pts} pts</div>
                {solved && <div style={{ fontSize: 10, color: meta.color, marginTop: 2 }}>Captured</div>}
              </div>
            );
          })}
        </div>

        {/* Submit form */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, padding: 24, marginBottom: 20,
        }}>
          <label style={{
            display: "block", fontSize: 11, color: "var(--muted)",
            textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
          }}>Enter Flag</label>

          <div style={{ display: "flex", gap: 10, marginBottom: result ? 14 : 0 }}>
            <input
              type="text"
              value={flag}
              onChange={e => setFlag(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="BREACH{...}"
              autoComplete="off"
              spellCheck={false}
              style={{
                flex: 1, background: "var(--bg)",
                border: `1px solid ${flag.startsWith("BREACH{") ? "rgba(34,197,94,0.4)" : "var(--border)"}`,
                borderRadius: 5, padding: "11px 14px",
                color: "var(--accent)", fontSize: 14,
                fontFamily: "monospace", letterSpacing: 0.5,
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => { if (!flag.startsWith("BREACH{")) e.target.style.borderColor = "var(--border)"; }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !flag.trim()}
              style={{
                background: loading ? "var(--accent-dim)" : "var(--accent)",
                color: "#000", border: "none", borderRadius: 5,
                padding: "11px 22px", fontSize: 14, fontWeight: "bold",
                fontFamily: "monospace", cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", transition: "background 0.2s",
              }}
            >
              {loading ? "Checking..." : "Submit →"}
            </button>
          </div>

          {/* Result banner */}
          {result && (
            <div style={{
              padding: "14px 16px", borderRadius: 6,
              background: result.correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: result.correct ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.25)",
            }}>
              {result.first_blood && (
                <div style={{ fontSize: 18, marginBottom: 6 }}>🩸 FIRST BLOOD!</div>
              )}
              <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: result.correct && !result.alreadyScored ? 8 : 0, color: result.correct ? "var(--accent)" : "#fca5a5" }}>
                {result.correct ? "✓" : "✗"} {result.message}
              </div>
              {result.correct && !result.alreadyScored && (
                <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>
                  {result.flag_name} · {result.difficulty} · +{result.points} pts
                  {result.bonus ? ` + ${result.bonus} first blood bonus` : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submission history */}
        {subLoading && (
          <div style={{ height: 80, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, opacity: 0.4 }} />
        )}
        {!subLoading && subs.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Submission History — {subs.length} attempts
            </div>
            {subs.map((s, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 100px 80px 120px",
                padding: "10px 18px",
                borderBottom: i < subs.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 12, fontFamily: "monospace", color: s.correct ? "var(--accent)" : "var(--muted)" }}>
                  {s.flag_name || "—"}
                </span>
                <span>
                  {s.correct
                    ? <span className="badge badge-green" style={{ fontSize: 10 }}>CORRECT</span>
                    : <span className="badge badge-red" style={{ fontSize: 10 }}>WRONG</span>}
                </span>
                <span style={{ fontSize: 13, fontWeight: "bold", color: s.correct ? "var(--accent)" : "var(--muted)" }}>
                  {s.correct ? `+${s.points}` : "—"}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
                  {new Date(s.submitted_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
        {!subLoading && subs.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", border: "1px dashed var(--border)", borderRadius: 8, color: "var(--muted)" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🚩</div>
            <div style={{ fontSize: 14 }}>No submissions yet. Go find some flags!</div>
          </div>
        )}
      </div>
    </>
  );
}