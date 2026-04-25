// app/api/assignments/submissions/route.ts
// VULNERABILITY: IDOR — studentId taken from query param, never checked against session
// Attack: /api/assignments/submissions?studentId=1 → fetches admin's submissions

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // VULNERABILITY: reads studentId from the URL — never verified against user.id
  const studentId = req.nextUrl.searchParams.get("studentId");
  
  if (!studentId) {
    return NextResponse.json({ error: "studentId parameter required" }, { status: 400 });
  }

  const db = getDb();

  // VULNERABILITY: Any authenticated student can pass studentId=1 and see admin's records
  const submissions = db.prepare(`
    SELECT s.id, s.assignment_id, s.student_id, s.content, s.grade, s.feedback, s.submitted_at,
           a.title, a.subject, u.full_name as student_name, u.email as student_email
    FROM submissions s
    JOIN assignments a ON s.assignment_id = a.id
    JOIN users u ON s.student_id = u.id
    WHERE s.student_id = ?
    ORDER BY s.submitted_at DESC
  `).all(Number(studentId));

  // VULNERABILITY: leaks student_email, grade, and teacher feedback to any caller
  return NextResponse.json({ submissions, requested_student: studentId, count: submissions.length });
}
