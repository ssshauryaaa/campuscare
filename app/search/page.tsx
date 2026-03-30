"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

// VULNERABILITY: q param → /api/search → interpolated into SQL
// UNION attack: %' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--

interface Student {
  id: number;
  full_name: string;
  class: string;
  section: string;
  admission_no: string;
}

const CLASS_FILTERS = ["All", "IX", "X", "XI", "XII"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [classFilter, setClass] = useState("All");
  const [results, setResults] = useState<Student[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (overrideQ?: string) => {
    const q = overrideQ ?? query;
    if (!q.trim() && classFilter === "All") return;

    setLoading(true);
    setError("");
    setResults(null);
    setSearched(q);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q || " ")}`);
      const data = await res.json();

      if (!res.ok) {
        // VULNERABILITY: Raw SQL error + executed query leaked for CTF
        setError((data.error || "Unknown error") + (data.query ? `\n\n[QUERY_LOG]: ${data.query}` : ""));
      } else {
        let list: Student[] = data.results || [];
        if (classFilter !== "All") list = list.filter(s => s.class === classFilter);
        setResults(list);
      }
    } catch (err) {
      setError("Critical System Failure: Connection refused.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setError("");
    setSearched("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Registry of all currently enrolled personnel.</p>
        </header>

        {/* Search Controls */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Query name or ID..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm font-mono text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              {query && (
                <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">×</button>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-black font-bold px-8 py-3 rounded-xl transition-all text-sm uppercase tracking-widest whitespace-nowrap"
            >
              {loading ? "Searching..." : "Execute Search"}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter by Class:</span>
            <div className="flex gap-2">
              {CLASS_FILTERS.map(c => (
                <button
                  key={c}
                  onClick={() => setClass(c)}
                  className={`px-3 py-1 rounded-md text-[11px] font-mono border transition-all ${
                    classFilter === c 
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                      : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Database Error (The Clue) */}
        {error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-8">
            <div className="flex gap-3 items-start">
              <span className="text-red-500">⚠</span>
              <pre className="text-[11px] font-mono text-red-400 whitespace-pre-wrap break-all leading-relaxed">
                <div className="font-bold uppercase mb-1">Database Exception Report</div>
                {error}
              </pre>
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3 opacity-40">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 border border-white/10 rounded-xl animate-pulse" />)}
            </div>
          ) : results !== null && results.length > 0 ? (
            <>
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                  Found <span className="text-cyan-400">{results.length}</span> Records for "{searched}"
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.02] border-b border-white/10 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Ref_ID</th>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4 text-center">Class/Sec</th>
                      <th className="px-6 py-4 text-right">Adm_Num</th>
                      <th className="px-6 py-4 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((s) => (
                      <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{s.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <InitialAvatar name={s.full_name} />
                            <span className="font-semibold text-slate-200">{s.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs text-slate-400">
                          {s.class}-{s.section}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                          {s.admission_no}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/profile/${s.id}`} className="text-slate-600 hover:text-cyan-400 transition-colors">
                            →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : results !== null ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <div className="text-4xl mb-4 grayscale">📂</div>
              <p className="text-slate-400 font-medium">No records matching the query were retrieved.</p>
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
              <p className="text-slate-500 text-sm italic font-mono">Query the database to populate this view...</p>
            </div>
          )}
        </div>

        {/* System Hint (IDOR nudge) */}
        <footer className="mt-12 text-center">
          <p className="text-[10px] text-slate-600 font-mono flex items-center justify-center gap-2">
            <span className="text-cyan-900">SYSTEM_ID_INDEX:</span> 
            Access restricted to pattern <span className="text-cyan-700 underline decoration-cyan-900">/profile/[id]</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold font-mono border"
         style={{ 
           background: `hsl(${hue}, 40%, 10%)`, 
           borderColor: `hsl(${hue}, 40%, 25%)`,
           color: `hsl(${hue}, 50%, 60%)` 
         }}>
      {initials}
    </div>
  );
}