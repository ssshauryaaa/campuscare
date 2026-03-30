// app/api/admin/notices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const db = getDb();
  // Admin sees ALL notices including hidden ones — hidden one contains backup creds
  const notices = db.prepare("SELECT * FROM notices ORDER BY created_at DESC").all();
  return NextResponse.json({ notices });
}

export async function POST(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { title, content } = await req.json();
  const db = getDb();
  db.prepare("INSERT INTO notices (title, content, author) VALUES (?, ?, ?)").run(title, content, user.username);
  return NextResponse.json({ success: true });
}