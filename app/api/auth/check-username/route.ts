// app/api/check-username/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false });
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username.trim());

  return NextResponse.json({
    available: !existing,
  });
}