import type { AttackType } from "@/types/defense";

export type VulnFile = {
  path: string;   // relative to project root, e.g. "app/api/auth/login/route.ts"
  label: string;  // shown as tab label
  vulnerableSnippet: string;  // the exact vulnerable code to highlight
  fixHint: string;            // correct/safe version shown as a hint
};

export type VulnInfo = {
  title: string;
  description: string;
  files: VulnFile[];
};

export const VULN_SNIPPETS: Partial<Record<AttackType, VulnInfo>> = {

  // ── SQLi — Login ─────────────────────────────────────────────────────────────
  sqli_login: {
    title: "SQL Injection — Login",
    description: "Username and password are interpolated directly into the SQL query string, allowing auth bypass via comments and tautologies. Review the code to locate the vulnerability.",
    files: [
      {
        path: "app/login/page.tsx",
        label: "page.tsx",
        vulnerableSnippet: `  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      // ...
    }
  };`,
        fixHint: `// The frontend is correctly sending the credentials as JSON.
// The SQL injection vulnerability is actually on the server side.
// Look at the backend route handling this request.`,
      },
      {
        path: "app/api/auth/login/route.ts",
        label: "route.ts",
        vulnerableSnippet: `const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
  const user = db.prepare(query).get();`,
        fixHint: `// FIX: Use parameterized query — never interpolate user input into SQL
  const user = db.prepare(
    "SELECT * FROM users WHERE username = ? AND password = ?"
  ).get(username, password);`,
      },
    ],
  },

  // ── SQLi — Search ─────────────────────────────────────────────────────────────
  sqli_search: {
    title: "SQL Injection — Student Search",
    description: "The search query `q` and class filter are string-interpolated into the SQL SELECT, allowing UNION-based data exfiltration.",
    files: [
      {
        path: "app/api/search/route.ts",
        label: "search/route.ts",
        vulnerableSnippet: `let sql = \`SELECT id, full_name, class, section, admission_no FROM students WHERE full_name LIKE '%\${q}%'\`;
  if (classFilter) sql += \` AND class = '\${classFilter}'\`;
  const results = db.prepare(sql).all();`,
        fixHint: `// FIX: Use parameterized queries
  let sql = "SELECT id, full_name, class, section, admission_no FROM students WHERE full_name LIKE ?";
  const params: any[] = [\`%\${q}%\`];
  if (classFilter) { sql += " AND class = ?"; params.push(classFilter); }
  const results = db.prepare(sql).all(...params);`,
      },
    ],
  },

  // ── SQLi — Profile URL ───────────────────────────────────────────────────────
  sqli_profile: {
    title: "SQL Injection — Profile URL Parameter",
    description: "The profile ID from the URL is not validated and is interpolated directly into the SQL query.",
    files: [
      {
        path: "app/api/profile/[id]/route.ts",
        label: "profile/[id]/route.ts",
        vulnerableSnippet: `// VULNERABILITY: id from URL is interpolated — UNION SELECT possible
  const profile = db.prepare(\`SELECT * FROM users WHERE id = \${id}\`).get();`,
        fixHint: `// FIX: Validate id is numeric and use parameterized query
  if (!/^\\d+$/.test(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const profile = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id));`,
      },
    ],
  },

  // ── SQLi — Class Filter ──────────────────────────────────────────────────────
  sqli_class: {
    title: "SQL Injection — Class Filter Parameter",
    description: "The ?class= URL parameter is appended directly to SQL without sanitisation.",
    files: [
      {
        path: "app/api/search/route.ts",
        label: "search/route.ts",
        vulnerableSnippet: `if (classFilter) sql += \` AND class = '\${classFilter}'\`;`,
        fixHint: `// FIX: Use a parameterized placeholder
  if (classFilter) { sql += " AND class = ?"; params.push(classFilter); }`,
      },
    ],
  },

  // ── XSS — Notice Board ───────────────────────────────────────────────────────
  xss_notices: {
    title: "Stored XSS — Notice Board",
    description: "Notice title, author, and content are rendered via dangerouslySetInnerHTML, executing any stored script payloads.",
    files: [
      {
        path: "app/notices/page.tsx",
        label: "notices/page.tsx",
        vulnerableSnippet: `<h3
  dangerouslySetInnerHTML={{ __html: highlightFn(notice.title, highlight) }}
/>
<span dangerouslySetInnerHTML={{ __html: notice.author }} />
<p dangerouslySetInnerHTML={{ __html: highlightFn(notice.content, highlight) }} />`,
        fixHint: `// FIX: Render as plain React text — no HTML injection possible
<h3>{notice.title}</h3>
<span>{notice.author}</span>
<p>{notice.content}</p>
// Or pass isXssPatched={true} to <NoticeCard> which switches to safe rendering.`,
      },
    ],
  },

  // ── XSS — Dashboard ──────────────────────────────────────────────────────────
  xss_dashboard: {
    title: "Stored XSS — Dashboard Notice Widget",
    description: "Notice titles in the dashboard quick-view widget are rendered as raw HTML.",
    files: [
      {
        path: "app/dashboard/page.tsx",
        label: "dashboard/page.tsx",
        vulnerableSnippet: `                          /* notice titles on dashboard rendered as raw HTML */
                          <h4
                            className="db-bulletin-title"
                            dangerouslySetInnerHTML={{ __html: n.title }}
                          />`,
        fixHint: `// FIX: Use safe React text rendering
<h4>{n.title}</h4>`,
      },
    ],
  },

  // ── XSS — Profile Name ───────────────────────────────────────────────────────
  xss_profile: {
    title: "Stored XSS — Profile Full Name",
    description: "The full_name field is rendered with dangerouslySetInnerHTML — a registered user can inject scripts via their name.",
    files: [
      {
        path: "app/profile/[id]/page.tsx",
        label: "profile/[id]/page.tsx",
        vulnerableSnippet: `<h1
  dangerouslySetInnerHTML={{ __html: profile.full_name }}
/>`,
        fixHint: `// FIX: Use safe React text rendering
<h1>{profile.full_name}</h1>`,
      },
    ],
  },

  // ── XSS — Search Reflected ───────────────────────────────────────────────────
  xss_search: {
    title: "Reflected XSS — Search Results Header",
    description: "The search query string is reflected back into the DOM via dangerouslySetInnerHTML in the results header.",
    files: [
      {
        path: "app/search/page.tsx",
        label: "search/page.tsx",
        vulnerableSnippet: `<div
  dangerouslySetInnerHTML={{ __html: \`Found <span>...\${searched}...</span>\` }}
/>`,
        fixHint: `// FIX: Use JSX with explicit text nodes — no HTML injection
<div>
  Found <span style={{ color:"var(--cc-orange)", fontWeight:800 }}>{results.length}</span>
  {" "}records for &ldquo;{searched}&rdquo;
</div>`,
      },
    ],
  },

  // ── XSS — DOM / Hash ─────────────────────────────────────────────────────────
  xss_dom: {
    title: "DOM-Based XSS — URL Hash",
    description: "window.location.hash is written directly into the DOM via innerHTML, enabling script execution from a crafted URL.",
    files: [
      {
        path: "app/notices/page.tsx",
        label: "notices/page.tsx",
        vulnerableSnippet: `const hash = window.location.hash.slice(1);
if (hash) {
  const filterEl = document.getElementById("filter-display");
  if (filterEl) {
    // VULNERABILITY: innerHTML set from URL hash — DOM-based XSS
    filterEl.innerHTML = \`Filtered by: \${decodeURIComponent(hash)}\`;
  }
}`,
        fixHint: `// FIX: Use textContent — never innerHTML from untrusted sources
if (filterEl) {
  filterEl.textContent = \`Filtered by: \${decodeURIComponent(hash)}\`;
}`,
      },
    ],
  },

  // ── XSS — Login Error ────────────────────────────────────────────────────────
  xss_login: {
    title: "Reflected XSS — Login Error Message",
    description: "The login error message (which may contain the username) is rendered via dangerouslySetInnerHTML.",
    files: [
      {
        path: "app/login/page.tsx",
        label: "login/page.tsx",
        vulnerableSnippet: `<p
  dangerouslySetInnerHTML={{
    __html: \`<span style="font-weight:800">Login failed for user '\${form.username}':</span> \${error}\`
  }}
/>`,
        fixHint: `// FIX: Render error as plain text — escape username
<p style={{ fontSize:12, color:"#dc2626" }}>
  Login failed for user &apos;{form.username}&apos;: {error}
</p>`,
      },
    ],
  },

  // ── Open Redirect ─────────────────────────────────────────────────────────────
  open_redirect: {
    title: "Open Redirect — ?next= Parameter",
    description: "After login, the ?next= URL parameter is used for redirect without origin validation — any external URL is accepted.",
    files: [
      {
        path: "app/login/page.tsx",
        label: "login/page.tsx",
        vulnerableSnippet: `// VULNERABILITY: redirects to any URL — no check that it starts with '/'
const nextUrl = new URLSearchParams(window.location.search).get("next");
router.push(nextUrl || "/dashboard");`,
        fixHint: `// FIX: Only allow relative paths (starting with '/')
const nextUrl = new URLSearchParams(window.location.search).get("next");
const safeNext = nextUrl && nextUrl.startsWith("/") ? nextUrl : "/dashboard";
router.push(safeNext);`,
      },
    ],
  },

  // ── IDOR — Profile ────────────────────────────────────────────────────────────
  idor_profile: {
    title: "IDOR — Profile Access Control",
    description: "Any authenticated user can fetch any other user's profile by changing the ID in the URL — no ownership check is performed.",
    files: [
      {
        path: "app/api/profile/[id]/route.ts",
        label: "profile/[id]/route.ts",
        vulnerableSnippet: `// VULNERABILITY: No ownership or role check — any user can read any profile
const profile = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id));
return NextResponse.json({ profile });`,
        fixHint: `// FIX: Verify requester owns the profile or is admin/staff
const tokenUser = verifyJWT(request.headers.get("cookie"));
if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
if (tokenUser.id !== Number(id) && tokenUser.role === "student") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
const profile = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id));`,
      },
    ],
  },

  // ── IDOR — Feedback ───────────────────────────────────────────────────────────
  idor_feedback: {
    title: "IDOR — Private Feedback Access",
    description: "Any authenticated user can fetch any other user's private feedback by changing the ticket ID in the URL — no ownership check is performed.",
    files: [
      {
        path: "app/api/feedback/route.ts",
        label: "api/feedback/route.ts",
        vulnerableSnippet: `  // VULNERABLE: no ownership check — any authenticated user can read any record
  // Record ID=1 is seeded with admin's feedback containing the flag
  const row = db.prepare(\`SELECT * FROM feedback WHERE id = ?\`).get(id);`,
        fixHint: `// FIX: Verify requester owns the feedback or is admin
  const row = db.prepare(
    "SELECT id, content, status, admin_response FROM feedback WHERE id = ? AND (student_id = ? OR ? = 'admin')"
  ).get(id, user.userId, user.role);`,
      },
    ],
  },

  // ── XSS — Feedback Admin Response ─────────────────────────────────────────────
  xss_feedback: {
    title: "Stored XSS — Feedback Admin Response",
    description: "The admin response on a feedback ticket is rendered using dangerouslySetInnerHTML, executing any injected scripts.",
    files: [
      {
        path: "app/feedback/page.tsx",
        label: "feedback/page.tsx",
        vulnerableSnippet: `            {/* Admin response rendered as HTML — secondary XSS vector */}
            {result.admin_response && (
              <div>
                <strong>Admin Response:</strong>
                <div dangerouslySetInnerHTML={{ __html: result.admin_response }} />
              </div>
            )}`,
        fixHint: `            {/* FIX: Render admin response safely without innerHTML */}
            {result.admin_response && (
              <div>
                <strong>Admin Response:</strong>
                <div>{result.admin_response}</div>
              </div>
            )}`,
      },
    ],
  },

  // ── JWT Forgery ───────────────────────────────────────────────────────────────
  jwt_forge: {
    title: "JWT Forgery — Weak Secret & None Algorithm",
    description: "The JWT verification explicitly allows the 'none' algorithm, enabling signature bypass. The secret is also hardcoded as 'secret', making it trivially brute-forceable.",
    files: [
      {
        path: "lib/auth.ts",
        label: "auth.ts",
        vulnerableSnippet: `// VULNERABILITY 1: Weak, hardcoded secret
const JWT_SECRET = process.env.JWT_SECRET ?? "secret";

// VULNERABILITY 2: 'none' algorithm explicitly allowed in verify
export function verifyToken(token: string) {
  try {
    // algorithms array includes "none" — attacker can strip signature
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256", "none"],
    }) as JwtPayload;
  } catch {
    return null;
  }
}`,
        fixHint: `// FIX 1: Use a long random secret from environment — never a default
const JWT_SECRET = process.env.JWT_SECRET!; // throw if missing

// FIX 2: Only allow HS256 — never include 'none'
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JwtPayload;
  } catch {
    return null;
  }
}`,
      },
      {
        path: "app/jwt-debug/page.tsx",
        label: "jwt-debug/page.tsx",
        vulnerableSnippet: `  // VULNERABILITY: No role check in useEffect allows any user to access this tool
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\\s*)token=([^;]+)/);
    if (!match) return;
    const t = decodeURIComponent(match[1]);
    setToken(t);
  }, []);`,
        fixHint: `// FIX: Add an authorization check to ensure only admins can access this tool.
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }
    
    // Parse token and check role
    const payload = JSON.parse(atob(match[1].split(".")[1]));
    if (payload.role !== "admin") {
      router.push("/dashboard"); // Redirect non-admins
      return;
    }
    const t = decodeURIComponent(match[1]);
    setToken(t);
  }, []);`,
      },
    ],
  },

  // ── Session Fixation ──────────────────────────────────────────────────────────
  session_fixation: {
    title: "Session Fixation — Token Valid After Logout",
    description: "The logout route only clears the client-side cookie. JWTs are stateless and have no server-side blocklist, so a copied token remains valid until natural expiry.",
    files: [
      {
        path: "app/api/auth/login/route.ts",
        label: "login/route.ts",
        vulnerableSnippet: `// VULNERABILITY: HttpOnly not set → token readable by JS → can be copied
res.cookies.set("token", token, {
  httpOnly: false,  // ← attacker can read via document.cookie
  path: "/",
  maxAge: 60 * 60 * 24,
  sameSite: "lax",
});`,
        fixHint: `// FIX: Set HttpOnly so JS can't read the token
res.cookies.set("token", token, {
  httpOnly: true,   // ← inaccessible to document.cookie
  secure: true,     // ← HTTPS only in production
  path: "/",
  maxAge: 60 * 60 * 8,  // shorter-lived sessions
  sameSite: "strict",
});`,
      },
      {
        path: "app/api/auth/logout/route.ts",
        label: "logout/route.ts",
        vulnerableSnippet: `// VULNERABILITY: No server-side token blocklist
// Clearing the cookie doesn't invalidate the token itself
// A copied token can be replayed until it expires (24h)
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  return res;
}`,
        fixHint: `// FIX: Maintain a server-side blocklist of invalidated JTIs
// On login, embed a unique jti claim; on logout, add it to the blocklist
const tokenBlocklist = new Set<string>();

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded?.jti) tokenBlocklist.add(decoded.jti);
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  return res;
}`,
      },
    ],
  },

  // ── Recon / Data Leak ─────────────────────────────────────────────────────────
  recon: {
    title: "Recon — Sensitive Data Exposure",
    description: "Admin credentials, DB paths, and JWT secrets are exposed in multiple places: HTML source comments, the /.env endpoint, and verbose error messages.",
    files: [
      {
        path: "app/page.tsx",
        label: "page.tsx",
        vulnerableSnippet: `{/* =====================================================
    Developer Notes — TODO: REMOVE BEFORE GO-LIVE
    =====================================================
    Admin panel: /admin
    Admin creds backup: admin / Admin@Campus2025
    Flag: BREACH{s0urce_c0de_n3v3r_li3s}
    DB location: ./campus.db
    Secrets: see /.env
    JWT_SECRET is set to "secret" for now — change this!
    =====================================================
*/}`,
        fixHint: `{/* FIX: Remove ALL developer comments before deployment.
    Never store credentials, file paths, or secrets in client-side HTML.
    Use environment variables managed outside the codebase.
    Run: grep -r "TODO\\|FIXME\\|password\\|secret" ./app before shipping.
*/}`,
      },
      {
        path: "app/api/env-file/route.ts",
        label: "env-file/route.ts",
        vulnerableSnippet: `// Serves the raw .env file contents to any client
import { readFileSync } from "fs";
export async function GET() {
  const content = readFileSync(".env", "utf-8");
  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
}`,
        fixHint: `// FIX: Remove this endpoint entirely, or restrict to admin-only
// Never expose .env file contents over HTTP.
// If needed for debugging, use:
export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}`,
      },
    ],
  },

  // ── LFI / Path Traversal ───────────────────────────────────────────────────────
  lfi_documents: {
    title: "Local File Inclusion — Documents",
    description: "The API endpoint uses the user-provided file name directly in fs.readFileSync without preventing directory traversal. Attackers can use ../ to escape the intended directory and read sensitive files.",
    files: [
      {
        path: "app/api/documents/route.ts",
        label: "documents/route.ts",
        vulnerableSnippet: `// VULNERABILITY: Directory traversal possible via unsanitized file parameter
  const targetPath = path.join(process.cwd(), "public", "documents", file);
  const content = fs.readFileSync(targetPath, "utf-8");`,
        fixHint: `// FIX: Use path.basename() to strip out directory traversal sequences like ../
  const safeFile = path.basename(file);
  const targetPath = path.join(process.cwd(), "public", "documents", safeFile);
  const content = fs.readFileSync(targetPath, "utf-8");`,
      },
    ],
  },
};

