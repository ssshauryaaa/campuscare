import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import jwt from "jsonwebtoken";

function isPatched(db: ReturnType<typeof getDb>, type: string): boolean {
  return !!db.prepare("SELECT 1 FROM patches WHERE vuln_type = ?").get(type);
}

// POST — submit feedback (legitimate, authenticated)
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || req.cookies.get("jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user: { userId: number; username: string; email: string; admission_no: string; role?: string };
  try {
    user = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { content } = await req.json();
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO feedback (student_id, username, email, admission_no, content, status, admin_response)
     VALUES (?, ?, ?, ?, ?, 'pending', NULL)`
  ).run(user.userId, user.username, user.email, user.admission_no, content);

  return NextResponse.json({ id: result.lastInsertRowid });
}

// GET — fetch feedback by ID
// VULNERABLE: no ownership check (IDOR) — any authenticated user can read any ticket
// PATCH: when idor_feedback is patched, enforces ownership
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || req.cookies.get("jwt")?.value || req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const db = getDb();
  const idorPatched = isPatched(db, "idor_feedback");

  // VULNERABLE: no ownership check — any authenticated user can read any record
  // Record ID=1 is seeded with admin's feedback containing the flag
  const row = db.prepare("SELECT * FROM feedback WHERE id = ?").get(id) as any;

  if (!row) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  // PATCH — enforce ownership
  if (idorPatched && decoded.role !== "admin" && row.student_id !== decoded.id) {
    return NextResponse.json({ error: "Forbidden — you can only view your own tickets" }, { status: 403 });
  }

  return NextResponse.json(row);
}
