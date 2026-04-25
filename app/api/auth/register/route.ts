// app/api/auth/register/route.ts
// VULNERABILITY: Mass Assignment — all user-supplied fields written directly to DB
// Attack: POST with {"username":"hax","password":"pw","role":"admin"} → admin account created

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // VULNERABILITY: Destructure everything from body without a whitelist
  // An attacker can send role: "admin" or role: "staff" and it gets written to the DB
  const { username, password, email, full_name, class: cls, section, admission_no, role } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const db = getDb();

  // VULNERABILITY: role comes directly from user-supplied body — not hardcoded to "student"
  const result = db.prepare(`
    INSERT INTO users (username, password, email, full_name, class, section, admission_no, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(username, password, email ?? "", full_name ?? "", cls ?? "", section ?? "", admission_no ?? "", role ?? "student");

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid) as any;

  const token = signToken({
    id: user.id,
    username: user.username,
    role: user.role, // VULNERABILITY: returns attacker-controlled role in JWT
    email: user.email,
    full_name: user.full_name,
  });

  const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  res.cookies.set("token", token, { httpOnly: false, path: "/", maxAge: 60 * 60 * 24, sameSite: "lax" });
  return res;
}