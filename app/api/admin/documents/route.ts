// app/api/admin/documents/route.ts
// Admin-only endpoint to list, create, and delete files in /public/documents/

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUserFromRequest } from "@/lib/auth";

const DOCS_DIR = path.join(process.cwd(), "public", "documents");

function ensureDir() {
    if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// ── GET — list all documents ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const user = getSessionUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    ensureDir();

    try {
        const files = fs.readdirSync(DOCS_DIR).filter(f => {
            const stat = fs.statSync(path.join(DOCS_DIR, f));
            return stat.isFile();
        });

        const documents = files.map(filename => {
            const filePath = path.join(DOCS_DIR, filename);
            const stat = fs.statSync(filePath);
            const bytes = stat.size;
            const size = bytes < 1024
                ? `${bytes} B`
                : bytes < 1024 * 1024
                    ? `${(bytes / 1024).toFixed(1)} KB`
                    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

            return {
                filename,
                size,
                modified: new Date(stat.mtime).toLocaleString("en-IN"),
            };
        });

        return NextResponse.json({ documents });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── POST — create / overwrite a document ─────────────────────────────────────
export async function POST(req: NextRequest) {
    const user = getSessionUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { filename, content } = await req.json();

    if (!filename || typeof filename !== "string" || !content) {
        return NextResponse.json({ error: "filename and content are required" }, { status: 400 });
    }

    // Prevent writing outside /public/documents via path traversal
    const safe = path.basename(filename);
    if (!safe || safe !== filename || safe.startsWith(".")) {
        return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    ensureDir();

    try {
        fs.writeFileSync(path.join(DOCS_DIR, safe), content, "utf-8");
        return NextResponse.json({ success: true, filename: safe });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── DELETE — remove a document ────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
    const user = getSessionUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { filename } = await req.json();

    if (!filename || typeof filename !== "string") {
        return NextResponse.json({ error: "filename required" }, { status: 400 });
    }

    const safe = path.basename(filename);
    const target = path.join(DOCS_DIR, safe);

    if (!fs.existsSync(target)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    try {
        fs.unlinkSync(target);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}