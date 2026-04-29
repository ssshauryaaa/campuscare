// app/api/defense/attacks/route.ts
// Server-side attack log — written by vulnerable pages via fetch,
// read by the defender dashboard to show real attacks from attacker PCs.
// GET  → { attacks: Attack[] } (newest first, max 200)
// POST → log a new attack event
// DELETE → clear all attacks (used by admin reset)

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM attacks ORDER BY ts DESC LIMIT 200"
  ).all();
  return NextResponse.json({ attacks: rows });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ts, type, severity, detail, endpoint, method, payload, ip, user_agent, status_code } = body;
    if (!id || !type) return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
    const db = getDb();
    db.prepare(`
      INSERT OR IGNORE INTO attacks (id, ts, type, severity, detail, endpoint, method, payload, ip, user_agent, status_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, ts ?? Date.now(), type, severity ?? "high", detail ?? "", endpoint ?? "/", method ?? "GET", payload ?? "", ip ?? "", user_agent ?? "", status_code ?? 200);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE() {
  const db = getDb();
  db.prepare("DELETE FROM attacks").run();
  return NextResponse.json({ ok: true });
}
