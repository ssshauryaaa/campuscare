# CampusCare CTF 🎓

Welcome to the **CampusCare CTF Environment**! On the surface, this application appears to be a standard student management system. However, beneath the hood, it is a purposely vulnerable application designed for security training. 

Whether you are practicing offensive security (Red Team) or defensive remediation (Blue Team), CampusCare provides a full-circle gamified experience.

**Note:** No source code access is required to exploit this application. All attacks can be executed using input fields, URL manipulation, and browser DevTools.

---

## 🚀 Getting Started

To run the application locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `<YOUR_DOMAIN_OR_IP>`.

---

## 🎯 Red Team: Vulnerability Catalog

CampusCare is packed with vulnerabilities across multiple categories. Here is a step-by-step guide to finding and exploiting each one directly from the frontend UI:

### 💉 SQL Injection (SQLi)

#### 1. SQLi — Login Auth Bypass
*   **Location:** `/login` -> Username Input Field
*   **Vulnerability:** The username field is vulnerable to SQL injection because user input is directly concatenated into the database query without sanitization.
*   **How to Exploit:** 
    1. Navigate to the Login page.
    2. In the "Username" field, type: `admin'--` or `' OR 1=1--`
    3. Type anything in the "Password" field (e.g., `123`).
    4. Click "Login". The backend query will comment out the password check, granting you access to the administrator account without knowing the real password.

#### 2. SQLi — Search Bar (`UNION` / `OR 1=1`)
*   **Location:** `/search` -> Search Input Field
*   **Vulnerability:** The `q` query parameter is directly interpolated into the SQL query inside parentheses `(...)`, allowing an attacker to break out using `')` and append their own SQL commands.
*   **How to Exploit:**
    1. Navigate to the Search page.
    2. **To Dump the Entire Table (Auth Bypass style):**
       In the search box, type: `%') OR 1=1--`
       Press Enter. The database will ignore the search filter and return every student record at once.
    3. **To Exfiltrate CTF Flags (UNION Based):**
       In the search box, type: `%') UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--`
       Press Enter. The search results table will dynamically map all columns and dump the hidden `flags` table alongside normal student records.

