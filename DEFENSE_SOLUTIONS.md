# CampusCare Defense Dashboard — Vulnerability Solutions Guide

This document provides a comprehensive overview of the security vulnerabilities present in the CampusCare platform, along with their technical explanations, impact, and the recommended code patches to secure the application.

---

## Table of Contents
1. [SQL Injection (SQLi)](#1-sql-injection-sqli)
2. [Cross-Site Scripting (XSS)](#2-cross-site-scripting-xss)
3. [Insecure Direct Object Reference (IDOR)](#3-insecure-direct-object-reference-idor)
4. [Broken Authentication & Session Management](#4-broken-authentication--session-management)
5. [Sensitive Data Exposure & Reconnaissance](#5-sensitive-data-exposure--reconnaissance)
6. [Local File Inclusion (LFI)](#6-local-file-inclusion-lfi)
7. [Open Redirect](#7-open-redirect)

---

## 1. SQL Injection (SQLi)

### 1.1 Authentication Bypass (Login)
*   **Vulnerability:** User input is directly interpolated into a SQL string.
*   **Impact:** Attackers can bypass login by using tautologies (e.g., `' OR 1=1--`) or comments.
*   **Vulnerable Code (`app/api/auth/login/route.ts`):**
    ```typescript
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    const user = db.prepare(query).get();
    ```
*   **Solution:** Use parameterized queries.
    ```typescript
    const user = db.prepare(
      "SELECT * FROM users WHERE username = ? AND password = ?"
    ).get(username, password);
    ```

### 1.2 Data Exfiltration (Search)
*   **Vulnerability:** The search query and filters are string-interpolated into the SQL SELECT statement.
*   **Impact:** Attackers can use `UNION SELECT` to dump the entire database, including user credentials.
*   **Vulnerable Code (`app/api/search/route.ts`):**
    ```typescript
    let sql = `SELECT id, full_name, class, section, admission_no FROM students WHERE full_name LIKE '%${q}%'`;
    if (classFilter) sql += ` AND class = '${classFilter}'`;
    const results = db.prepare(sql).all();
    ```
*   **Solution:** Use parameterized placeholders for all user-controlled inputs.
    ```typescript
    let sql = "SELECT id, full_name, class, section, admission_no FROM students WHERE full_name LIKE ?";
    const params: any[] = [`%${q}%`];
    if (classFilter) { 
      sql += " AND class = ?"; 
      params.push(classFilter); 
    }
    const results = db.prepare(sql).all(...params);
    ```

### 1.3 Profile ID Injection
*   **Vulnerability:** The `id` parameter from the URL is used directly in a query without validation or parameterization.
*   **Impact:** Unauthorized data access via `UNION` based attacks.
*   **Vulnerable Code (`app/api/profile/[id]/route.ts`):**
    ```typescript
    const profile = db.prepare(`SELECT * FROM users WHERE id = ${id}`).get();
    ```
*   **Solution:** Validate that the ID is numeric and use parameterization.
    ```typescript
    if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const profile = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id));
    ```

---

## 2. Cross-Site Scripting (XSS)

### 2.1 Stored XSS (Notice Board & Dashboard)
*   **Vulnerability:** User-provided content (titles, author names, notice body) is rendered using `dangerouslySetInnerHTML`.
*   **Impact:** Persistent malicious scripts execute in the browsers of all users who view the notices.
*   **Vulnerable Code (`app/notices/page.tsx`):**
    ```tsx
    <h3 dangerouslySetInnerHTML={{ __html: notice.title }} />
    <span dangerouslySetInnerHTML={{ __html: notice.author }} />
    <p dangerouslySetInnerHTML={{ __html: notice.content }} />
    ```
*   **Solution:** Use standard React text nodes which automatically escape HTML entities.
    ```tsx
    <h3>{notice.title}</h3>
    <span>{notice.author}</span>
    <p>{notice.content}</p>
    ```

### 2.2 DOM-Based XSS (URL Hash)
*   **Vulnerability:** Data from `window.location.hash` is written directly to the DOM using `.innerHTML`.
*   **Impact:** Attackers can craft a URL that, when clicked, executes arbitrary JavaScript in the victim's browser.
*   **Vulnerable Code (`app/notices/page.tsx`):**
    ```javascript
    filterEl.innerHTML = `Filtered by: ${decodeURIComponent(hash)}`;
    ```
*   **Solution:** Use `.textContent` to ensure the input is treated as plain text.
    ```javascript
    filterEl.textContent = `Filtered by: ${decodeURIComponent(hash)}`;
    ```

### 2.3 Reflected XSS (Search & Login Errors)
*   **Vulnerability:** Search queries or error messages containing user input are reflected back into the page using `dangerouslySetInnerHTML`.
*   **Impact:** Transient script execution when a user follows a malicious link or submits a crafted form.
*   **Solution:** Render the reflected data as plain text or use safe JSX components.

### 2.4 Stored XSS (Feedback Admin Response)
*   **Vulnerability:** The admin response on a feedback ticket is rendered using `dangerouslySetInnerHTML`.
*   **Impact:** Malicious scripts injected by an attacker (simulating a compromised admin) execute when a student views their ticket.
*   **Vulnerable Code (`app/feedback/page.tsx`):**
    ```tsx
    <div dangerouslySetInnerHTML={{ __html: result.admin_response }} />
    ```
*   **Solution:** Render the response as a standard React child.
    ```tsx
    <div>{result.admin_response}</div>
    ```

---

## 3. Insecure Direct Object Reference (IDOR)

### 3.1 Profile Access
*   **Vulnerability:** The application fetches profiles based on ID without checking if the requester has permission to view that specific profile.
*   **Impact:** Students can view private details of other students, teachers, or administrators.
*   **Vulnerable Code (`app/api/profile/[id]/route.ts`):**
    ```typescript
    const profile = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id));
    ```
*   **Solution:** Implement an authorization check to ensure the user is either the owner of the profile or has an administrative role.
    ```typescript
    const tokenUser = verifyJWT(request.headers.get("cookie"));
    if (tokenUser.id !== Number(id) && tokenUser.role === "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    ```

### 3.2 Private Feedback Access
*   **Vulnerability:** Any authenticated user can fetch any other user's private feedback by changing the ticket ID in the URL.
*   **Impact:** Exposure of sensitive feedback tickets, which may contain flags or personal data.
*   **Vulnerable Code (`app/api/feedback/route.ts`):**
    ```typescript
    const row = db.prepare(`SELECT * FROM feedback WHERE id = ?`).get(id);
    ```
*   **Solution:** Verify requester owns the feedback or has an admin role.
    ```typescript
    const row = db.prepare(
      "SELECT id, content, status, admin_response FROM feedback WHERE id = ? AND (student_id = ? OR ? = 'admin')"
    ).get(id, user.userId, user.role);
    ```

---

## 4. Broken Authentication & Session Management

### 4.1 JWT Forgery (Weak Secret & None Algorithm)
*   **Vulnerability:** The JWT verification logic explicitly allows the `none` algorithm and uses a weak, hardcoded secret.
*   **Impact:** Attackers can modify their own role to "admin" by stripping the signature or brute-forcing the weak secret.
*   **Vulnerable Code (`lib/auth.ts`):**
    ```typescript
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256", "none"] });
    ```
*   **Solution:** Remove `none` from the allowed algorithms and use a strong secret from environment variables.
    ```typescript
    return jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ["HS256"] });
    ```

### 4.2 Session Fixation (Insecure Cookies & Lack of Invalidation)
*   **Vulnerability:** Cookies are not marked as `HttpOnly`, allowing them to be stolen via XSS. Furthermore, tokens are not invalidated on the server after logout.
*   **Impact:** Hijacked sessions remain valid until they naturally expire, even if the user logs out.
*   **Solution:**
    1.  Set `httpOnly: true` on session cookies.
    2.  Implement a server-side blocklist for JWTs that have been logged out.

---

## 5. Sensitive Data Exposure & Reconnaissance

### 5.1 Sensitive Data in Source Code
*   **Vulnerability:** HTML comments contain administrative credentials and database paths.
*   **Impact:** Attackers can gain administrative access by simply viewing the page source.
*   **Solution:** Remove all developer notes and sensitive information from client-side code.

### 5.2 Exposed Environment Files
*   **Vulnerability:** An API endpoint (`/api/env-file`) serves the raw `.env` file.
*   **Impact:** Exposure of database passwords, JWT secrets, and API keys.
*   **Solution:** Delete the endpoint. Never expose raw configuration files over HTTP.

---

## 6. Local File Inclusion (LFI)

### 6.1 Path Traversal in Document Fetching
*   **Vulnerability:** The application uses a filename from the URL to read files from the disk without sanitizing the path.
*   **Impact:** Attackers can use `../` sequences to read any file on the server (e.g., `/etc/passwd` or `.env`).
*   **Vulnerable Code (`app/api/documents/route.ts`):**
    ```typescript
    const targetPath = path.join(process.cwd(), "public", "documents", file);
    const content = fs.readFileSync(targetPath, "utf-8");
    ```
*   **Solution:** Use `path.basename()` to strip directory traversal sequences.
    ```typescript
    const safeFile = path.basename(file);
    const targetPath = path.join(process.cwd(), "public", "documents", safeFile);
    ```

---

## 7. Open Redirect

### 7.1 Unvalidated Redirect Parameter
*   **Vulnerability:** The `?next=` parameter is used for redirection after login without validating the destination.
*   **Impact:** Attackers can use the trusted CampusCare domain to redirect users to phishing sites.
*   **Vulnerable Code (`app/login/page.tsx`):**
    ```typescript
    const nextUrl = new URLSearchParams(window.location.search).get("next");
    router.push(nextUrl || "/dashboard");
    ```
*   **Solution:** Ensure the redirect URL is a relative path (starts with `/`).
    ```typescript
    const nextUrl = new URLSearchParams(window.location.search).get("next");
    const safeNext = nextUrl && nextUrl.startsWith("/") ? nextUrl : "/dashboard";
    router.push(safeNext);
    ```
