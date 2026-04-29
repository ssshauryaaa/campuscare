// app/api/documents/route.ts
// VULNERABILITY: Directory traversal — unsanitized file param allows reading any file
// PATCH: When lfi_documents is patched in DB, uses path.basename() to sanitize.

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";

function isPatched(db: ReturnType<typeof getDb>, type: string): boolean {
  return !!db.prepare("SELECT 1 FROM patches WHERE vuln_type = ?").get(type);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  if (!file) return NextResponse.json({ error: "No file specified" }, { status: 400 });

  const db = getDb();
  const lfiPatched = isPatched(db, "lfi_documents");

  let targetPath: string;

  if (lfiPatched) {
    // SECURE: strip all directory traversal — only filename, no path
    const safeFile = path.basename(file);
    if (safeFile !== file || file.includes("..")) {
      return NextResponse.json(
        { error: "🛡️ PATCHED — Directory traversal blocked. Only filenames from /public/documents are allowed." },
        { status: 403 }
      );
    }
    targetPath = path.join(process.cwd(), "public", "documents", safeFile);
  } else {
    // VULNERABILITY: Directory traversal possible via unsanitized file parameter
    targetPath = path.join(process.cwd(), "public", "documents", file);
  }

  try {
    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const content = fs.readFileSync(targetPath, "utf-8");
    return new NextResponse(content, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to read file", detail: error.message }, { status: 500 });
  }
}
