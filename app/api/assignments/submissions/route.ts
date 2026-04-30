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
  const db = getDb();

  if (!studentId) {
    if (user.role === "admin") {
      const submissions = db.prepare(`
        SELECT s.id, s.assignment_id, s.student_id, s.content, s.grade, s.feedback, s.submitted_at,
               a.title, a.subject, u.full_name as student_name, u.email as student_email
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN users u ON s.student_id = u.id
        ORDER BY s.submitted_at DESC
      `).all();
      return NextResponse.json({ submissions, count: submissions.length });
    }
    return NextResponse.json({ error: "studentId parameter required" }, { status: 400 });
  }


  // VULNERABILITY: Any authenticated student can pass studentId=1 and see admin's records
  const submissions = db.prepare(`
    SELECT s.id, s.assignment_id, s.student_id, s.content, s.grade, s.feedback, s.submitted_at,
           a.title, a.subject, u.full_name as student_name, u.email as student_email
    FROM submissions s
    JOIN assignments a ON s.assignment_id = a.id
    JOIN users u ON s.student_id = u.id
    WHERE s.student_id = ?
    ORDER BY s.submitted_at DESC
  `).all(Number(studentId)) as any[];

  // Inject flag if studentId=1 (Admin) is requested via IDOR
  if (studentId === "1" && submissions.length === 0) {
    submissions.push({
      id: 1337,
      assignment_id: 99,
      student_id: 1,
      content: "Admin diagnostic report. Flag: BREACH{d1r3ct_obj_r3f_4ss1gnm3nts}",
      grade: "A+",
      feedback: "Keep this secure.",
      submitted_at: new Date().toISOString(),
      title: "System Diagnostics",
      subject: "Administration",
      student_name: "System Administrator",
      student_email: "sysadmin.b7.internal@campuscare.local"
    });
  }

  // VULNERABILITY: leaks student_email, grade, and teacher feedback to any caller
  return NextResponse.json({ submissions, requested_student: studentId, count: submissions.length });
}
