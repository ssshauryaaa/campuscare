"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

interface Assignment {
  id: number;
  title: string;
  subject: string;
  class: string;
  due_date: string;
  description: string;
}

const SUBJECT_THEMES: Record<string, string> = {
  "Computer Science": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Mathematics: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  English: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Chemistry: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Physics: "bg-purple-500/10 text-purple-400 border-purple-400/20",
  History: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

function daysUntil(dateStr: string) {
  const due = new Date(dateStr);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / 86400000);
}

function getUrgency(days: number) {
  if (days < 0) return { label: "Overdue", style: "text-red-400 bg-red-500/10" };
  if (days === 0) return { label: "Due Today", style: "text-yellow-400 bg-yellow-500/10" };
  if (days <= 2) return { label: `${days}d left`, style: "text-orange-400 bg-orange-500/10" };
  return { label: `${days}d left`, style: "text-zinc-500 bg-zinc-500/5" };
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Assignments</h1>
            <p className="text-zinc-400 text-sm">
              Manage and track tasks for <span className="text-zinc-200">{assignments.length}</span> active assignments.
            </p>
          </div>

          {overdueCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-pulse">
              <span>⚠️ {overdueCount} Overdue</span>
            </div>
          )}
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                filter === c
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {c === "All" ? "All Classes" : `Class ${c}`}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="space-y-4">
          {loading ? (
            /* Skeleton Loading */
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 w-full bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
              <div className="text-4xl mb-4">📂</div>
              <h3 className="text-zinc-200 font-medium">No assignments found</h3>
              <p className="text-zinc-500 text-sm">Everything looks clear for Class {filter}.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((a) => {
                const days = daysUntil(a.due_date);
                const urg = getUrgency(days);
                const theme = SUBJECT_THEMES[a.subject] || "bg-zinc-500/10 text-zinc-400 border-zinc-800";

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={a.id}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-default"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-zinc-100">{a.title}</h3>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${theme}`}>
                          {a.subject}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          Class {a.class}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                        {a.description}
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-0 flex sm:flex-col items-center sm:items-end justify-between gap-1">
                      <div className="text-[11px] text-zinc-500 font-medium sm:block hidden">DUE DATE</div>
                      <div className="text-sm font-mono font-bold text-zinc-200">
                        {new Date(a.due_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                      <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${urg.style}`}>
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
  );
}