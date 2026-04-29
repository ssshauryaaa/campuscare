// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const user = getSessionUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const db = getDb();
    // Return all columns except password
    const users = db
        .prepare(
            `SELECT id, username, role, email, full_name, class, section,
              admission_no, reset_token, reset_requested_at
       FROM users
       ORDER BY id ASC`
        )
        .all();

    return NextResponse.json({ users });
}