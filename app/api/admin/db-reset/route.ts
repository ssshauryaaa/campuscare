// app/api/admin/db-reset/route.ts
// Wipes and re-seeds mutable CTF tables back to their original state.
// Preserves: users, flags, assignments (stable game data)
// Resets:    notices, feedback, submissions, verification_pins, patches, attacks
// Password protected — only the event admin should call this.

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_RESET_PASSWORD ?? "breach@trix2025";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  try {
    db.exec(`
      -- Clear attack state
      DELETE FROM patches;
      DELETE FROM attacks;

      -- Reset mutable CTF tables
      DELETE FROM notices;
      DELETE FROM feedback;
      DELETE FROM submissions;
      DELETE FROM verification_pins;

      -- Reset autoincrement counters
      DELETE FROM sqlite_sequence WHERE name IN ('notices','feedback','submissions','verification_pins');

      -- Re-seed notices (original 8 rows)
      INSERT INTO notices (title, content, author, is_hidden) VALUES
        ('Welcome to CampusCare',         'This portal provides access to academic resources, notices, and student information.', 'admin',    0),
        ('Parent-Teacher Meeting',        'PTM scheduled for all classes on 15th April. Parents requested 9 AM–1 PM.',            'principal',0),
        ('Annual Sports Day',             'Sports day on 20th April. Register with your class teacher.',                          'teacher1', 0),
        ('Library Books Due',             'All issued books must be returned to the library by 30th May to avoid late fees.',     'staff',    0),
        ('Summer Camp Registration',      'Summer coding and robotics camp starts June 5th. Register via your dashboard.',        'teacher2', 0),
        ('System Maintenance Scheduled',  'CampusCare will be down for scheduled maintenance this Sunday from 2 AM to 4 AM.',     'admin',    0),
        ('[INTERNAL] Admin Backup Creds', 'Emergency: admin / Admin@Campus2025 — DO NOT SHARE',                                  'admin',    1),
        ('Exam Schedule Released',        'Final exam timetable uploaded. Check your class schedule.',                            'teacher1', 0);

      -- Re-seed feedback (original 6 rows — IDOR target is row id=1)
      INSERT INTO feedback (student_id, username, email, admission_no, content, status, admin_response) VALUES
        (1, 'admin',     'sysadmin.b7.internal@campuscare.local', 'ADM-0001', 'FLAG{1d0r_3xp0s3d_pr1v4t3_d4t4_420} — internal note: DB backup stored at /backup.sql', 'resolved', '<b>Resolved by admin.</b> <script>/* stored XSS bonus vector */</script>'),
        (2, 'student01', 'stu01@campus.local', 'STU-1021', 'The canteen food quality has dropped significantly this semester.',         'pending',  NULL),
        (3, 'student02', 'stu02@campus.local', 'STU-1034', 'Requesting a locker near Block C.',                                         'resolved', '<b>Locker assigned.</b>'),
        (4, 'student03', 'stu03@campus.local', 'STU-1045', 'WiFi in the library is too slow during exam season.',                       'pending',  NULL),
        (5, 'student04', 'stu04@campus.local', 'STU-1056', 'Can we have more vegetarian options in the cafeteria menu?',                'pending',  NULL),
        (6, 'student05', 'stu05@campus.local', 'STU-1067', 'The basketball court needs new nets before the inter-house tournament.',    'resolved', '<b>Nets have been ordered and will be installed next week.</b>');

      -- Re-seed submissions
      INSERT INTO submissions (assignment_id, student_id, content, grade, feedback) VALUES
        (1, 3, 'Recursive Fibonacci implementation in Python.', 'A',  'Excellent work. Clean code.'),
        (2, 4, 'Climate change essay — 520 words.',             'B+', 'Good argument, needs more citations.'),
        (1, 5, 'Submitted lab notes instead of code.',          'C',  'Please resubmit with correct format.');

      -- Re-seed verification pin (OTP brute-force target)
      INSERT INTO verification_pins (user_id, pin, action, action_token) VALUES
        (1, '4829', 'admin_override', 'BREACH{n0_r4t3_l1m1t_0tp_byp4ss}');
    `);

    return NextResponse.json({
      ok: true,
      message: "Database reset to original seed state. patches, attacks, notices, feedback, submissions, verification_pins — all restored.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
