// app/api/resources/upload/route.ts
// VULNERABILITY 1: No file type validation — any file extension accepted
// VULNERABILITY 2: Server file path leaked in response
// VULNERABILITY 3: No content-type check — .php files storable as "CSV"
// VULNERABILITY 4: CSV formula injection — =cmd|'/C calc'!A0 stored raw

import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";

// VULNERABILITY: storage path is inside the public web directory — files are directly accessible
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // VULNERABILITY: role check exists but is bypassable via mass assignment vuln (Vuln 1)
  if (user.role !== "admin" && user.role !== "staff") {
    return NextResponse.json({ error: "Staff only" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // VULNERABILITY: Only checks filename extension as string — easily bypassed
  // No MIME type validation, no content inspection
  const allowedExtensions = [".csv", ".xlsx", ".pdf", ".docx"];
  const ext = path.extname(file.name).toLowerCase();
  // BUG: the check is inverted — it allows files NOT in the list due to a logic error
  // if (!allowedExtensions.includes(ext)) { <-- this line is commented out in prod
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}_${file.name}`; // VULNERABILITY: no sanitization of original filename
  const filepath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  fs.writeFileSync(filepath, buffer);

  // VULNERABILITY: Full server-side path returned to client
  return NextResponse.json({
    success: true,
    filename,
    path: filepath, // leaks absolute server path: /var/www/campuscare/public/uploads/...
    url: `/uploads/${filename}`, // file directly accessible via HTTP
    size: buffer.length,
    // VULNERABILITY: no scanning of CSV content for formula injection
    note: "File stored. CSV content will be rendered in the resources table.",
  });
}
