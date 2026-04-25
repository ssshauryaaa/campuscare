// lib/logAttack.ts
// Called by vulnerable pages to log real red team attacks to localStorage
// The defense dashboard polls localStorage["campus_attack_log"] every 600ms

import type { AttackType, Severity } from "@/types/defense";
import { uid } from "@/constants/campusAttackData";

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

export function logRealAttack(p: RealAttackPayload) {
  if (typeof window === "undefined") return;
  try {
    const key = "campus_attack_log";
    const existing: any[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    existing.unshift({
      ...p,
      id: uid(),
      ts: Date.now(),
      severity: p.severity ?? "high",
      method: p.method ?? "GET",
      statusCode: p.statusCode ?? 200,
      user: p.user ?? "RedTeam",
    });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
  } catch { /* ignore */ }
}

// ── Patched vulnerabilities ───────────────────────────────────────────────────
// Written by defense page when blue team clicks "Mark as Patched"
// Read by vulnerable pages to block the exploit path

const PATCHED_KEY = "campus_patched_vulns";

export function getPatchedVulns(): Set<AttackType> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PATCHED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as AttackType[]);
  } catch { return new Set(); }
}

export function addPatchedVuln(type: AttackType): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getPatchedVulns();
    existing.add(type);
    localStorage.setItem(PATCHED_KEY, JSON.stringify([...existing]));
  } catch { /* ignore */ }
}

export function isVulnPatched(type: AttackType): boolean {
  return getPatchedVulns().has(type);
}
