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
3. Open your browser and navigate to `http://localhost:3000`.

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

#### 2. SQLi — Search Bar (`UNION` Based)
*   **Location:** `/search` -> Search Input Field
*   **Vulnerability:** The `q` query parameter is directly interpolated into the SQL query, allowing an attacker to append their own SQL commands using `UNION SELECT`.
*   **How to Exploit:**
    1. Navigate to the Search page.
    2. In the search box, type: `%' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--`
    3. Press Enter. The search results table will dynamically map all columns and dump the hidden `flags` table alongside normal student records.

#### 3. SQLi — Search Class Filter
*   **Location:** `/search` -> Class Filter Dropdown (URL manipulation)
*   **Vulnerability:** The class filter dropdown sets a `class` parameter in the URL which is passed raw to the backend query.
*   **How to Exploit:**
    1. Navigate to the Search page and select a class filter.
    2. Look at the URL in your browser: `http://localhost:3000/search?q=&class=XII`
    3. Modify the URL parameter directly in your browser's address bar: `http://localhost:3000/search?q=&class=XII' UNION SELECT id,username,password,email,role,admission_no FROM users--`
    4. Hit Enter to dump the `users` table, including password hashes.

#### 4. SQLi — Profile ID (`UNION` / Blind)
*   **Location:** `/profile/[id]` (URL manipulation)
*   **Vulnerability:** The profile ID from the URL is not validated and is interpolated directly into the SQL query on the backend API.
*   **How to Exploit:**
    1. Navigate to a profile, e.g., `http://localhost:3000/profile/1`.
    2. Modify the URL ID to inject SQL: `http://localhost:3000/profile/0 UNION SELECT id,username,password,email,role,admission_no FROM users LIMIT 1--`
    3. The profile page will render the dumped data in place of the user's profile details.

---

### 📜 Cross-Site Scripting (XSS)

#### 5. Stored XSS — Notice Board
*   **Location:** `/admin` -> Post New Notice Panel
*   **Vulnerability:** Notice titles and contents are stored directly in the database and rendered using `dangerouslySetInnerHTML` on the `/notices` and `/dashboard` pages.
*   **How to Exploit:**
    1. Log in as an administrator (using the Auth Bypass SQLi above).
    2. Go to the Admin Panel (`/admin`) and find the "Post New Notice" section.
    3. In the content or title field, inject a payload: `<img src=x onerror=alert('Stored XSS!')>`
    4. Submit the notice. Any user who visits the `/notices` page or their dashboard will execute the script.

#### 6. Reflected XSS — Search Query
*   **Location:** `/search`
*   **Vulnerability:** The `q` URL parameter is reflected back to the user without sanitization when displaying the text "Found X records for '...'".
*   **How to Exploit:**
    1. Navigate to the Search page.
    2. Type the following payload directly into the search bar: `<img src=x onerror=alert('Reflected XSS')>`
    3. The payload will execute instantly as the page renders the results header.

#### 7. Stored XSS — Profile Name
*   **Location:** `/register` & `/profile/[id]`
*   **Vulnerability:** A user's `full_name` is rendered as raw HTML on their profile page.
*   **How to Exploit:**
    1. Go to the Registration page (`/register`).
    2. Fill out the form, but set your "Full Name" to: `<svg/onload=alert('Profile XSS')>`
    3. Log in and navigate to your profile page. The script will execute.

#### 8. DOM-based XSS — Notice Board Filter Hash
*   **Location:** `/notices` (URL Hash manipulation)
*   **Vulnerability:** The notices page reads `window.location.hash`, decodes it, and assigns it directly to `.innerHTML` of a display element.
*   **How to Exploit:**
    1. Open your browser and navigate to the following URL: `http://localhost:3000/notices#<img src=x onerror=alert('DOM XSS')>`
    2. The browser processes the hash strictly on the client side, bypassing server-side WAFs, and writes the malicious tag directly into the DOM.

#### 9. Reflected XSS — Login Error Output
*   **Location:** `/login` -> Username Input Field
*   **Vulnerability:** If a login attempt fails, the error message reflects the username you provided using `dangerouslySetInnerHTML`.
*   **How to Exploit:**
    1. Go to the Login page.
    2. Enter a malicious username: `<img src=x onerror=alert('Login Error XSS')>`
    3. Enter a wrong password and click Login. The UI attempts to display "Login failed for user...", triggering the payload.

