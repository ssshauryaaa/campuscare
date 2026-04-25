// app/api/auth/reset/route.ts
// VULNERABILITY: Insecure predictable reset token generation
// Tokens are base64(username + ":" + timestamp)
// An attacker can generate the token for admin without email access

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { action, username, token, newPassword } = await req.json();
  const db = getDb();

  if (action === "request") {
    // VULNERABILITY: Does not verify if user exists properly, or it does but leaks the token
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // VULNERABILITY: highly predictable pseudo-random token based on public info
    const timestamp = Date.now();
    const rawToken = `${username}:${timestamp}`;
    const resetToken = Buffer.from(rawToken).toString("base64");

    db.prepare("UPDATE users SET reset_token = ?, reset_requested_at = ? WHERE id = ?")
      .run(resetToken, timestamp.toString(), user.id);

    // VULNERABILITY: Token directly leaked in API response for "debugging"
    return NextResponse.json({
      success: true,
      message: "Reset link sent to registered email.",
      debug_token: resetToken // Leaked explicitly
    });
  }

  if (action === "reset") {
    if (!token || !newPassword) return NextResponse.json({ error: "Missing token or password" }, { status: 400 });

    const user = db.prepare("SELECT * FROM users WHERE reset_token = ?").get(token) as any;
    
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // VULNERABILITY: changes password without requiring old password
    db.prepare("UPDATE users SET password = ?, reset_token = NULL WHERE id = ?").run(newPassword, user.id);

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
