# CampusCare CTF — Attacker Checklist

This checklist tracks all intentionally designed vulnerabilities within the CampusCare application. Use this to track your exploitation progress.

## 1. Authentication & Session Management
- [ ] **SQL Injection (Auth Bypass):** Bypass the login form by injecting `admin'--` into the username field, effectively dropping the password check and logging in as the administrator.
- [ ] **JWT Algorithm Confusion:** Intercept your JWT token, change the algorithm header (`alg`) to `none`, and strip the signature to forge tokens for any user (e.g., gaining `admin` role).
- [ ] **JWT Weak Secret:** Crack the JWT offline using hashcat/john with the `rockyou.txt` wordlist (the secret is hardcoded to `secret`).
- [ ] **Session Fixation:** Note that logging out only clears the client-side cookie. If you copy a JWT, it remains cryptographically valid until its 24-hour expiry, allowing session replay.
- [ ] **Weak Password Reset Tokens:** Abuse predictable or exposed password reset mechanisms (e.g., tokens found in IDOR or DB leaks).
- [ ] **OTP Rate Limit Bypass:** Brute-force OTP endpoints (if applicable) due to lack of rate limiting.

## 2. Insecure Direct Object References (IDOR)
- [ ] **Profile IDOR:** Fetch the profile data of arbitrary users (including staff/admins) by changing the ID parameter in the `/api/profile/[id]` URL.
- [ ] **Feedback IDOR:** Access private, sensitive feedback submitted by other users (including admin responses with flags) by iterating the ticket ID in `/api/feedback?id=X`.
- [ ] **Assignment Submissions IDOR:** Access other students' submissions or private grading notes by altering reference IDs.

## 3. SQL Injection (Data Exfiltration)
- [ ] **Search SQLi (UNION):** Use the student search bar to perform a UNION-based SQL injection (e.g., `%' UNION SELECT id, flag_value, difficulty, points, hint FROM flags--`) to extract CTF flags directly.
- [ ] **Profile Parameter SQLi:** Exploit the profile lookup URL parameter `/api/profile/[id]` with SQL payloads if the ID is not sanitized.
- [ ] **Class Filter SQLi:** Inject SQL commands into the `?class=` URL query parameter on the search endpoints.

## 4. Cross-Site Scripting (XSS)
- [ ] **Stored XSS (Notice Board):** Inject malicious JavaScript into the title or content of a Notice. It will execute when any user (including admins) views the Notice Board.
- [ ] **Stored XSS (Admin Dashboard):** Inject payloads via Notices that execute within the restricted admin dashboard widgets.
- [ ] **Stored XSS (Profile Name):** Register or update an account with an XSS payload in the `full_name` field.
- [ ] **Stored XSS (Feedback Response):** Read admin responses that might reflect HTML/JS payloads without escaping.
- [ ] **Reflected XSS (Search):** Craft a link with a malicious search query. The query is reflected unsanitized in the "Found X results for..." message.
- [ ] **Reflected XSS (Login Errors):** Trigger a login error with a malicious payload in the username; the error reflects the payload.
- [ ] **DOM-Based XSS (URL Hash):** Append a JavaScript payload to the URL hash (e.g., `/#<script>alert(1)</script>`) on the notices page, which uses `innerHTML`.

## 5. Other Web Vulnerabilities
- [ ] **Local File Inclusion (LFI):** Exploit the `/api/documents?file=` endpoint by using path traversal sequences (`../../../../etc/passwd` or `../../.env`) to read arbitrary files on the server.
- [ ] **Server-Side Template Injection (SSTI):** Inject template expressions (e.g., `{{ 7*7 }}`) into Notice content or titles to achieve code execution or data exposure.
- [ ] **Mass Assignment:** Pass extra parameters (e.g., `"role": "admin"`) during account registration to illegally elevate privileges.
- [ ] **Open Redirect:** Abuse the `?next=` parameter on the login page to redirect users to an external malicious site after they log in.
- [ ] **Sensitive Data Exposure (Recon):** Find developer comments in the HTML source, access the exposed `/.env` route, or examine verbose database error messages to map the infrastructure.
- [ ] **Cache Poisoning:** Manipulate HTTP headers to poison the cache for other users viewing shared pages.
