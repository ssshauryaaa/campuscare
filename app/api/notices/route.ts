// app/api/notices/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  // Only public notices — hidden ones only visible through admin panel
  const notices = db
    .prepare("SELECT id, title, content, author, created_at FROM notices WHERE is_hidden = 0 ORDER BY created_at DESC")
    .all();
  return NextResponse.json({ notices });
}