# CampusCare Defense Dashboard — Vulnerability Solutions Guide

This document provides the exact code snippets and solutions for all security vulnerabilities in the CampusCare platform. These solutions correspond directly to the 'Investigate' tab in the Blue Team Defense Dashboard.

---

## SQL Injection — Login

**Description:** Username and password are interpolated directly into the SQL query string, allowing auth bypass via comments and tautologies. Review the code to locate the vulnerability.

### File: `app/login/page.tsx`

**Vulnerable Code:**
```typescript
  const handleSubmit = async () => {
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
  };
```

**Solution (Patch):**
```typescript
// The frontend is correctly sending the credentials as JSON.
// The SQL injection vulnerability is actually on the server side.
// Look at the backend route handling this request.
```

### File: `app/api/auth/login/route.ts`

**Vulnerable Code:**
```typescript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = db.prepare(query).get();
```

**Solution (Patch):**
```typescript
// FIX: Use parameterized query — never interpolate user input into SQL
  const user = db.prepare(
    "SELECT * FROM users WHERE username = ? AND password = ?"
  ).get(username, password);
```

---

## SQL Injection — Student Search

**Description:** The search query `q` and class filter are string-interpolated into the SQL SELECT, allowing UNION-based data exfiltration.

### File: `app/api/search/route.ts`

**Vulnerable Code:**
```typescript
let sql = `SELECT id, full_name, class, section, admission_no FROM students WHERE full_name LIKE '%${q}%'`;
  if (classFilter) sql += ` AND class = '${classFilter}'`;
  const results = db.prepare(sql).all();
```

**Solution (Patch):**
```typescript
// FIX: Use parameterized queries
  let sql = "SELECT id, full_name, class, section, admission_no FROM students WHERE full_name LIKE ?";
  const params: any[] = [`%${q}%`];
  if (classFilter) { sql += " AND class = ?"; params.push(classFilter); }
  const results = db.prepare(sql).all(...params);
```

---

## SQL Injection — Profile URL Parameter

**Description:** The profile ID from the URL is not validated and is interpolated directly into the SQL query.

### File: `app/api/profile/[id]/route.ts`

**Vulnerable Code:**
```typescript
// VULNERABILITY: id from URL is interpolated — UNION SELECT possible
  const profile = db.prepare(`SELECT * FROM users WHERE id = ${id}`).get();
```

**Solution (Patch):**
```typescript
// FIX: Validate id is numeric and use parameterized query
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const profile = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id));
```

---

## SQL Injection — Class Filter Parameter

**Description:** The ?class= URL parameter is appended directly to SQL without sanitisation.

### File: `app/api/search/route.ts`

**Vulnerable Code:**
```typescript
if (classFilter) sql += ` AND class = '${classFilter}'`;
```

**Solution (Patch):**
```typescript
// FIX: Use a parameterized placeholder
  if (classFilter) { sql += " AND class = ?"; params.push(classFilter); }
```

---

## Stored XSS — Notice Board

**Description:** Notice title, author, and content are rendered via dangerouslySetInnerHTML, executing any stored script payloads.

### File: `app/notices/page.tsx`

**Vulnerable Code:**
```typescript
<h3
  dangerouslySetInnerHTML={{ __html: highlightFn(notice.title, highlight) }}
/>
<span dangerouslySetInnerHTML={{ __html: notice.author }} />
<p dangerouslySetInnerHTML={{ __html: highlightFn(notice.content, highlight) }} />
```

**Solution (Patch):**
```typescript
// FIX: Render as plain React text — no HTML injection possible
<h3>{notice.title}</h3>
<span>{notice.author}</span>
<p>{notice.content}</p>
// Or pass isXssPatched={true} to <NoticeCard> which switches to safe rendering.
```

---

## Stored XSS — Dashboard Notice Widget

**Description:** Notice titles in the dashboard quick-view widget are rendered as raw HTML.

### File: `app/dashboard/page.tsx`

**Vulnerable Code:**
```typescript
<h4
  dangerouslySetInnerHTML={{ __html: n.title }}
/>
```

**Solution (Patch):**
```typescript
// FIX: Use safe React text rendering
<h4>{n.title}</h4>
```

---

## Stored XSS — Profile Full Name

**Description:** The full_name field is rendered with dangerouslySetInnerHTML — a registered user can inject scripts via their name.

### File: `app/profile/[id]/page.tsx`

**Vulnerable Code:**
```typescript
<h1
  dangerouslySetInnerHTML={{ __html: profile.full_name }}
/>
```