#### 3. SQLi — Search Class Filter
*   **Location:** `/search` -> Class Filter Dropdown (URL manipulation)
*   **Vulnerability:** The class filter dropdown sets a `class` parameter in the URL which is passed raw to the backend query.
*   **How to Exploit:**
    1. Navigate to the Search page and select a class filter.
    2. Look at the URL in your browser: `<YOUR_DOMAIN_OR_IP>/search?q=&class=XII`
    3. Modify the URL parameter directly in your browser's address bar: `<YOUR_DOMAIN_OR_IP>/search?q=&class=XII' UNION SELECT id,username,password,role,admission_no FROM users--`
    4. Hit Enter to dump the `users` table, including password hashes.

#### 4. SQLi — Profile ID (`UNION` / Blind)
*   **Location:** `/profile/[id]` (URL manipulation)
*   **Vulnerability:** The profile ID from the URL is not validated and is interpolated directly into the SQL query on the backend API.
*   **How to Exploit:**
    1. Navigate to a profile, e.g., `<YOUR_DOMAIN_OR_IP>/profile/1`.
    2. Modify the URL ID to inject SQL: `<YOUR_DOMAIN_OR_IP>/profile/0 UNION SELECT id,username,email,password,NULL,NULL,admission_no,role FROM users LIMIT 1--`
    3. The profile page will render the dumped password as the user's "full_name" and their role under "Security Role".

---


### 🔑 Authentication & Authorization (IDOR / Session)

#### 11. IDOR — Profile Access Control
*   **Location:** `/profile/[id]`
*   **Vulnerability:** The `/api/profile/[id]` endpoint does not verify if the requester owns the profile.
*   **How to Exploit:**
    1. Log in as a standard student (e.g., `student1`).
    2. You are assigned a profile ID (e.g., ID 3). Note your own profile URL: `/profile/3`.
    3. Change the number in the URL to `1` or `2` (`/profile/1`) to view the private profile details (email, role, admission number) of administrators and teachers.
    4. Scroll to the bottom of the admin profile (`/profile/1`) to find a "Privileged profile access" box containing a base64 string: `QlJFQUNIezFkMHJfNGRtMW5fcHIwZjFsM19wd259`
    5. Decode this string (e.g., using `atob()` or an online base64 decoder) to reveal the hidden CTF flag: `BREACH{1d0r_4dm1n_pr0f1l3_pwn}`

#### 12. IDOR — Private Feedback Access
*   **Location:** `/feedback` -> "View Feedback by Ticket ID"
*   **Vulnerability:** The feedback lookup tool allows any student to read any other user's private grievance tickets.
*   **How to Exploit:**
    1. Log in as a standard student.
    2. Go to the `/feedback` page.
    3. In the "View Feedback by Ticket ID" input box, enter `1` and click Lookup.
    4. You will retrieve the admin's private feedback ticket, which contains a hidden flag and sensitive server file paths!

#### 13. IDOR — Hidden Notice Flag
*   **Location:** `/notices` -> URL `?id=` parameter
*   **Vulnerability:** A hidden notice contains a flag. The endpoint serves notices based on an unverified ID.
*   **How to Exploit:**
    1. Navigate to the Notices page (`<YOUR_DOMAIN_OR_IP>/notices`).
    2. Observe a "Teachers Only" notice asking staff to check `?id=60`. 
    3. The instruction implies that the ID parameter is exposed. Fuzzing or changing the URL to `<YOUR_DOMAIN_OR_IP>/notices?id=69` will return the hidden notice containing the CTF flag.

#### 14. IDOR — Assignment Submissions
*   **Location:** `/assignments/submissions` -> URL `?studentId=` parameter
*   **Vulnerability:** The submissions endpoint fetches grades and feedback based solely on the `studentId` query parameter, without verifying it against the authenticated user's session.
*   **How to Exploit:**
    1. Log in as a standard student.
    2. Click on "View My Submissions" and observe the URL (e.g., `<YOUR_DOMAIN_OR_IP>/assignments/submissions?studentId=3`).
    3. Modify the URL parameter to `<YOUR_DOMAIN_OR_IP>/assignments/submissions?studentId=1` to view the admin's private diagnostic submission, which contains a CTF flag and sensitive feedback.

#### 15. Open Redirect
*   **Location:** `/login` -> URL `?next=` parameter
*   **Vulnerability:** The login page uses a `?next=` parameter to redirect users post-login but does not validate the origin.
*   **How to Exploit:**
    1. Craft a malicious login link: `<YOUR_DOMAIN_OR_IP>/login?next=https://evil-phishing-domain.com`
    2. If a victim logs in using this link, they will be seamlessly redirected to the external malicious site immediately after authentication.

#### 16. JWT Forgery (Algorithm Confusion & Leak)
*   **Location:** `/jwt-debug` and Application-wide Cookies
*   **Vulnerability:** The application's JWT implementation is flawed in two ways: it accepts the `none` algorithm (unprotected tokens) and uses a hardcoded, leakable secret.
*   **How to Exploit:**
    1.  **Algorithm Confusion (Easy):** 
        - Navigate to the hidden `/jwt-debug` developer utility.
        - Load your current token into the **Interactive Builder**.
        - Change the header `alg` to `"none"`.
        - Change the payload `role` to `"admin"`.
        - Strip the signature (leave it blank), click **Compile**, then **Apply Cookie**.
        - You will be granted admin access without needing a secret!
    2.  **Secret Recovery (Harder):** 
        - Use the LFI vulnerability to read `.env` or `computer_science_textbook.txt` to find the `JWT_SECRET` (`thisisbreach`).
        - Forge a valid `HS256` token using an external tool like `jwt.io` or the built-in debugger with the secret.
    3.  **Visual Indicator:** If successful, a red **JWT FORGED** tag will appear next to your profile icon in the navigation bar.

