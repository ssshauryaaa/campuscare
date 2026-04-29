// app/api/auth/login/route.ts
// VULNERABILITY: Raw string interpolation into SQL → SQLi auth bypass
// PATCH: When sqli_login is patched in the DB, uses parameterized query instead.

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

function isPatched(db: ReturnType<typeof getDb>, type: string): boolean {
  const row = db.prepare("SELECT 1 FROM patches WHERE vuln_type = ?").get(type);
  return !!row;
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const db = getDb();
  const sqliPatched = isPatched(db, "sqli_login");

  let user: any;
  try {
    if (sqliPatched) {
      // SECURE: parameterized query — SQLi impossible
      user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    } else {
      // VULNERABILITY: Direct string interpolation — no prepared statement
      // Payload: username = admin'--   → logs in as admin without password
      // Payload: username = ' OR 1=1-- → logs in as first user in DB
      const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      user = db.prepare(query).get();
    }
  } catch (e: any) {
    // VULNERABILITY: Raw SQL error + full query leaked to client (when unpatched)
    if (!sqliPatched) {
      const rawQ = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      return NextResponse.json({ error: `Database error: ${e.message}`, query: rawQ }, { status: 500 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }

  if (!user) {
    const hint = sqliPatched
      ? "Invalid username or password"
      : "Invalid username or password";
    const extra = sqliPatched ? {} : { debug_query: `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'` };
    return NextResponse.json({ error: hint, ...extra }, { status: 401 });
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role, email: user.email, full_name: user.full_name });
  const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  res.cookies.set("token", token, { httpOnly: false, path: "/", maxAge: 60 * 60 * 24, sameSite: "lax" });
  return res;
}