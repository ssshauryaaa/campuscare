"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { AttackType, LogEntry } from "@/types/defense";
import { ATTACK_TEMPLATES, COUNTRIES, USER_AGENTS, uid, rnd, fakeIp, fakePort } from "@/constants/campusAttackData";
import { getPatchedVulns } from "@/lib/logAttack";

// ── usePatchedVulns ───────────────────────────────────────────────────────────
// Polls localStorage["campus_patched_vulns"] and returns a live Set.
// Use this in any vulnerable page to conditionally block exploits.
export function usePatchedVulns(): Set<AttackType> {
  const [patched, setPatched] = useState<Set<AttackType>>(new Set());
  useEffect(() => {
    const check = () => setPatched(getPatchedVulns());
    check();
    const t = setInterval(check, 500);
    return () => clearInterval(t);
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
export function useAttackSimulator(patchedTypes: Set<AttackType>, isRunning: boolean) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alertFlash, setAlertFlash] = useState(false);
  const seenRealIds = useRef(new Set<string>());
  const patchedRef = useRef(patchedTypes);

  useEffect(() => { patchedRef.current = patchedTypes; }, [patchedTypes]);

  const flash = useCallback(() => {
    setAlertFlash(true);
    setTimeout(() => setAlertFlash(false), 600);
  }, []);

  const addLog = useCallback((entry: LogEntry) => {
    setLogs(prev => [entry, ...prev].slice(0, 150));
    if (entry.severity === "critical") flash();
  }, [flash]);

  const spawnAttack = useCallback(() => {
    const available = ATTACK_TEMPLATES.filter(t => !patchedRef.current.has(t.type));
    if (!available.length) return;
    const tpl = available[rnd(0, available.length)];
    addLog({
      ...tpl,
      id: uid(),
      ts: Date.now(),
      ip: fakeIp(),
      port: fakePort(),
      country: COUNTRIES[rnd(0, COUNTRIES.length)],
      userAgent: USER_AGENTS[rnd(0, USER_AGENTS.length)],
      patched: false,
      detected: false,
    });
  }, [addLog]);

  // Poll real attacks written to localStorage by vulnerable pages
  // Vulnerable pages call window.__logCampusAttack({ type, payload, endpoint })
  // which writes to localStorage key "campus_attack_log"
  useEffect(() => {
    const poll = setInterval(() => {
      try {
        const raw = localStorage.getItem("campus_attack_log");
        if (!raw) return;
        const events: any[] = JSON.parse(raw);
        const fresh = events.filter(e => !seenRealIds.current.has(e.id));
        if (!fresh.length) return;
        fresh.forEach(e => seenRealIds.current.add(e.id));
        fresh.forEach(e => {
          if (!e.type) return;
          addLog({
            id: e.id ?? uid(),
            ts: e.ts ?? Date.now(),
            type: e.type,
            severity: e.severity ?? "high",
            ip: e.ip ?? "192.168.1.x",
            port: e.port ?? 3000,
            user: e.user ?? "RedTeam",
            detail: e.detail ?? "Real attack detected",
            endpoint: e.endpoint ?? "/unknown",
            method: e.method ?? "GET",
            statusCode: e.statusCode ?? 200,
            userAgent: e.userAgent ?? navigator.userAgent,
            payload: e.payload ?? "",
            country: "LAN",
            patched: false,
            detected: false,
          });
        });
      } catch { /* ignore */ }
    }, 600);
    return () => clearInterval(poll);
  }, [addLog]);

  // Periodic simulated attack spawner — every 7 seconds
  useEffect(() => {
    if (!isRunning) return;
    spawnAttack();
    const t = setInterval(spawnAttack, 7000);
    return () => clearInterval(t);
  }, [isRunning, spawnAttack]);

  return { logs, setLogs, alertFlash };
}
