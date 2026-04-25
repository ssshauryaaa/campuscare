// app/api/profile/[id]/route.ts
// VULNERABILITY: IDOR — no authorization check, any user can fetch any profile

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const db = getDb();

  let profile: any;
  try {
    // VULNERABILITY: id from URL path injected directly into query
    profile = db
      .prepare(
        `SELECT id, username, email, full_name, class, section, admission_no, role FROM users WHERE id = ${id}`
      )
      .get();
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}