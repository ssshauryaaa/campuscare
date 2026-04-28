// app/api/defense/source/route.ts
// Read-only source file server for the Blue Team Codebase Explorer
// Serves a whitelisted set of project files — no editing possible

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Whitelist of files defenders are allowed to read
const ALLOWED_FILES = new Set([
  "lib/auth.ts",
  "lib/db.ts",
  "lib/logAttack.ts",
  "next.config.ts",
  ".env",
  "app/api/auth/login/route.ts",
  "app/api/auth/logout/route.ts",
  "app/api/search/route.ts",
  "app/api/profile/[id]/route.ts",
  "app/api/feedback/route.ts",
  "app/api/documents/route.ts",
  "app/api/env-file/route.ts",
  "app/api/notices/route.ts",
  "app/api/admin/route.ts",
  "app/login/page.tsx",
  "app/dashboard/page.tsx",
  "app/notices/page.tsx",
  "app/search/page.tsx",
  "app/feedback/page.tsx",
  "app/profile/[id]/page.tsx",
  "app/documents/page.tsx",
  "app/jwt-debug/page.tsx",
  "app/page.tsx",
]);

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file") ?? "";

  if (!file || !ALLOWED_FILES.has(file)) {
    return NextResponse.json({ error: "File not in allowed list" }, { status: 403 });
  }

  try {
    const filePath = path.join(process.cwd(), file);
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ content, path: file });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
