// app/api/register/route.ts
// Functioning registration endpoint
// VULNERABILITY: Different error messages for existing vs non-existing usernames → username enumeration

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password, full_name, email, class: cls, section, admission_no } = body;

  // Basic validation
  if (!username || !password || !full_name) {
    return NextResponse.json(
      { error: "Full name, username and password are required." },
      { status: 400 }
    );
  }

  if (username.length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const db = getDb();

  // VULNERABILITY: Distinct error message reveals whether username exists in DB
  // An attacker can probe any username and know if it's registered just from the error code
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username.trim());
  if (existing) {
    return NextResponse.json(
      { error: `Username '${username}' is already taken. Please choose another.` },
      { status: 409 }
    );
  }

  // Also check email uniqueness (generic message — no enumeration here)
  if (email) {
    const emailTaken = db.prepare("SELECT id FROM users WHERE email = ?").get(email.trim());
    if (emailTaken) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
  }

  // Insert new user — role always 'student', never staff or admin via registration
  const result = db.prepare(`
    INSERT INTO users (username, password, role, email, full_name, class, section, admission_no)
    VALUES (?, ?, 'student', ?, ?, ?, ?, ?)
  `).run(
    username.trim(),
    password,          // VULNERABILITY: password stored in plaintext — no hashing
    email?.trim() || null,
    full_name.trim(),
    cls || null,
    section || null,
    admission_no?.trim() || null
  );

  const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid) as any;

  // Auto-login after registration
  const token = signToken({
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
    email: newUser.email,
    full_name: newUser.full_name,
  });

  const res = NextResponse.json({
    success: true,
    message: "Account created successfully.",
    user: { id: newUser.id, username: newUser.username, role: newUser.role },
  });

  // Set cookie — httpOnly: false (VULNERABILITY: JS-readable)
  res.cookies.set("token", token, {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  return res;
}