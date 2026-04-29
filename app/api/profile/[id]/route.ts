// app/api/profile/[id]/route.ts
// VULNERABILITY: IDOR + SQLi — no ownership check, id injected raw into query
// PATCH: When idor_profile / sqli_profile are patched in DB, both are enforced.

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

function isPatched(db: ReturnType<typeof getDb>, type: string): boolean {
  return !!db.prepare("SELECT 1 FROM patches WHERE vuln_type = ?").get(type);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await context.params;
  const db = getDb();
  const sqliPatched = isPatched(db, "sqli_profile") || isPatched(db, "sqli_search");
  const idorPatched = isPatched(db, "idor_profile");

  // PATCH — validate numeric ID when SQLi is patched
  if (sqliPatched && (!/^\d+$/.test(id))) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
  if (!id) return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

  // PATCH — enforce ownership when IDOR is patched
  if (idorPatched && user.role === "student" && String(user.id) !== id) {
    return NextResponse.json({ error: "Forbidden — you can only view your own profile" }, { status: 403 });
  }

  let profile: any;
  try {
    if (sqliPatched) {
      // SECURE: parameterized query
      profile = db.prepare(
        "SELECT id, username, email, full_name, class, section, admission_no, role FROM users WHERE id = ?"
      ).get(Number(id));
    } else {
      // VULNERABILITY: id injected raw — UNION SELECT possible
      profile = db.prepare(
        `SELECT id, username, email, full_name, class, section, admission_no, role FROM users WHERE id = ${id}`
      ).get();
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ profile });
}