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
      admission_no TEXT
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
  `);

  // ── Seed users ────────────────────────────────────────────────────────────
  const userCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;
  if (userCount === 0) {
    db.exec(`
      INSERT INTO users (username, password, role, email, full_name, class, section, admission_no) VALUES
        ('admin',            'Admin@Campus2025', 'admin',   'admin@campuscare.local',     'System Administrator', NULL, NULL,  'ADM001'),
        ('principal',        'principal123',     'staff',   'principal@campuscare.local', 'Dr. R. Sharma',        NULL, NULL,  'STF001'),
        ('student1',         'pass1234',         'student', 'aryan.k@student.local',      'Aryan Kumar',          'XI', 'A',   'S2024001'),
        ('student2',         'mypassword',       'student', 'priya.m@student.local',      'Priya Mehta',          'X',  'B',   'S2024002'),
        ('teacher1',         'teach@123',        'staff',   'rohit.v@staff.local',        'Mr. Rohit Verma',      NULL, NULL,  'STF002'),
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
        ('bonus_env',   'BREACH{.3nv_f1l3s_shou1d_b3_h1dd3n}',  'bonus',  75,  'Developers often forget to hide their secrets.');
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
        ('Integration Practice',    'Mathematics',      'XII', '2026-05-12', 'Solve worksheet problems distributed in class.'),
        ('Lab Report – Titration',  'Chemistry',        'XI',  '2026-05-09', 'Submit titration lab report with all calculations.');
    `);
  }
}