// app/api/search/route.ts
// VULNERABILITY: q param interpolated directly into SQL
// UNION attack: %' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q") ?? "";
  const classFilter = req.nextUrl.searchParams.get("class") ?? "";

  const db = getDb();

  let sql = `SELECT id, full_name, class, section, admission_no FROM users WHERE (full_name LIKE '%${query}%' OR username LIKE '%${query}%')`;

  // VULNERABILITY: class filter also injected raw
  if (classFilter) {
    sql += ` AND class = '${classFilter}'`;
  }

  try {
    const results = db.prepare(sql).all();
    return NextResponse.json({ results, query, class_filter: classFilter });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, query }, { status: 500 });
  }
}