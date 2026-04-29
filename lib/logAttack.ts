// lib/logAttack.ts
// Logs real red-team attacks to the SERVER (SQLite) so the defender dashboard
// can see attacks from any PC on the LAN — not just the same browser.

import type { AttackType, Severity } from "@/types/defense";

export interface RealAttackPayload {
  type: AttackType;
  severity?: Severity;
  detail: string;
  endpoint: string;
  method?: string;
  statusCode?: number;
  payload: string;
  user?: string;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Log a real attack to the server ──────────────────────────────────────────
export function logRealAttack(p: RealAttackPayload) {
  if (typeof window === "undefined") return;
  const event = {
    id: uid(),
    ts: Date.now(),
    type: p.type,
    severity: p.severity ?? "high",
    detail: p.detail,
    endpoint: p.endpoint,
    method: p.method ?? "GET",
    payload: p.payload,
    ip: "attacker-pc",
    user_agent: navigator.userAgent,
    status_code: p.statusCode ?? 200,
  };
  // Fire and forget — POST to server so defender dashboard sees it
  fetch("/api/defense/attacks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch(() => {/* silent */});
}

// ── Window hook for inline scripts in vulnerable pages ───────────────────────
// Usage: window.__logCampusAttack({ type, detail, endpoint, payload })
if (typeof window !== "undefined") {
  (window as any).__logCampusAttack = (p: RealAttackPayload) => logRealAttack(p);
}

// ── Server-side patch helpers (kept for API routes to import) ─────────────────
// These functions are thin wrappers — actual state is in SQLite via the API.
// Client-side code should use usePatchedVulns() hook instead.

export function getPatchedVulns(): Set<AttackType> {
  // Client-side fallback — hook uses the server API
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("campus_patched_vulns_cache");
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as AttackType[]);
  } catch { return new Set(); }
}

export function addPatchedVuln(type: AttackType): void {
  // POST to server — also update local cache for instant UI feedback
  if (typeof window === "undefined") return;
  fetch("/api/defense/patches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vuln_type: type }),
  }).catch(() => {/* silent */});
  // Update local cache for instant UI response
  try {
    const existing = getPatchedVulns();
    existing.add(type);
    localStorage.setItem("campus_patched_vulns_cache", JSON.stringify([...existing]));
  } catch {/* ignore */}
}

export function isVulnPatched(type: AttackType): boolean {
  return getPatchedVulns().has(type);
}
