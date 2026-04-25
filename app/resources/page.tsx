"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BookOpen, CalendarDays } from "lucide-react";

interface Resource { id: number; title: string; subject: string; class: string; type: string; uploaded_by: string; }

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  textbook: { icon:"📖", color:"#1d4ed8", bg:"rgba(59,130,246,0.08)"  },
  document: { icon:"📄", color:"#b45309", bg:"rgba(202,138,4,0.08)"   },
  notes:    { icon:"📝", color:"#16a34a", bg:"rgba(22,163,74,0.08)"   },
  manual:   { icon:"🔬", color:"#dc2626", bg:"rgba(220,38,38,0.08)"   },
};

const TIMETABLE = [
  { date:"5 May",  day:"Tue", X:"English",          XI:"Physics",          XII:"Mathematics"     },
  { date:"7 May",  day:"Thu", X:"Mathematics",      XI:"Chemistry",        XII:"Physics"          },
  { date:"9 May",  day:"Sat", X:"Science",          XI:"Mathematics",      XII:"Chemistry"        },
  { date:"12 May", day:"Tue", X:"SST",              XI:"Computer Science", XII:"English"          },
  { date:"14 May", day:"Thu", X:"Hindi",            XI:"English",          XII:"Computer Science" },
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
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:940 }}>

          {/* Header */}
          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:20, fontWeight:900, color:"var(--cc-navy)", margin:"0 0 3px", display:"flex", alignItems:"center", gap:8 }}>
              <BookOpen style={{ width:20, height:20, color:"var(--cc-orange)" }} /> Resources
            </h1>
            <p style={{ fontSize:12, color:"var(--cc-text-muted)", margin:0 }}>Study materials, manuals, and exam schedule</p>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, borderBottom:"2px solid var(--cc-border)", marginBottom:20 }}>
            {(["files","timetable"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding:"9px 20px", fontSize:13, fontWeight:700, border:"none", background:"transparent", cursor:"pointer", transition:"all 0.15s", borderBottom: tab===t?"2px solid var(--cc-orange)":"2px solid transparent", marginBottom:-2, color: tab===t?"var(--cc-orange)":"var(--cc-text-muted)", display:"flex", alignItems:"center", gap:6 }}>
                {t==="files" ? <><BookOpen style={{ width:13, height:13 }} /> Files</> : <><CalendarDays style={{ width:13, height:13 }} /> Timetable</>}
              </button>
            ))}
          </div>

          {/* FILES TAB */}
          {tab === "files" && (
            <>
              {/* Class filter */}
              <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
                {classes.map(c => (
                  <button key={c} onClick={() => setFilter(c)}
                    style={{ padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:700, border:"1.5px solid", cursor:"pointer", transition:"all 0.15s",
                      background: filter===c ? "var(--cc-orange)" : "#fff",
                      borderColor: filter===c ? "var(--cc-orange)" : "var(--cc-border)",
                      color: filter===c ? "#fff" : "var(--cc-text-muted)",
                    }}>
                    {c === "ALL" ? "All" : c === "General" ? "General" : `Class ${c}`}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height:60, background:"#fff", borderRadius:8, border:"1px solid var(--cc-border)", opacity:0.5, animation:"pulse 1.5s ease-in-out infinite" }} />)}
                </div>
              ) : (
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"var(--cc-navy)" }}>
                        {["","Title","Subject","Class","Type","Action"].map(h=>(
                          <th key={h} style={{ padding:"9px 16px", fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.85)", textTransform:"uppercase", letterSpacing:1, textAlign:"left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding:32, textAlign:"center", color:"var(--cc-text-muted)", fontSize:13 }}>
                          No resources for {filter === "ALL" ? "any class" : `Class ${filter}`}
                        </td></tr>
                      ) : filtered.map((r, i) => {
                        const meta = TYPE_META[r.type] ?? { icon:"📁", color:"var(--cc-text-muted)", bg:"rgba(0,0,0,0.04)" };
                        return (
                          <tr key={r.id} style={{ background:i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid var(--cc-border)", transition:"background 0.15s" }}
                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#f0f4ff"}
                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=i%2===0?"#fff":"#f8f9fa"}>
                            <td style={{ padding:"12px 16px", fontSize:20 }}>{meta.icon}</td>
                            <td style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color:"var(--cc-navy)" }}>{r.title}</td>
                            <td style={{ padding:"12px 16px", fontSize:12, color:"var(--cc-text-muted)" }}>{r.subject}</td>
                            <td style={{ padding:"12px 16px" }}>
                              <span style={{ fontSize:10, fontWeight:700, background:"rgba(26,60,110,0.08)", color:"var(--cc-navy)", borderRadius:4, padding:"2px 8px" }}>{r.class}</span>
                            </td>
                            <td style={{ padding:"12px 16px" }}>
                              <span style={{ fontSize:10, fontWeight:700, background:meta.bg, color:meta.color, borderRadius:4, padding:"2px 8px" }}>{r.type}</span>
                            </td>
                            <td style={{ padding:"12px 16px" }}>
                              <a href="#" onClick={e => { e.preventDefault(); alert("File not uploaded yet."); }}
                                style={{ fontSize:12, fontWeight:700, color:"var(--cc-orange)", textDecoration:"none", border:"1.5px solid rgba(245,130,10,0.3)", padding:"4px 12px", borderRadius:6, transition:"all 0.15s" }}
                                onMouseEnter={e=>{const t=e.currentTarget as HTMLElement;t.style.background="var(--cc-orange)";t.style.color="#fff"}}
                                onMouseLeave={e=>{const t=e.currentTarget as HTMLElement;t.style.background="transparent";t.style.color="var(--cc-orange)"}}>
                                ↓ View
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TIMETABLE TAB */}
          {tab === "timetable" && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--cc-border)", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden" }}>
              <div style={{ padding:"11px 20px", borderBottom:"1px solid var(--cc-border)", fontSize:10, fontWeight:800, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:2 }}>
                Exam Schedule — May 2026
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"var(--cc-navy)" }}>
                    {["Date","Day","Class X","Class XI","Class XII"].map(h=>(
                      <th key={h} style={{ padding:"9px 18px", fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.85)", textTransform:"uppercase", letterSpacing:1, textAlign:"left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIMETABLE.map((row, i) => (
                    <tr key={row.date} style={{ background:i%2===0?"#fff":"#f8f9fa", borderBottom:"1px solid var(--cc-border)", transition:"background 0.15s" }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#f0f4ff"}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=i%2===0?"#fff":"#f8f9fa"}>
                      <td style={{ padding:"13px 18px", fontWeight:800, fontSize:14, color:"var(--cc-navy)" }}>{row.date}</td>
                      <td style={{ padding:"13px 18px", fontSize:12, color:"var(--cc-text-muted)" }}>{row.day}</td>
                      <td style={{ padding:"13px 18px", fontSize:13, color:"var(--cc-text)" }}>{row.X}</td>
                      <td style={{ padding:"13px 18px", fontSize:13, color:"var(--cc-text)" }}>{row.XI}</td>
                      <td style={{ padding:"13px 18px", fontSize:13, color:"var(--cc-text)" }}>{row.XII}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}