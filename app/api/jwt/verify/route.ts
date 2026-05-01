import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ valid: false, error: "No token provided" });

    const payload = verifyToken(token);
    if (payload) {
      return NextResponse.json({ valid: true, payload });
    } else {
      return NextResponse.json({ valid: false, error: "Invalid signature or malformed token" });
    }
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: e.message || "Internal server error" });
  }
}
