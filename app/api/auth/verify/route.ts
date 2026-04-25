// app/api/auth/verify/route.ts
// VULNERABILITY: No rate limiting, no lockout, no attempt counter, no PIN expiry
// Attack: script that POSTs every value from "0000" to "9999" — 10,000 requests, no lockout

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { pin, token: providedToken } = await req.json();

  const db = getDb();

  // VULNERABILITY: No attempt counter — unlimited guesses allowed
  // VULNERABILITY: No expiry check — a PIN generated last week is still valid
  // VULNERABILITY: Response distinguishes "wrong PIN" from "expired" — oracle attack
  const record = db.prepare(
    "SELECT * FROM verification_pins WHERE user_id = ? AND pin = ?"
  ).get(user.id, pin) as any;

  if (!record) {
    // VULNERABILITY: distinct error message helps attacker confirm PIN format
    return NextResponse.json({ error: "Incorrect PIN. Try again.", attempts_remaining: "unlimited" }, { status: 401 });
  }

  // VULNERABILITY: PIN never invalidated after use — replayable
  return NextResponse.json({ success: true, message: "PIN verified", token: record.action_token });
}

// Also expose GET to check current PIN status — leaks creation time
export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();
  // VULNERABILITY: Returns PIN metadata including creation time — helps time-based attacks
  const pin = db.prepare("SELECT pin, created_at, action FROM verification_pins WHERE user_id = ?").get(user.id) as any;
  return NextResponse.json({ has_pending_pin: !!pin, created_at: pin?.created_at, action: pin?.action });
}