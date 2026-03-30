// app/api/profile/[id]/route.ts
// VULNERABILITY: IDOR — no check that requested id matches session user
// Any authenticated user can fetch any other user's full profile

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();

  // VULNERABILITY: No authorization check — user.id !== params.id is never verified
  const profile = db
    .prepare("SELECT id, username, email, full_name, class, section, admission_no, role FROM users WHERE id = ?")
    .get(params.id);

  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ profile });
}