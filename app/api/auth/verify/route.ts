// app/api/auth/verify/route.ts
// Used by /jwt-debug page to test forged tokens

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "No token provided" }, { status: 400 });

  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ valid: false, error: "Token invalid or expired" });
  }

  return NextResponse.json({
    valid: true,
    decoded,
    // VULNERABILITY: Leaks which algorithm was accepted — hints at none-attack
    note: "Token accepted. Algorithm used: " + ((decoded as any).header?.alg ?? "HS256"),
  });
}