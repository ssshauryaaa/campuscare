// app/api/auth/login/route.ts
// VULNERABILITY: Raw string interpolation into SQL → SQLi auth bypass
// admin'-- in username field skips password check entirely

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const db = getDb();

  // VULNERABILITY: Direct string interpolation — no prepared statement
  // Payload: username = admin'--   → logs in as admin without password
  // Payload: username = ' OR 1=1-- → logs in as first user in DB
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  let user: any;
  try {
    user = db.prepare(query).get();
  } catch (e: any) {
    // VULNERABILITY: Raw SQL error + full query leaked to client
    return NextResponse.json({ error: `Database error: ${e.message}`, query }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    full_name: user.full_name,
  });

  const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });

  // VULNERABILITY: HttpOnly not set → token readable by JS
  res.cookies.set("token", token, {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  return res;
}