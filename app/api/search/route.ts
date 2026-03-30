// app/api/search/route.ts
// VULNERABILITY: q param interpolated directly into SQL
// UNION attack: %' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Query parameter q is required" }, { status: 400 });

  const db = getDb();

  // VULNERABILITY: Direct interpolation — UNION SELECT possible
  const query = `SELECT id, full_name, class, section, admission_no FROM users WHERE full_name LIKE '%${q}%' AND role = 'student'`;

  let results: any[];
  try {
    results = db.prepare(query).all();
  } catch (e: any) {
    // VULNERABILITY: Raw error + full query exposed
    return NextResponse.json({ error: e.message, query }, { status: 500 });
  }

  return NextResponse.json({ results, count: results.length });
}