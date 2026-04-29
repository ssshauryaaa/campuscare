// app/api/defense/patches/route.ts
// Server-side patch state — shared across all PCs on the LAN.
// GET  → returns { patched: string[] }
// POST → { vuln_type } marks a vuln as patched
// DELETE → clears all patches (used by admin reset)

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT vuln_type FROM patches").all() as { vuln_type: string }[];
  return NextResponse.json({ patched: rows.map(r => r.vuln_type) });
}

export async function POST(req: NextRequest) {
  const { vuln_type } = await req.json();
  if (!vuln_type) return NextResponse.json({ error: "Missing vuln_type" }, { status: 400 });
  const db = getDb();
  db.prepare("INSERT OR IGNORE INTO patches (vuln_type) VALUES (?)").run(vuln_type);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const db = getDb();
  db.prepare("DELETE FROM patches").run();
  return NextResponse.json({ ok: true });
}