---

### 📂 File System / Directory Traversal

#### 15. Local File Inclusion (LFI) — Document Viewer
*   **Location:** `/documents` -> URL `?file=` parameter
*   **Vulnerability:** The backend API reads files from the disk using the user-provided filename without sanitizing directory traversal sequences.
*   **How to Exploit:**
    1. Navigate to the Campus Documents page (`/documents`).
    2. Click on a document and observe the URL (e.g., `?file=handbook.txt`).
    3. Modify the URL parameter directly in your address bar: `<YOUR_DOMAIN_OR_IP>/documents?file=../../.env`
    4. Press Enter. The server will escape its public directory and dump its highly sensitive `.env` file directly into the document viewer.

---

## 🛡️ Blue Team: Defense Dashboard

The **Blue Team Defense Dashboard** (`/defense`) has been overhauled into a professional security operations center (SOC) with a clean, tabbed interface for streamlined monitoring and remediation.

### 🗂️ 5-Tab Command Center
*   **📡 Live Logs:** Real-time intrusion detection. Watch simulated and manual attack traffic. Click any row to acknowledge the threat and triage it for investigation.
*   **🔍 Investigate:** Your active threat queue. Each card reveals attack details and provides access to the **Full File Source Viewer** and the **Patch IDE**.
*   **🛡️ Vuln Scan:** An integrated vulnerability scanner. Once a scan completes, you can click **Investigate →** next to any finding to instantly move it to your investigation queue.
*   **🧰 Tools:** A defender's utility belt:
    *   **JWT Debugger:** An "internal" tool accidentally left in production (viewable at `/jwt-debug`). Use it to test token integrity and understand how attackers manipulate claims.
    *   **Request Log:** Reconstruct raw HTTP requests (Headers, Payloads, IPs) as they appear over the wire.
    *   **Quick Reference:** A built-in encyclopedia on how to detect, exploit, and fix every vulnerability in the app.
*   **📁 Codebase:** A read-only **VS Code-style Explorer**. Browse the entire backend source code and explore the **SQLite Database Schema** to identify sensitive tables and weak column definitions.

### ⌨️ Professional "Fix Code" Workflow
Remediation now requires deeper analysis and hunting:
1.  **Acknowledge:** Triage the event in the Logs tab to move it to your investigation queue.
2.  **Investigate:** Open the **Full-File Source Viewer**. Unlike simple snippets, you must now read the entire source file with line numbers and red-highlighted vulnerable blocks to understand the full context of the flaw.
3.  **Patch (CampusCare IDE):**
    *   **Full Context View:** The IDE shows the complete source file on the left.
    *   **Precision Patching:** Identify the vulnerable lines and write the secure replacement on the right.
    *   **Manual Review Override:** For complex vulnerabilities or configuration-based fixes (like deleting the `jwt-debug` page), use the **Mark Patched (Manual)** button to bypass the diff engine and secure the endpoint immediately.
    *   **Deploy & Enforce:** Deploying the patch earns points (e.g., +100 pts) and system-wide protection.

### 🛡️ Dynamic Patch Enforcement
Once a patch is deployed:
*   **Global Protection:** The vulnerability is neutralized. Attackers attempting the exploit will see a professional **🛡️ PATCHED** banner, and their requests will be blocked at the network level.
*   **Score Gain:** Defenders only earn points for successful patches, emphasizing remediation over simple detection.


---

## 🔧 Event Administration

When running CampusCare as a live CTF event, organizers need a way to reset the environment between rounds or teams.

*   **Location:** `/admin/reset` (Not linked in the main UI)
*   **Password:** `breach@trix2025`
*   **Features:**
    *   **Full Environment Reset:** Clears all browser `localStorage` state (Patched vulnerabilities, Real attack logs, Scanner state).
    *   **State Snapshot:** View exactly which defensive systems are currently active.
    *   **Live Log:** Watch the reset operations execute in real-time.

---

*Happy Hacking (and Defending)! Remember to use Incognito mode if testing session-destroying payloads.*