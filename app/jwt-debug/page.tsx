"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ShieldAlert, Terminal, CheckCircle2, AlertTriangle, Copy, ExternalLink } from "lucide-react";

interface Decoded { header: any; payload: any; sig: string; }

/**
 * Modernized JSON syntax highlighter component
 */
function JsonBlock({ data, title, color = "blue" }: { data: any, title: string, color?: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-400",
    green: "text-emerald-400",
    yellow: "text-yellow-400"
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={`text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>
        {title}
      </div>
      <pre className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-xs leading-relaxed overflow-x-auto">
        {JSON.stringify(data, null, 2).split("\n").map((line, i) => {
          const keyMatch = line.match(/^(\s*)"([^"]+)":/);
          if (keyMatch) {
            return (
              <span key={i} className="block">
                {keyMatch[1]}
                <span className="text-blue-300">"{keyMatch[2]}"</span>
                {line.slice(keyMatch[0].length)}
              </span>
            );
          }
          const isStr = line.trim().startsWith('"') || line.includes(': "');
          return (
            <span key={i} className={`block ${isStr ? "text-emerald-400" : "text-yellow-200/70"}`}>
              {line}
            </span>
          );
        })}
      </pre>
    </div>
  );
}

export default function JwtDebugPage() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<Decoded | null>(null);
  const [custom, setCustom] = useState("");
  const [customDec, setCustomDec] = useState<Decoded | null>(null);
  const [verifyRes, setVerifyRes] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) return;
    const t = decodeURIComponent(match[1]);
    setToken(t);
    setDecoded(safeDecode(t));
  }, []);

  const safeDecode = (t: string): Decoded | null => {
    try {
      const p = t.split(".");
      return {
        header: JSON.parse(atob(p[0].replace(/-/g, "+").replace(/_/g, "/"))),
        payload: JSON.parse(atob(p[1].replace(/-/g, "+").replace(/_/g, "/"))),
        sig: p[2] ?? "",
      };
    } catch { return null; }
  };

  const handleCustomChange = (v: string) => {
    setCustom(v);
    setCustomDec(safeDecode(v));
    setVerifyRes(null);
  };

  const verify = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: custom }),
      });
      setVerifyRes(await res.json());
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 selection:bg-blue-500/30">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Terminal className="w-5 h-5 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">JWT Debugger</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-400">DEV_ONLY</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-md">
              Internal utility for token inspection and signature validation. 
              <span className="text-red-400/80 block mt-1 font-medium italic underline underline-offset-4">Warning: Remove from production build.</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5 min-w-[240px]">
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Algorithm</p>
              <p className="font-mono text-yellow-500 font-bold">HS256</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Secret Strength</p>
              <p className="text-red-500 font-bold flex items-center justify-end gap-1">
                <ShieldAlert className="w-3 h-3" /> WEAK
              </p>
            </div>
          </div>
        </header>

        {/* Current Token Section */}
        {token && decoded && (
          <section className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-6 py-4 bg-white/5 flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Active Session Token
              </h2>
              <code className="text-[10px] text-zinc-500 italic">HS256 Signed</code>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="p-4 rounded-lg bg-black/50 border border-white/5 font-mono text-[11px] break-all leading-relaxed tracking-tight group relative">
                <span className="text-blue-400">{token.split(".")[0]}</span>
                <span className="text-zinc-600">.</span>
                <span className="text-emerald-400">{token.split(".")[1]}</span>
                <span className="text-zinc-600">.</span>
                <span className="text-rose-400">{token.split(".")[2]}</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <JsonBlock data={decoded.header} title="Header" color="blue" />
                <JsonBlock data={decoded.payload} title="Payload" color="green" />
              </div>
            </div>
          </section>
        )}

        {/* Custom Tester */}
        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <label className="text-[10px] font-bold uppercase text-zinc-500 mb-4 block tracking-widest italic">
                Input Forged Token
              </label>
              <textarea
                value={custom}
                onChange={e => handleCustomChange(e.target.value)}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                placeholder="Paste JWT here..."
              />
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={verify}
                  disabled={verifying || !custom}
                  className="flex-1 bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {verifying ? "Verifying..." : <>Verify Integrity <ExternalLink className="w-4 h-4" /></>}
                </button>
                <button 
                  onClick={() => {
                    document.cookie = `token=${custom}; path=/; max-age=86400`;
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-6 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  {copied ? <CheckCircle2 className="text-emerald-500" /> : "Apply Cookie"}
                </button>
              </div>

              {verifyRes && (
                <div className={`mt-6 p-4 rounded-xl border font-mono text-xs ${verifyRes.valid ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
                  <pre>{JSON.stringify(verifyRes, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Reference Sidebar */}
          <aside className="space-y-4">
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
              <h3 className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Vector Lab
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-xs font-bold mb-2 underline decoration-rose-500/30">Algorithm Confusion</h4>
                  <ul className="text-[11px] space-y-2 text-zinc-500 font-mono">
                    <li>1. alg: "none"</li>
                    <li>2. role: "admin"</li>
                    <li>3. Strip signature</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white text-xs font-bold mb-2 underline decoration-yellow-500/30">Secret Recovery</h4>
                  <p className="text-[10px] text-zinc-600 mb-2">Crack using RockYou:</p>
                  <code className="block bg-black p-2 rounded text-[10px] text-yellow-500">
                    hashcat -m 16500 jwt.txt rockyou.txt
                  </code>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}