**Solution (Patch):**
```typescript
// FIX: Use safe React text rendering
<h1>{profile.full_name}</h1>
```

---

## Reflected XSS — Search Results Header

**Description:** The search query string is reflected back into the DOM via dangerouslySetInnerHTML in the results header.

### File: `app/search/page.tsx`

**Vulnerable Code:**
```typescript
<div
  dangerouslySetInnerHTML={{ __html: `Found <span>...${searched}...</span>` }}
/>
```

**Solution (Patch):**
```typescript
// FIX: Use JSX with explicit text nodes — no HTML injection
<div>
  Found <span style={{ color:"var(--cc-orange)", fontWeight:800 }}>{results.length}</span>
  {" "}records for &ldquo;{searched}&rdquo;
</div>
```

---

## DOM-Based XSS — URL Hash

**Description:** window.location.hash is written directly into the DOM via innerHTML, enabling script execution from a crafted URL.

### File: `app/notices/page.tsx`

**Vulnerable Code:**
```typescript
const hash = window.location.hash.slice(1);
if (hash) {
  const filterEl = document.getElementById("filter-display");
  if (filterEl) {
    // VULNERABILITY: innerHTML set from URL hash — DOM-based XSS
    filterEl.innerHTML = `Filtered by: ${decodeURIComponent(hash)}`;
  }
}
```

**Solution (Patch):**
```typescript
// FIX: Use textContent — never innerHTML from untrusted sources
if (filterEl) {
  filterEl.textContent = `Filtered by: ${decodeURIComponent(hash)}`;
}
```

---

## Reflected XSS — Login Error Message

**Description:** The login error message (which may contain the username) is rendered via dangerouslySetInnerHTML.

### File: `app/login/page.tsx`

**Vulnerable Code:**
```typescript
<p
  dangerouslySetInnerHTML={{
    __html: `<span style="font-weight:800">Login failed for user '${form.username}':</span> ${error}`
  }}
/>
```

**Solution (Patch):**
```typescript
// FIX: Render error as plain text — escape username
<p style={{ fontSize:12, color:"#dc2626" }}>
  Login failed for user &apos;{form.username}&apos;: {error}
</p>
```

---

## Open Redirect — ?next= Parameter

**Description:** After login, the ?next= URL parameter is used for redirect without origin validation — any external URL is accepted.

### File: `app/login/page.tsx`

**Vulnerable Code:**
```typescript
// VULNERABILITY: redirects to any URL — no check that it starts with '/'
const nextUrl = new URLSearchParams(window.location.search).get("next");
router.push(nextUrl || "/dashboard");
```

**Solution (Patch):**
```typescript
// FIX: Only allow relative paths (starting with '/')
const nextUrl = new URLSearchParams(window.location.search).get("next");
const safeNext = nextUrl && nextUrl.startsWith("/") ? nextUrl : "/dashboard";
router.push(safeNext);
```

---

## IDOR — Profile Access Control

**Description:** Any authenticated user can fetch any other user's profile by changing the ID in the URL — no ownership check is performed.

### File: `app/api/profile/[id]/route.ts`

**Vulnerable Code:**
```typescript
// VULNERABILITY: No ownership or role check — any user can read any profile
const profile = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id));
return NextResponse.json({ profile });
```

**Solution (Patch):**
```typescript
// FIX: Verify requester owns the profile or is admin/staff
const tokenUser = verifyJWT(request.headers.get("cookie"));
if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
if (tokenUser.id !== Number(id) && tokenUser.role === "student") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
const profile = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id));
```

---

## IDOR — Private Feedback Access

**Description:** Any authenticated user can fetch any other user's private feedback by changing the ticket ID in the URL — no ownership check is performed.

### File: `app/api/feedback/route.ts`

**Vulnerable Code:**
```typescript
  // VULNERABLE: no ownership check — any authenticated user can read any record
  // Record ID=1 is seeded with admin's feedback containing the flag
  const row = db.prepare(`SELECT * FROM feedback WHERE id = ?`).get(id);
```

**Solution (Patch):**
```typescript
// FIX: Verify requester owns the feedback or is admin
  const row = db.prepare(
    "SELECT id, content, status, admin_response FROM feedback WHERE id = ? AND (student_id = ? OR ? = 'admin')"
  ).get(id, user.userId, user.role);
```

---

## Stored XSS — Feedback Admin Response

**Description:** The admin response on a feedback ticket is rendered using dangerouslySetInnerHTML, executing any injected scripts.

### File: `app/feedback/page.tsx`

