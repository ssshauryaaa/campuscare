// app/api/auth/logout/route.ts
// VULNERABILITY: Session not invalidated server-side — only client cookie cleared
// Old token remains valid if submitted directly to any API route

import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("token", "", { path: "/", maxAge: 0 });
  return res;
}