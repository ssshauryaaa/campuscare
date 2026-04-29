// app/api/search/route.ts
// VULNERABILITY: q param interpolated directly into SQL
// UNION attack: %' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--
// PATCH: When sqli_search is patched in the DB, uses parameterized queries.

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

function isPatched(db: ReturnType<typeof getDb>, type: string): boolean {
  return !!db.prepare("SELECT 1 FROM patches WHERE vuln_type = ?").get(type);
}

export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q") ?? "";
  const classFilter = req.nextUrl.searchParams.get("class") ?? "";
  const db = getDb();
  const patched = isPatched(db, "sqli_search") || isPatched(db, "sqli_class");

  try {
    let results: any[];
    if (patched) {
      // SECURE: parameterized query
      let sql = "SELECT id, full_name, class, section, admission_no FROM users WHERE (full_name LIKE ? OR username LIKE ?)";
      const params: any[] = [`%${query}%`, `%${query}%`];
      if (classFilter) { sql += " AND class = ?"; params.push(classFilter); }
      results = db.prepare(sql).all(...params);
    } else {
      // VULNERABILITY: Direct string interpolation
      let sql = `SELECT id, full_name, class, section, admission_no FROM users WHERE (full_name LIKE '%${query}%' OR username LIKE '%${query}%')`;
      if (classFilter) sql += ` AND class = '${classFilter}'`;
      results = db.prepare(sql).all();
    }
    return NextResponse.json({ results, query, class_filter: classFilter });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, query }, { status: 500 });
  }
}