// ── Full source code for each vulnerability ───────────────────────────────────
// These are the complete contents of the real vulnerable files, shown in the
// FullFileViewer so defenders can read the full context around each vulnerability.
export const FULL_SOURCES: Partial<Record<AttackType, string[]>> = {

  sqli_login: [
    // index 0 = app/login/page.tsx (frontend — not the real vuln but context)
    `// app/login/page.tsx  (frontend — the POST is fine; vuln is in the route)
"use client";
// The form collects username + password and POSTs them as JSON.
// The REAL vulnerability is in the backend route handler below.
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});`,
    // index 1 = app/api/auth/login/route.ts
    `// app/api/auth/login/route.ts
// VULNERABILITY: Raw string interpolation into SQL → SQLi auth bypass
// admin'-- in username field skips password check entirely

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const db = getDb();

  // VULNERABILITY: Direct string interpolation — no prepared statement
  // Payload: username = admin'--   → logs in as admin without password
  // Payload: username = ' OR 1=1-- → logs in as first user in DB
  const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;

  let user: any;
  try {
    user = db.prepare(query).get();
  } catch (e: any) {
    // VULNERABILITY: Raw SQL error + full query leaked to client
    return NextResponse.json({ error: \`Database error: \${e.message}\`, query }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password", debug_query: query }, { status: 401 });
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role, email: user.email, full_name: user.full_name });

  const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });

  // VULNERABILITY: HttpOnly not set → token readable by JS
  res.cookies.set("token", token, { httpOnly: false, path: "/", maxAge: 60 * 60 * 24, sameSite: "lax" });

  return res;
}`,
  ],

  sqli_search: [
    `// app/api/search/route.ts
// VULNERABILITY: q param interpolated directly into SQL
// UNION attack: %' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q") ?? "";
  const classFilter = req.nextUrl.searchParams.get("class") ?? "";

  const db = getDb();

  let sql = \`SELECT id, full_name, class, section, admission_no FROM users WHERE (full_name LIKE '%\${query}%' OR username LIKE '%\${query}%')\`;

  // VULNERABILITY: class filter also injected raw
  if (classFilter) {
    sql += \` AND class = '\${classFilter}'\`;
  }

  try {
    const results = db.prepare(sql).all();
    return NextResponse.json({ results, query, class_filter: classFilter });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, query }, { status: 500 });
  }
}`,
  ],

  sqli_profile: [
    `// app/api/profile/[id]/route.ts
// VULNERABILITY: IDOR — no authorization check, any user can fetch any profile

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const db = getDb();

  let profile: any;
  try {
    // VULNERABILITY: id from URL path injected directly into query
    profile = db
      .prepare(
        \`SELECT id, username, email, full_name, class, section, admission_no, role FROM users WHERE id = \${id}\`
      )
      .get();
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}`,
  ],

  sqli_class: [
    `// app/api/search/route.ts  (same file as sqli_search)
// VULNERABILITY: class filter parameter injected raw into SQL

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q") ?? "";
  const classFilter = req.nextUrl.searchParams.get("class") ?? "";
  const db = getDb();

  let sql = \`SELECT id, full_name, class, section, admission_no FROM users WHERE (full_name LIKE '%\${query}%' OR username LIKE '%\${query}%')\`;

  // VULNERABILITY: class filter also injected raw into SQL string
  if (classFilter) {
    sql += \` AND class = '\${classFilter}'\`;
  }

  try {
    const results = db.prepare(sql).all();
    return NextResponse.json({ results, query, class_filter: classFilter });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, query }, { status: 500 });
  }
}`,
  ],

  jwt_forge: [
    `// lib/auth.ts
// VULNERABILITY: Weak JWT secret + accepts 'none' algorithm

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// VULNERABILITY: "secret" is in rockyou.txt — easily brute-forced with hashcat
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
    // VULNERABILITY: explicitly allows 'none' algorithm
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256", "none"],
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

export function getSessionUserFromRequest(req: Request): TokenPayload | null {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieMap: Record<string, string> = {};
    cookieHeader.split(";").forEach((part) => {
      const eqIdx = part.indexOf("=");
      if (eqIdx === -1) return;
      const key = part.slice(0, eqIdx).trim();
      let val = part.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      try { val = decodeURIComponent(val); } catch { /* already plain */ }
      cookieMap[key] = val;
    });
    const token = cookieMap["token"];
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}`,
    `// app/jwt-debug/page.tsx
"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Terminal, ExternalLink } from "lucide-react";
import { usePatchedVulns } from "@/hooks/useCampusDefense";

export default function JwtDebugPage() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<any>(null);
  const patchedVulns = usePatchedVulns();

  // VULNERABILITY: No role check in useEffect allows any user to access this tool
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\\s*)token=([^;]+)/);
    if (!match) return;
    const t = decodeURIComponent(match[1]);
    setToken(t);
  }, []);

  const verify = async () => {
    if (patchedVulns.has("jwt_forge")) return;
    // ... verification logic
  };

  return (
    <div>
      <Navbar />
      <h1>JWT Debugger</h1>
      <p>Internal utility for token inspection. Warning: Remove from production.</p>
      {/* UI implementation... */}
    </div>
  );
}`
  ],

  session_fixation: [
    `// app/api/auth/login/route.ts
// VULNERABILITY: HttpOnly not set → token readable by JS → can be stolen via XSS

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const db = getDb();
  const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
  const user: any = db.prepare(query).get();

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role, email: user.email, full_name: user.full_name });
  const res = NextResponse.json({ success: true });

  // VULNERABILITY: HttpOnly not set → token readable via document.cookie
  res.cookies.set("token", token, {
    httpOnly: false,  // ← attacker can read via document.cookie
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  return res;
}`,
    `// app/api/auth/logout/route.ts
// VULNERABILITY: No server-side token blocklist
// Clearing the cookie doesn't invalidate the token itself
// A copied token can be replayed until it expires (24h)

import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  // Only clears client cookie — the JWT itself is still cryptographically valid
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  return res;
}`,
  ],

  idor_feedback: [
    `// app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import jwt from "jsonwebtoken";

// POST — submit feedback (legitimate, authenticated)
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || req.cookies.get("jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user: { userId: number; username: string; email: string; admission_no: string; role?: string };
  try {
    user = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { content } = await req.json();
  const db = getDb();
  const result = db.prepare(
    \`INSERT INTO feedback (student_id, username, email, admission_no, content, status, admin_response)
     VALUES (?, ?, ?, ?, ?, 'pending', NULL)\`
  ).run(user.userId, user.username, user.email, user.admission_no, content);

  return NextResponse.json({ id: result.lastInsertRowid });
}

// GET — fetch feedback by ID
// VULNERABLE: checks only that user is logged in, NOT that they own the record
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || req.cookies.get("jwt")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    jwt.verify(token, process.env.JWT_SECRET || "secret");
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const db = getDb();
  // VULNERABLE: no ownership check — any authenticated user can read any record
  // Record ID=1 is seeded with admin's feedback containing the flag
  const row = db.prepare(\`SELECT * FROM feedback WHERE id = ?\`).get(id);

  if (!row) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // VULNERABLE: returns entire row including sensitive fields
  return NextResponse.json(row);
}`,
  ],

  recon: [
    `// app/page.tsx  (landing page — contains exposed developer comments)
// VULNERABILITY: Admin credentials and DB path exposed in HTML source

/* =====================================================
   Developer Notes — TODO: REMOVE BEFORE GO-LIVE
   =====================================================
   Admin panel: /admin
   Admin creds backup: admin / Admin@Campus2025
   Flag: BREACH{s0urce_c0de_n3v3r_li3s}
   DB location: ./campus.db
   Secrets: see /.env
   JWT_SECRET is set to "secret" for now — change this!
   =====================================================
*/

// Run: curl http://localhost:3000 | grep -i "admin\\|password\\|secret\\|flag"`,
    `// app/api/env-file/route.ts
// Simulates a misconfigured server that accidentally serves the .env file publicly
// Reachable via /.env due to next.config.ts rewrite rule

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const envPath = path.join(process.cwd(), ".env");
  const content = fs.readFileSync(envPath, "utf-8");
  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain" },
  });
}`,
  ],

  lfi_documents: [
    `// app/api/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file specified" }, { status: 400 });
  }

  try {
    // VULNERABILITY: Directory traversal possible via unsanitized file parameter
    // Payload: ?file=../../../../.env  or  ?file=../../../lib/auth.ts
    const targetPath = path.join(process.cwd(), "public", "documents", file);

    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const content = fs.readFileSync(targetPath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("LFI Read Error:", error.message);
    return NextResponse.json({ error: "Failed to read file", detail: error.message }, { status: 500 });
  }
}`,
  ],
};

