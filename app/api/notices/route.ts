// app/api/notices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import os from "os";

export async function GET(req: NextRequest) {
  const db = getDb();

  // VULNERABILITY: Unvalidated Host header reflection (Cache Poisoning)
  // Attackers can set X-Forwarded-Host to point to malicious domains
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  
  // VULNERABILITY: X-Debug header discloses sensitive server configuration
  const debug = req.headers.get("x-debug") === "1";

  // Only public notices — hidden ones only visible through admin panel
  const notices = db
    .prepare("SELECT id, title, content, author, created_at FROM notices WHERE is_hidden = 0 ORDER BY created_at DESC")
    .all();

  const response: any = { 
    api_base: `https://${host}/api/v1`, // VULNERABILITY: host reflection
    notices 
  };

  if (debug) {
    response.debug_info = {
      server: os.hostname(),
      platform: os.platform(),
      node_version: process.version,
      cache_status: "MISS",
      flags: "BREACH{c4ch3_p01s0n_v14_h3ad3r}"
    };
  }

  return NextResponse.json(response);
}