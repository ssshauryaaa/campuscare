// app/api/env-file/route.ts
// Simulates a misconfigured server that accidentally serves the .env file publicly
// Reachable via /.env due to next.config.ts rewrite rule

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const envPath = path.join(process.cwd(), ".env");
  const content = fs.readFileSync(envPath, "utf-8");
  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain" },
  });
}