**Vulnerable Code:**
```typescript
            {/* Admin response rendered as HTML — secondary XSS vector */}
            {result.admin_response && (
              <div>
                <strong>Admin Response:</strong>
                <div dangerouslySetInnerHTML={{ __html: result.admin_response }} />
              </div>
            )}
```

**Solution (Patch):**
```typescript
            {/* FIX: Render admin response safely without innerHTML */}
            {result.admin_response && (
              <div>
                <strong>Admin Response:</strong>
                <div>{result.admin_response}</div>
              </div>
            )}
```

---

## JWT Forgery — Weak Secret & None Algorithm

**Description:** The JWT verification explicitly allows the 'none' algorithm, enabling signature bypass. The secret is also hardcoded as 'secret', making it trivially brute-forceable.

### File: `lib/auth.ts`

**Vulnerable Code:**
```typescript
// VULNERABILITY 1: Weak, hardcoded secret
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
}
```

**Solution (Patch):**
```typescript
// FIX 1: Use a long random secret from environment — never a default
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
}
```

---

## Session Fixation — Token Valid After Logout

**Description:** The logout route only clears the client-side cookie. JWTs are stateless and have no server-side blocklist, so a copied token remains valid until natural expiry.

### File: `app/api/auth/login/route.ts`

**Vulnerable Code:**
```typescript
// VULNERABILITY: HttpOnly not set → token readable by JS → can be copied
res.cookies.set("token", token, {
  httpOnly: false,  // ← attacker can read via document.cookie
  path: "/",
  maxAge: 60 * 60 * 24,
  sameSite: "lax",
});
```

**Solution (Patch):**
```typescript
// FIX: Set HttpOnly so JS can't read the token
res.cookies.set("token", token, {
  httpOnly: true,   // ← inaccessible to document.cookie
  secure: true,     // ← HTTPS only in production
  path: "/",
  maxAge: 60 * 60 * 8,  // shorter-lived sessions
  sameSite: "strict",
});
```

### File: `app/api/auth/logout/route.ts`

**Vulnerable Code:**
```typescript
// VULNERABILITY: No server-side token blocklist
// Clearing the cookie doesn't invalidate the token itself
// A copied token can be replayed until it expires (24h)
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  return res;
}
```

**Solution (Patch):**
```typescript
// FIX: Maintain a server-side blocklist of invalidated JTIs
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
}
```

---

## Recon — Sensitive Data Exposure

**Description:** Admin credentials, DB paths, and JWT secrets are exposed in multiple places: HTML source comments, the /.env endpoint, and verbose error messages.

### File: `app/page.tsx`

**Vulnerable Code:**
```typescript
{/* =====================================================
    Developer Notes — TODO: REMOVE BEFORE GO-LIVE
    =====================================================
    Admin panel: /admin
    Admin creds backup: admin / Admin@Campus2025
    Flag: BREACH{s0urce_c0de_n3v3r_li3s}
    DB location: ./campus.db
    Secrets: see /.env
    JWT_SECRET is set to "secret" for now — change this!
    =====================================================
*/}
```

**Solution (Patch):**
```typescript
{/* FIX: Remove ALL developer comments before deployment.
    Never store credentials, file paths, or secrets in client-side HTML.
    Use environment variables managed outside the codebase.
    Run: grep -r "TODO\|FIXME\|password\|secret" ./app before shipping.
*/}
```

### File: `app/api/env-file/route.ts`

**Vulnerable Code:**
```typescript
// VULNERABILITY: Serves the raw .env file contents to any client
import { readFileSync } from "fs";
export async function GET() {
  const content = readFileSync(".env", "utf-8");
  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
```

**Solution (Patch):**
```typescript
// FIX: Remove this endpoint entirely, or restrict to admin-only
// Never expose .env file contents over HTTP.
// If needed for debugging, use:
export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## Local File Inclusion — Documents

**Description:** The API endpoint uses the user-provided file name directly in fs.readFileSync without preventing directory traversal. Attackers can use ../ to escape the intended directory and read sensitive files.

### File: `app/api/documents/route.ts`

**Vulnerable Code:**
```typescript
// VULNERABILITY: Directory traversal possible via unsanitized file parameter
  const targetPath = path.join(process.cwd(), "public", "documents", file);
  const content = fs.readFileSync(targetPath, "utf-8");
```

**Solution (Patch):**
```typescript
// FIX: Use path.basename() to strip out directory traversal sequences like ../
  const safeFile = path.basename(file);
  const targetPath = path.join(process.cwd(), "public", "documents", safeFile);
  const content = fs.readFileSync(targetPath, "utf-8");
```

---

