// app/api/admin/flags/route.ts
// VULNERABILITY: Role check reads entirely from JWT payload
// Forge a token with role:"admin" (weak secret = "secret") to bypass

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // VULNERABILITY: role trusted from JWT — forge token to pass this check
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin only. Try harder." }, { status: 403 });
  }

  const db = getDb();
  const flags = db.prepare("SELECT * FROM flags").all();
  return NextResponse.json({ flags });
}