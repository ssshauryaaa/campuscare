"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { AttackType, LogEntry } from "@/types/defense";
import { uid } from "@/constants/campusAttackData";

// ── usePatchedVulns ───────────────────────────────────────────────────────────
// Polls the SERVER every 3 seconds so all PCs share the same patch state.
// Defenders patch on their PC → attackers see enforcement immediately.
export function usePatchedVulns(): Set<AttackType> {
  const [patched, setPatched] = useState<Set<AttackType>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function fetchPatches() {
      try {
        const res = await fetch("/api/defense/patches");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          const s = new Set<AttackType>(data.patched as AttackType[]);
          setPatched(s);
          // Keep local cache in sync for instant reads
          localStorage.setItem("campus_patched_vulns_cache", JSON.stringify(data.patched));
        }
      } catch {/* network error — keep previous state */}
    }
    fetchPatches();
    const t = setInterval(fetchPatches, 3000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  return patched;
}

// ── useTimer ──────────────────────────────────────────────────────────────────
export function useTimer(isRunning: boolean) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => { if (isRunning) setElapsed(e => e + 1); }, 1000);
    return () => clearInterval(t);
  }, [isRunning]);
  return elapsed;
}

// ── useToast ──────────────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const show = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  return [toast, show] as const;
}

// ── useAttackSimulator ────────────────────────────────────────────────────────
// Shows ONLY real attacks from attacker PCs via server poll.
// No fake/simulated attacks — every log entry is a genuine exploit attempt.
export function useAttackSimulator(patchedTypes: Set<AttackType>) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alertFlash, setAlertFlash] = useState(false);
  const seenRealIds = useRef(new Set<string>());

  const flash = useCallback(() => {
    setAlertFlash(true);
    setTimeout(() => setAlertFlash(false), 600);
  }, []);

  const addLog = useCallback((entry: LogEntry) => {
    setLogs(prev => [entry, ...prev].slice(0, 200));
    if (entry.severity === "critical") flash();
  }, [flash]);

  // ── Poll REAL attacks from the server (written by attacker PCs) ─────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchAttacks() {
      try {
        const res = await fetch("/api/defense/attacks");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const fresh = (data.attacks as any[]).filter(e => !seenRealIds.current.has(e.id));
        if (!fresh.length) return;
        fresh.forEach(e => seenRealIds.current.add(e.id));
        fresh.forEach(e => {
          if (!e.type) return;
          addLog({
            id: e.id,
            ts: e.ts ?? Date.now(),
            type: e.type,
            severity: e.severity ?? "high",
            ip: e.ip ?? "attacker-pc",
            port: 3000,
            user: e.user ?? "RedTeam",
            detail: e.detail ?? "Real attack detected",
            endpoint: e.endpoint ?? "/unknown",
            method: e.method ?? "GET",
            statusCode: e.status_code ?? 200,
            userAgent: e.user_agent ?? "Attacker Browser",
            payload: e.payload ?? "",
            country: "LAN",
            patched: patchedTypes.has(e.type),
            detected: false,
          });
        });
      } catch {/* ignore */}
    }
    fetchAttacks();
    const t = setInterval(fetchAttacks, 2000);
    return () => { cancelled = true; clearInterval(t); };
  }, [addLog, patchedTypes]);

  return { logs, setLogs, alertFlash };
}
