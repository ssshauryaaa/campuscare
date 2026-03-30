"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/notices")
      .then(r => r.json())
      .then(d => {
        setNotices(d.notices || []);
        setLoading(false);
      });
  }, []);

  const filtered = notices.filter(n =>
    !filter ||
    [n.title, n.content, n.author].some(field => 
      field.toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Notice Board</h1>
            <p className="text-slate-500 text-sm mt-1">Greenfield International • Central Bulletin</p>
          </div>
          
          <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Feed</span>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="relative mb-8 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">🔍</span>
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search bulletin keywords..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm font-mono focus:outline-none focus:border-cyan-500/40 transition-all placeholder:text-slate-600"
          />
          {filter && (
            <button 
              onClick={() => setFilter("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xl"
            >
              &times;
            </button>
          )}
        </div>

        {/* Notice Feed */}
        <div className="space-y-3">
          {loading ? (
            <LoadingSkeletons />
          ) : filtered.length === 0 ? (
            <EmptyState isFiltered={!!filter} onClear={() => setFilter("")} />
          ) : (
            filtered.map((n) => (
              <NoticeCard 
                key={n.id} 
                notice={n} 
                isExpanded={expandedId === n.id}
                onToggle={() => setExpandedId(expandedId === n.id ? null : n.id)}
              />
            ))
          )}
        </div>

        {/* Feed Metadata */}
        {!loading && (
          <footer className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-widest">
            <span>Payload: {filtered.length} Objects</span>
            <span>Sync: {new Date().toLocaleTimeString()}</span>
          </footer>
        )}
      </main>
    </div>
  );
}

/** * UI Sub-components 
 */

function NoticeCard({ notice, isExpanded, onToggle }: { notice: Notice, isExpanded: boolean, onToggle: () => void }) {
  const isNew = (Date.now() - new Date(notice.created_at).getTime()) < 86400000 * 3;
  
  // Author Color Logic
  const getAccent = (author: string) => {
    if (author === "admin") return "bg-red-500";
    if (author === "principal") return "bg-yellow-500";
    return "bg-cyan-500";
  };

  return (
    <div className={`
      group border rounded-2xl transition-all duration-300
      ${isExpanded ? 'bg-white/[0.04] border-cyan-500/40' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}
    `}>
      <button 
        onClick={onToggle}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        <div className={`w-1 self-stretch rounded-full ${getAccent(notice.author)} opacity-60 mt-1`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-slate-200 truncate group-hover:text-white transition-colors">
              {notice.title}
            </h3>
            {isNew && (
              <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">
                New
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
            <span className="text-slate-400">{notice.author}</span>
            <span>•</span>
            <span>{new Date(notice.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <span className={`text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-10 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-white/10 mb-5" />
          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {notice.content}
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingSkeletons() {
  return (
    <div className="space-y-3 opacity-20">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-20 bg-white/10 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ isFiltered, onClear }: { isFiltered: boolean, onClear: () => void }) {
  return (
    <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
      <div className="text-4xl mb-4 grayscale opacity-50">📑</div>
      <p className="text-slate-400 text-sm">No bulletins match your current filter.</p>
      {isFiltered && (
        <button onClick={onClear} className="mt-4 text-xs text-cyan-500 hover:underline">
          Clear Search Filter
        </button>
      )}
    </div>
  );
}