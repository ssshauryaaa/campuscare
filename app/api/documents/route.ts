import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file specified" }, { status: 400 });
  }

  try {
    // VULNERABILITY: Directory traversal possible via unsanitized file parameter
    const targetPath = path.join(process.cwd(), "public", "documents", file);
    
    // Check if the file exists before reading
    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const content = fs.readFileSync(targetPath, "utf-8");
    
    // Return as plain text
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("LFI Read Error:", error.message);
    return NextResponse.json({ error: "Failed to read file", detail: error.message }, { status: 500 });
  }
}
