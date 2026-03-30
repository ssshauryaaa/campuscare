"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Resource { id: number; title: string; subject: string; class: string; type: string; uploaded_by: string; }

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  textbook: { icon: "📖", color: "#93c5fd", bg: "#0c2340" },
  document: { icon: "📄", color: "#fde047", bg: "#1a1a0a" },
  notes:    { icon: "📝", color: "#4ade80", bg: "#0a1c14" },
  manual:   { icon: "🔬", color: "#fca5a5", bg: "#200a0a" },
};

const TIMETABLE = [
  { date: "5 May",  day: "Tue", X: "English",          XI: "Physics",          XII: "Mathematics" },
  { date: "7 May",  day: "Thu", X: "Mathematics",      XI: "Chemistry",        XII: "Physics" },
  { date: "9 May",  day: "Sat", X: "Science",          XI: "Mathematics",      XII: "Chemistry" },
  { date: "12 May", day: "Tue", X: "SST",              XI: "Computer Science", XII: "English" },
  { date: "14 May", day: "Thu", X: "Hindi",            XI: "English",          XII: "Computer Science" },
];

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter]       = useState("ALL");
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<"files" | "timetable">("files");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    fetch("/api/resources").then(r => r.json()).then(d => { setResources(d.resources || []); setLoading(false); });
  }, []);

  const classes = ["ALL", "X", "XI", "XII", "General"];
  const filtered = filter === "ALL" ? resources : resources.filter(r => r.class === filter);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 4, letterSpacing: -0.5 }}>Resources</h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Study materials, manuals, and exam schedule</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden", width: "fit-content" }}>
          {(["files", "timetable"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                background: tab === t ? "rgba(34,197,94,0.1)" : "transparent",
                color: tab === t ? "var(--accent)" : "var(--muted)",
                border: "none", borderRight: t === "files" ? "1px solid var(--border)" : "none",
                padding: "8px 20px", fontSize: 13, fontFamily: "monospace",
                cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
              }}
            >
              {t === "files" ? "📚 Files" : "📅 Timetable"}
            </button>
          ))}
        </div>

        {/* FILES TAB */}
        {tab === "files" && (
          <>
            {/* Class filter */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {classes.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  style={{
                    background: filter === c ? "rgba(34,197,94,0.12)" : "var(--surface)",
                    color: filter === c ? "var(--accent)" : "var(--muted)",
                    border: filter === c ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--border)",
                    borderRadius: 5, padding: "5px 14px", fontSize: 12,
                    fontFamily: "monospace", cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {c === "ALL" ? "All" : c === "General" ? "General" : `Class ${c}`}
                </button>
              ))}
            </div>

            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 60, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, opacity: 0.4 }} />)}
              </div>
            )}

            {!loading && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                {/* Table header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "36px 1fr 120px 80px 100px 80px",
                  padding: "9px 18px", borderBottom: "1px solid var(--border)",
                  fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5,
                }}>
                  <span></span><span>Title</span><span>Subject</span>
                  <span>Class</span><span>Type</span><span>Action</span>
                </div>

                {filtered.length === 0 ? (
                  <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                    No resources for {filter === "ALL" ? "any class" : `Class ${filter}`}
                  </div>
                ) : filtered.map((r, i) => {
                  const meta = TYPE_META[r.type] ?? { icon: "📁", color: "var(--muted)", bg: "var(--bg)" };
                  return (
                    <div key={r.id} style={{
                      display: "grid", gridTemplateColumns: "36px 1fr 120px 80px 100px 80px",
                      padding: "12px 18px",
                      borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                      alignItems: "center", transition: "background 0.15s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: 18 }}>{meta.icon}</span>
                      <span style={{ fontSize: 14 }}>{r.title}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{r.subject}</span>
                      <span>
                        <span style={{
                          fontSize: 10, fontWeight: "bold",
                          background: "#1e3a5f", color: "#93c5fd",
                          borderRadius: 3, padding: "2px 7px",
                        }}>{r.class}</span>
                      </span>
                      <span>
                        <span style={{
                          fontSize: 10, fontWeight: "bold",
                          background: meta.bg, color: meta.color,
                          borderRadius: 3, padding: "2px 7px",
                        }}>{r.type}</span>
                      </span>
                      <span>
                        <a href="#" onClick={e => { e.preventDefault(); alert("File not uploaded yet."); }}
                          style={{ fontSize: 12, color: "var(--accent)" }}>
                          ↓ Get
                        </a>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TIMETABLE TAB */}
        {tab === "timetable" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              padding: "12px 20px", borderBottom: "1px solid var(--border)",
              fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              Exam Schedule — May 2026
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "80px 60px 1fr 1fr 1fr",
              padding: "9px 20px", borderBottom: "1px solid var(--border)",
              fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              <span>Date</span><span>Day</span><span>Class X</span><span>Class XI</span><span>Class XII</span>
            </div>
            {TIMETABLE.map((row, i) => (
              <div key={row.date} style={{
                display: "grid", gridTemplateColumns: "80px 60px 1fr 1fr 1fr",
                padding: "14px 20px",
                borderBottom: i < TIMETABLE.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center", transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontWeight: "bold", fontSize: 14 }}>{row.date}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{row.day}</span>
                <span style={{ fontSize: 13 }}>{row.X}</span>
                <span style={{ fontSize: 13 }}>{row.XI}</span>
                <span style={{ fontSize: 13 }}>{row.XII}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}