// lib/auth.ts
// VULNERABILITY: Weak JWT secret + accepts 'none' algorithm

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// VULNERABILITY: "secret" is in rockyou.txt — easily brute-forced with hashcat
export const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface TokenPayload {
  id: number;
  username: string;
  role: string;
  email: string;
  full_name: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    // VULNERABILITY: explicitly allows 'none' algorithm
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256", "none"],
    }) as TokenPayload;
  } catch {
    return null;
  }
}

// For use in Server Components / Route Handlers
export function getSessionUser(): TokenPayload | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

// For use in API Route Handlers (Request object)
export function getSessionUserFromRequest(req: Request): TokenPayload | null {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) return null;
    return verifyToken(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}