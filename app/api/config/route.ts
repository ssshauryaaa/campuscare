// app/api/config/route.ts
// VULNERABILITY: Security Misconfiguration — debug config endpoint left exposed
// Leaks environment details and hints at JWT_SECRET location

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    app: process.env.APP_NAME ?? "CampusCare",
    environment: process.env.NODE_ENV ?? "development",
    debug: process.env.DEBUG ?? "true",
    db_path: process.env.DB_PATH ?? "./campus.db",
    jwt_expiry: process.env.JWT_EXPIRY ?? "24h",
    // VULNERABILITY: leaks partial config, hints at secret in .env
    note: "Debug endpoint — remove before production.",
    hint: "More secrets may be available in the environment configuration file.",
  });
}