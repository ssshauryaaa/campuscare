"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { BookOpen } from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  class: string;
  due_date: string;
  description: string;
}

const SUBJECT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "Computer Science": { bg:"rgba(59,130,246,0.1)",  color:"#1d4ed8", border:"rgba(59,130,246,0.25)"  },
  Mathematics:        { bg:"rgba(202,138,4,0.1)",   color:"#b45309", border:"rgba(202,138,4,0.25)"   },
  English:            { bg:"rgba(22,163,74,0.1)",   color:"#15803d", border:"rgba(22,163,74,0.25)"   },
  Chemistry:          { bg:"rgba(220,38,38,0.1)",   color:"#b91c1c", border:"rgba(220,38,38,0.25)"   },
  Physics:            { bg:"rgba(124,58,237,0.1)",  color:"#6d28d9", border:"rgba(124,58,237,0.25)"  },
  History:            { bg:"rgba(245,130,10,0.1)",  color:"var(--cc-orange)", border:"rgba(245,130,10,0.25)" },
};

function daysUntil(dateStr: string) {
  const due = new Date(dateStr);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / 86400000);
}

function getUrgency(days: number) {
  if (days < 0)  return { label:"Overdue",    color:"#dc2626", bg:"rgba(220,38,38,0.1)"   };
  if (days === 0) return { label:"Due Today",  color:"#d97706", bg:"rgba(202,138,4,0.1)"   };
  if (days <= 2)  return { label:`${days}d left`, color:"#ea580c", bg:"rgba(234,88,12,0.1)" };
  return { label:`${days}d left`, color:"var(--cc-text-muted)", bg:"rgba(0,0,0,0.04)" };
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const CLASSES = ["All", "X", "XI", "XII"];

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) {
      router.push("/login");
      return;
    }
    fetch("/api/assignments")
      .then((r) => r.json())
      .then((d) => {
        setAssignments(d.assignments || []);
        setLoading(false);
      });
  }, [router]);

  const filtered = filter === "All" ? assignments : assignments.filter((a) => a.class === filter);
  const overdueCount = assignments.filter((a) => daysUntil(a.due_date) < 0).length;

  return (
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:900 }}>

          {/* Header */}
          <div style={{ marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:12 }}>
            <div>
              <h1 style={{ fontSize:20, fontWeight:900, color:"var(--cc-navy)", margin:"0 0 4px", display:"flex", alignItems:"center", gap:8 }}>
                <BookOpen style={{ width:20, height:20, color:"var(--cc-orange)" }} /> Assignments
              </h1>
              <p style={{ fontSize:12, color:"var(--cc-text-muted)", margin:0 }}>
                {assignments.length} active assignment{assignments.length !== 1 ? "s" : ""} across all classes
              </p>
            </div>
            {overdueCount > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:20, background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", color:"#dc2626", fontSize:12, fontWeight:700 }}>
                ⚠️ {overdueCount} Overdue
              </div>
            )}
          </div>

          {/* Filters */}
          <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
            {CLASSES.map((c) => (
              <button key={c} onClick={() => setFilter(c)}
                style={{ padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:700, border:"1.5px solid", cursor:"pointer", transition:"all 0.15s",
                  background: filter===c ? "var(--cc-orange)" : "#fff",
                  borderColor: filter===c ? "var(--cc-orange)" : "var(--cc-border)",
                  color: filter===c ? "#fff" : "var(--cc-text-muted)",
                }}>
                {c === "All" ? "All Classes" : `Class ${c}`}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height:88, background:"#fff", borderRadius:10, border:"1px solid var(--cc-border)", opacity:0.5, animation:"pulse 1.5s ease-in-out infinite" }} />
              ))
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", border:"2px dashed var(--cc-border)", borderRadius:12 }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
                <h3 style={{ fontSize:14, fontWeight:700, color:"var(--cc-navy)", margin:"0 0 4px" }}>No assignments found</h3>
                <p style={{ fontSize:12, color:"var(--cc-text-muted)", margin:0 }}>Everything looks clear for {filter === "All" ? "all classes" : `Class ${filter}`}.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((a) => {
                  const days = daysUntil(a.due_date);
                  const urg  = getUrgency(days);
                  const subj = SUBJECT_COLORS[a.subject] || { bg:"rgba(0,0,0,0.05)", color:"var(--cc-text-muted)", border:"var(--cc-border)" };

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={a.id}
                      style={{ background:"#fff", borderRadius:10, border:"1px solid var(--cc-border)", borderLeft:"4px solid var(--cc-orange)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, boxShadow:"0 1px 4px rgba(0,0,0,0.04)", cursor:"default" }}
                      whileHover={{ boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}
                    >
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                          <h3 style={{ fontSize:14, fontWeight:800, color:"var(--cc-navy)", margin:0 }}>{a.title}</h3>
                          <span style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:0.5, padding:"2px 8px", borderRadius:20, background:subj.bg, color:subj.color, border:`1px solid ${subj.border}` }}>{a.subject}</span>
                          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:"rgba(26,60,110,0.08)", color:"var(--cc-navy)" }}>Class {a.class}</span>
                        </div>
                        <p style={{ fontSize:12, color:"var(--cc-text-muted)", margin:0, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any }}>{a.description}</p>
                      </div>

                      <div style={{ flexShrink:0, textAlign:"right" }}>
                        <div style={{ fontSize:9, fontWeight:700, color:"var(--cc-text-muted)", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Due Date</div>
                        <div style={{ fontSize:14, fontWeight:800, fontFamily:"'DM Mono',monospace", color:"var(--cc-navy)" }}>
                          {new Date(a.due_date).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}
                        </div>
                        <div style={{ marginTop:4, padding:"2px 10px", borderRadius:20, fontSize:10, fontWeight:700, background:urg.bg, color:urg.color }}>
                          {urg.label}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}