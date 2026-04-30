// app/api/admin/notices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const db = getDb();
  // Admin sees ALL notices including hidden ones — hidden one contains backup creds
  const notices = db.prepare("SELECT * FROM notices ORDER BY created_at DESC").all();
  return NextResponse.json({ notices });
}

export async function POST(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { title, content } = await req.json();
  const db = getDb();

  // VULNERABILITY: Server-Side Template Injection (SSTI)
  // Evaluates text between {{ and }} as arbitrary JavaScript within the Node.js context
  const processTemplate = (text: string) => {
    return text.replace(/\\{\\{([^}]+)\\}\\}/g, (match, expr) => {
      try {
        // e.g. {{ process.env.NODE_ENV }} executes process.env.NODE_ENV
        return eval(expr);
      } catch (err) {
        return `[Template Error: ${err}]`;
      }
    });
  };

  const processedContent = processTemplate(content);

  db.prepare("INSERT INTO notices (title, content, author) VALUES (?, ?, ?)").run(title, processedContent, user.username);
  return NextResponse.json({ success: true, processed_preview: processedContent });
}

export async function DELETE(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await req.json();
  const db = getDb();
  
  db.prepare("DELETE FROM notices WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}