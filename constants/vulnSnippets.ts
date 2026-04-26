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
        vulnerableSnippet: `<h4
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
        vulnerableSnippet: `// VULNERABILITY: Serves the raw .env file contents to any client
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
