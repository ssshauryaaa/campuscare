"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Assignment {
  id: number; title: string; subject: string;
  class: string; due_date: string; description: string;
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  "Computer Science": { bg: "#0c2340", text: "#93c5fd" },
  "Mathematics":      { bg: "#1a1a0a", text: "#fde047" },
  "English":          { bg: "#0a1c14", text: "#4ade80" },
  "Chemistry":        { bg: "#200a0a", text: "#fca5a5" },
  "Physics":          { bg: "#1a0a20", text: "#d8b4fe" },
  "History":          { bg: "#1c1200", text: "#fdba74" },
};

function daysUntil(dateStr: string) {
  const due  = new Date(dateStr);
  const now  = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / 86400000);
}

function urgencyStyle(days: number): { color: string; label: string; bg: string } {
  if (days < 0)  return { color: "#fca5a5", label: "Overdue",      bg: "rgba(239,68,68,0.08)" };
  if (days === 0) return { color: "#fde047", label: "Due today",    bg: "rgba(234,179,8,0.08)" };
  if (days <= 2)  return { color: "#fb923c", label: `${days}d left`, bg: "rgba(251,146,60,0.08)" };
  if (days <= 7)  return { color: "#fde047", label: `${days}d left`, bg: "rgba(234,179,8,0.05)" };
  return               { color: "var(--muted)", label: `${days}d left`, bg: "transparent" };
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("All");

  const CLASSES = ["All", "X", "XI", "XII"];

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    fetch("/api/assignments")
      .then(r => r.json())
      .then(d => { setAssignments(d.assignments || []); setLoading(false); });
  }, []);

  const filtered = filter === "All"
    ? assignments
    : assignments.filter(a => a.class === filter);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 4, letterSpacing: -0.5 }}>
              Assignments
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} across all classes
            </p>
          </div>
          {/* Overdue count */}
          {assignments.filter(a => daysUntil(a.due_date) < 0).length > 0 && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              color: "#fca5a5",
            }}>
              ⚠ {assignments.filter(a => daysUntil(a.due_date) < 0).length} overdue
            </div>
          )}
        </div>

        {/* Class filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {CLASSES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              style={{
                background: filter === c ? "rgba(34,197,94,0.12)" : "var(--surface)",
                color: filter === c ? "var(--accent)" : "var(--muted)",
                border: filter === c ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--border)",
                borderRadius: 5, padding: "6px 16px",
                fontSize: 13, fontFamily: "monospace", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {c === "All" ? "All Classes" : `Class ${c}`}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                height: 80, background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 8,
                opacity: 0.5 - i * 0.08,
              }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", border: "1px dashed var(--border)", borderRadius: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 15 }}>No assignments for Class {filter}</div>
          </div>
        )}

        {/* Assignment cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(a => {
            const days = daysUntil(a.due_date);
            const urg  = urgencyStyle(days);
            const sub  = SUBJECT_COLORS[a.subject] ?? { bg: "#18181b", text: "var(--muted)" };

            return (
              <div key={a.id} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "16px 20px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 16,
                alignItems: "start",
                transition: "border-color 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div>
                  {/* Title + subject */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: "bold" }}>{a.title}</span>
                    <span style={{
                      fontSize: 11, fontWeight: "bold",
                      background: sub.bg, color: sub.text,
                      borderRadius: 3, padding: "2px 8px",
                    }}>
                      {a.subject}
                    </span>
                    <span style={{
                      fontSize: 11,
                      background: "rgba(59,130,246,0.1)",
                      color: "#93c5fd",
                      border: "1px solid rgba(59,130,246,0.2)",
                      borderRadius: 3, padding: "2px 8px",
                    }}>
                      Class {a.class}
                    </span>
                  </div>
                  {/* Description */}
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
                    {a.description}
                  </p>
                </div>

                {/* Due date */}
                <div style={{
                  textAlign: "right",
                  background: urg.bg,
                  borderRadius: 6,
                  padding: "8px 14px",
                  minWidth: 110,
                }}>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Due</div>
                  <div style={{ fontSize: 13, fontWeight: "bold", fontFamily: "monospace" }}>
                    {new Date(a.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                  <div style={{ fontSize: 12, color: urg.color, marginTop: 2 }}>
                    {urg.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}