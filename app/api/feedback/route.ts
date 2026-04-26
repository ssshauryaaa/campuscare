import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import jwt from "jsonwebtoken";

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
// VULNERABLE: checks only that user is logged in, NOT that they own the record
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || req.cookies.get("jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    jwt.verify(token, process.env.JWT_SECRET || "secret");
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const db = getDb();
  // VULNERABLE: no ownership check — any authenticated user can read any record
  // Record ID=1 is seeded with admin's feedback containing the flag
  const row = db.prepare(`SELECT * FROM feedback WHERE id = ?`).get(id);

  if (!row) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // VULNERABLE: returns entire row including sensitive fields
  return NextResponse.json(row);
}
