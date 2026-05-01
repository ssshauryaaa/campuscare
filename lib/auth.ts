// lib/auth.ts

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
    // In modern jsonwebtoken, passing a secret requires a signature even if "none" is allowed.
    // If we want to simulate the vulnerable behavior of accepting unsigned tokens,
    // we must check the decoded algorithm first, or pass no secret when allowing 'none'.
    const decodedUnsafe = jwt.decode(token, { complete: true });
    
    if (decodedUnsafe?.header?.alg === "none") {
      // Simulate vulnerable fallback to 'none' algorithm
      return jwt.verify(token, "", { algorithms: ["none"] }) as TokenPayload;
    }

    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as TokenPayload;
  } catch {
    return null;
  }
}

// For use in Server Components / Route Handlers
export async function getSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

// For use in API Route Handlers (Request object)
// Handles quoted values, URL-encoded values, and plain JWTs
export function getSessionUserFromRequest(req: Request): TokenPayload | null {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

    // Parse all cookies into a map first (handles edge cases better than a single regex)
    const cookieMap: Record<string, string> = {};
    cookieHeader.split(";").forEach((part) => {
      const eqIdx = part.indexOf("=");
      if (eqIdx === -1) return;
      const key = part.slice(0, eqIdx).trim();
      let val = part.slice(eqIdx + 1).trim();

      // Strip surrounding quotes (Next.js adds these for values with special chars)
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      // URL-decode
      try { val = decodeURIComponent(val); } catch { /* already plain */ }

      cookieMap[key] = val;
    });

    const token = cookieMap["token"];
    if (!token) return null;

    return verifyToken(token);
  } catch {
    return null;
  }
}