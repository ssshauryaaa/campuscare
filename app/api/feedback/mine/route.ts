import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || req.cookies.get("jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user: { userId: number; username: string; email: string; admission_no: string; role?: string };
  try {
    user = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const db = getDb();
  const rows = db.prepare(`SELECT * FROM feedback WHERE student_id = ?`).all(user.userId);

  return NextResponse.json({ feedback: rows });
}
