// lib/db.ts
// Intentionally vulnerable SQLite database — Breach@trix CTF target
// DO NOT USE IN PRODUCTION

import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(path.join(process.cwd(), "campus.db"));
    db.pragma("journal_mode = WAL");
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT NOT NULL,
      password  TEXT NOT NULL,
      role      TEXT DEFAULT 'student',
      email     TEXT,
      full_name TEXT,
      class     TEXT,
      section   TEXT,
      admission_no TEXT,
      reset_token TEXT,
      reset_requested_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notices (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT,
      content    TEXT,
      author     TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      is_hidden  INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS flags (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      flag_name  TEXT,
      flag_value TEXT,
      difficulty TEXT,
      points     INTEGER,
      hint       TEXT
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT,
      subject     TEXT,
      class       TEXT,
      due_date    TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      student_id   INTEGER NOT NULL,
      content      TEXT,
      grade        TEXT,
      feedback     TEXT,
      submitted_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS verification_pins (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL,
      pin          TEXT NOT NULL,
      action       TEXT,
      action_token TEXT,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      username TEXT,
      email TEXT,
      admission_no TEXT,
      content TEXT,
      status TEXT DEFAULT 'pending',
      admin_response TEXT
    );
  `);

  // ── Seed users ────────────────────────────────────────────────────────────
  const userCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;
  if (userCount === 0) {
    db.exec(`
      INSERT INTO users (username, password, role, email, full_name, class, section, admission_no) VALUES
        ('admin',            'Admin@Campus2025', 'admin',   'sysadmin.b7.internal@campuscare.local', 'System Administrator', NULL, NULL,  'ADM001'),
        ('principal',        'principal123',     'staff',   'principal@campuscare.local', 'Dr. R. Sharma',        NULL, NULL,  'STF001'),
        ('student1',         'pass1234',         'student', 'aryan.k@student.local',      'Aryan Kumar',          'XI', 'A',   'S2024001'),
        ('student2',         'mypassword',       'student', 'priya.m@student.local',      'Priya Mehta',          'X',  'B',   'S2024002'),
        ('student3',         'qwertyuiop',       'student', 'rohan.s@student.local',      'Rohan Singh',          'XI', 'A',   'S2024003'),
        ('student4',         'password123',      'student', 'aisha.p@student.local',      'Aisha Patel',          'XII','B',   'S2024004'),
        ('student5',         'dragon123',        'student', 'karan.d@student.local',      'Karan Desai',          'IX', 'C',   'S2024005'),
        ('teacher1',         'teach@123',        'staff',   'rohit.v@staff.local',        'Mr. Rohit Verma',      NULL, NULL,  'STF002'),
        ('teacher2',         'mathgenius',       'staff',   'sneha.g@staff.local',        'Ms. Sneha Gupta',      NULL, NULL,  'STF003'),
        ('ctf_hidden_user',  'FLAG_EASY_FOUND_IT','student','hidden@nowhere.local',       'CTF Test User',        'XII','C',   'S2024999');
    `);
  }

  // ── Seed flags ────────────────────────────────────────────────────────────
  const flagCount = (db.prepare("SELECT COUNT(*) as c FROM flags").get() as any).c;
  if (flagCount === 0) {
    db.exec(`
      INSERT INTO flags (flag_name, flag_value, difficulty, points, hint) VALUES
        ('easy_recon',  'BREACH{s0urce_c0de_n3v3r_li3s}',       'easy',   50,  'Have you checked the page source? Developers forget things.'),
        ('medium_sqli', 'BREACH{uni0n_s3l3ct_ftw_123}',          'medium', 100, 'The search bar trusts your input a bit too much.'),
        ('hard_jwt',    'BREACH{n0n3_alg0r1thm_byp4ss}',         'hard',   150, 'What happens when the algorithm is... nothing?'),
        ('bonus_env',   'BREACH{.3nv_f1l3s_shou1d_b3_h1dd3n}',  'bonus',  75,  'Developers often forget to hide their secrets.'),
        ('mass_assign',      'BREACH{m4ss_4ss1gnm3nt_pr1v_3sc}',      'medium', 100, 'What happens when the register API trusts every field you send it?'),
        ('open_redirect',    'BREACH{0p3n_r3d1r3ct_phish1ng_ftw}',     'easy',   50,  'Where does the login page send you after auth — and can you control it?'),
        ('insecure_ref',     'BREACH{d1r3ct_obj_r3f_4ss1gnm3nts}',     'medium', 100, 'Can you read someone else''s assignment submissions?'),
        ('xxe_upload',       'BREACH{xxe_v14_csv_upl04d_win}',         'hard',   150, 'The resource upload endpoint parses more than just CSV data.'),
        ('rate_limit',       'BREACH{n0_r4t3_l1m1t_0tp_byp4ss}',      'medium', 100, 'How many OTP guesses does the portal allow before locking you out?'),
        ('ssti',             'BREACH{sst1_1n_n0t1c3_t3mpl4t3}',        'hard',   150, 'The admin notice template feature renders more than just text.'),
        ('cache_poison',     'BREACH{c4ch3_p01s0n_v14_h3ad3r}',        'medium', 100, 'Some headers the app reads shouldn''t be trusted from the client.'),
        ('weak_reset',       'BREACH{pr3d1ct4bl3_r3s3t_t0k3n}',        'easy',   50,  'How does the portal generate password reset tokens?');
    `);
  }

  // ── Seed notices ──────────────────────────────────────────────────────────
  const noticeCount = (db.prepare("SELECT COUNT(*) as c FROM notices").get() as any).c;
  if (noticeCount === 0) {
    db.exec(`
      INSERT INTO notices (title, content, author, is_hidden) VALUES
        ('Welcome to CampusCare',         'This portal provides access to academic resources, notices, and student information.', 'admin',    0),
        ('Parent-Teacher Meeting',        'PTM scheduled for all classes on 15th April. Parents requested 9 AM–1 PM.',            'principal',0),
        ('Annual Sports Day',             'Sports day on 20th April. Register with your class teacher.',                          'teacher1', 0),
        ('Library Books Due',             'All issued books must be returned to the library by 30th May to avoid late fees.',     'staff',    0),
        ('Summer Camp Registration',      'Summer coding and robotics camp starts June 5th. Register via your dashboard.',        'teacher2', 0),
        ('System Maintenance Scheduled',  'CampusCare will be down for scheduled maintenance this Sunday from 2 AM to 4 AM.',     'admin',    0),
        ('[INTERNAL] Admin Backup Creds', 'Emergency: admin / Admin@Campus2025 — DO NOT SHARE',                                  'admin',    1),
        ('Exam Schedule Released',        'Final exam timetable uploaded. Check your class schedule.',                            'teacher1', 0);
    `);
  }

  // ── Seed assignments ──────────────────────────────────────────────────────
  const asgCount = (db.prepare("SELECT COUNT(*) as c FROM assignments").get() as any).c;
  if (asgCount === 0) {
    db.exec(`
      INSERT INTO assignments (title, subject, class, due_date, description) VALUES
        ('Chapter 5 – Recursion',   'Computer Science', 'XI',  '2026-05-10', 'Complete exercises 5.1–5.4 from NCERT.'),
        ('Essay on Climate Change', 'English',          'X',   '2026-05-08', '500 word essay on effects of climate change.'),
        ('History Project – World War II', 'History',   'IX',  '2026-05-15', 'Prepare a 10-page project report on the major events of WWII.'),
        ('Integration Practice',    'Mathematics',      'XII', '2026-05-12', 'Solve worksheet problems distributed in class.'),
        ('Physics Practical Record',       'Physics',   'XI',  '2026-05-20', 'Complete the practical record book for the recent optics experiments.'),
        ('Lab Report – Titration',  'Chemistry',        'XI',  '2026-05-09', 'Submit titration lab report with all calculations.');
    `);
  }

  // ── Seed submissions ──────────────────────────────────────────────────────
  const subCount = (db.prepare("SELECT COUNT(*) as c FROM submissions").get() as any).c;
  if (subCount === 0) {
    db.exec(`
      INSERT INTO submissions (assignment_id, student_id, content, grade, feedback) VALUES
        (1, 3, 'Recursive Fibonacci implementation in Python.', 'A', 'Excellent work. Clean code.'),
        (2, 4, 'Climate change essay — 520 words.', 'B+', 'Good argument, needs more citations.'),
        (1, 5, 'Submitted lab notes instead of code.', 'C', 'Please resubmit with correct format.');
    `);
  }

  // ── Seed verification pins ────────────────────────────────────────────────
  const pinCount = (db.prepare("SELECT COUNT(*) as c FROM verification_pins").get() as any).c;
  if (pinCount === 0) {
    db.exec(`
      INSERT INTO verification_pins (user_id, pin, action, action_token) VALUES
        (1, '4829', 'admin_override', 'BREACH{n0_r4t3_l1m1t_0tp_byp4ss}');
    `);
  }

  // ── Seed feedback ─────────────────────────────────────────────────────────
  const feedbackCount = (db.prepare("SELECT COUNT(*) as c FROM feedback").get() as any).c;
  if (feedbackCount === 0) {
    db.exec(`
      INSERT INTO feedback (student_id, username, email, admission_no, content, status, admin_response) VALUES
        (1, 'admin', 'sysadmin.b7.internal@campuscare.local', 'ADM-0001', 'FLAG{1d0r_3xp0s3d_pr1v4t3_d4t4_420} — internal note: DB backup stored at /backup.sql', 'resolved', '<b>Resolved by admin.</b> <script>/* stored XSS bonus vector */</script>'),
        (2, 'student01', 'stu01@campus.local', 'STU-1021', 'The canteen food quality has dropped significantly this semester.', 'pending', NULL),
        (3, 'student02', 'stu02@campus.local', 'STU-1034', 'Requesting a locker near Block C.', 'resolved', '<b>Locker assigned.</b>'),
        (4, 'student03', 'stu03@campus.local', 'STU-1045', 'WiFi in the library is too slow during exam season.', 'pending', NULL),
        (5, 'student04', 'stu04@campus.local', 'STU-1056', 'Can we have more vegetarian options in the cafeteria menu?', 'pending', NULL),
        (6, 'student05', 'stu05@campus.local', 'STU-1067', 'The basketball court needs new nets before the inter-house tournament.', 'resolved', '<b>Nets have been ordered and will be installed next week.</b>');
    `);
  }
}