#### 10. Stored XSS — Feedback Admin Response
*   **Location:** `/feedback`
*   **Vulnerability:** When an admin responds to a student's feedback ticket, the response is rendered as HTML.
*   **How to Exploit:**
    1. Log in as an admin.
    2. Forge a request (using an API tool or DevTools) to update a feedback ticket's `admin_response` with: `<img src=x onerror=alert('Feedback XSS')>`.
    3. When the student checks their feedback ticket using the "View Feedback by Ticket ID" lookup tool, the script will execute.

---

### 🔑 Authentication & Authorization (IDOR / Session)

#### 11. IDOR — Profile Access Control
*   **Location:** `/profile/[id]`
*   **Vulnerability:** The `/api/profile/[id]` endpoint does not verify if the requester owns the profile.
*   **How to Exploit:**
    1. Log in as a standard student (e.g., `student1`).
    2. You are assigned a profile ID (e.g., ID 3). Note your own profile URL: `/profile/3`.
    3. Change the number in the URL to `1` or `2` (`/profile/1`) to view the private profile details (email, role, admission number) of administrators and teachers.

#### 12. IDOR — Private Feedback Access
*   **Location:** `/feedback` -> "View Feedback by Ticket ID"
*   **Vulnerability:** The feedback lookup tool allows any student to read any other user's private grievance tickets.
*   **How to Exploit:**
    1. Log in as a standard student.
    2. Go to the `/feedback` page.
    3. In the "View Feedback by Ticket ID" input box, enter `1` and click Lookup.
    4. You will retrieve the admin's private feedback ticket, which contains a hidden flag and sensitive server file paths!

#### 13. Open Redirect
*   **Location:** `/login` -> URL `?next=` parameter
*   **Vulnerability:** The login page uses a `?next=` parameter to redirect users post-login but does not validate the origin.
*   **How to Exploit:**
    1. Craft a malicious login link: `http://localhost:3000/login?next=https://evil-phishing-domain.com`
    2. If a victim logs in using this link, they will be seamlessly redirected to the external malicious site immediately after authentication.

#### 14. Session Fixation & JWT Weakness
*   **Location:** Application-wide Cookies
*   **Vulnerability:** JWTs might lack expiration validation or suffer from weak signing keys.
*   **How to Exploit:**
    1. Open Browser DevTools (F12) -> Application -> Cookies.
    2. Copy the `jwt` token value.
    3. You can paste this token into another browser session to hijack the account, or use a tool like `jwt.io` to inspect the payload. If the secret is weak, you can forge a new token with `"role": "admin"`.

---

## 🛡️ Blue Team: Defense Dashboard

In addition to the offensive experience, CampusCare features a fully gamified **Blue Team Defense Console**. Defenders can detect, acknowledge, and patch vulnerabilities in real-time.

### Accessing the Console
Log in as an administrator (e.g., username `admin`, bypass password using SQLi or use default creds) and navigate to the **Defense Console** via the sidebar, or go directly to `/defense`.

### Features
1. **Real-Time Threat Feed:** Watch simulated attacks and your own red-team exploits appear in the log feed in real-time. Critical severity events trigger visual alarms.
2. **Threat Inspector:** Click on any event to inspect the raw payload, source IP, and HTTP metadata.
3. **Interactive Remediation Workflow:**
   *   **Acknowledge Threat:** Triage the event and earn initial points.
   *   **Fix Vulnerability Code:** Opens an integrated **IDE Modal**.
4. **Integrated IDE Modal:** 
   *   Explore a multi-file tab layout to locate the vulnerability across frontend (`page.tsx`) and backend (`route.ts`) files.
   *   Write the patch code directly in the browser. Use the built-in hint system if you get stuck.
5. **Instant Patch Enforcement:** Once a patch is deployed via the IDE, the fix is instantly enforced across the application. The vulnerable routes will automatically block future exploit payloads and display a green `🛡️ PATCHED` banner to attackers.

---

*Happy Hacking (and Defending)! Remember to use Incognito mode if testing session-destroying payloads.*