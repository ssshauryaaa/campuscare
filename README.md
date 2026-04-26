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

CampusCare is packed with vulnerabilities across multiple categories. Here is a guide to finding and exploiting them:

### 💉 SQL Injection (SQLi)
*   **Search Bar (`UNION` Based):** Navigate to `/search`. The `q` query parameter is directly interpolated into the SQL query. Try searching for `%' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--` to dump the hidden flags table.
*   **Login Auth Bypass:** Navigate to `/login`. The username field is vulnerable. Enter `admin'--` or `' OR 1=1--` to bypass authentication and log in as an administrator without a password.
*   **Profile ID (`UNION` / Blind):** Navigate to a profile like `/profile/1`. The API endpoint `/api/profile/[id]` interpolates the ID. Try `/profile/0 UNION SELECT ...` to extract arbitrary database records.
*   **Search Class Filter:** The class filter dropdown on `/search` sets a `class` URL parameter that is also vulnerable to injection.

### 📜 Cross-Site Scripting (XSS)
*   **Notice Board (Stored):** Log in as an admin and create a notice on the `/admin` panel. The title and content are rendered using `dangerouslySetInnerHTML`. Injecting `<img src=x onerror=alert('XSS')>` will execute on the `/notices` and `/dashboard` pages.
*   **Search Query (Reflected):** Search for a payload like `<img src=x onerror=alert('XSS')>` on the `/search` page. The query string is reflected back into the DOM unsafely.
*   **Profile Name (Stored):** A user's `full_name` is rendered as raw HTML on their profile page (`/profile/[id]`). 
*   **Notice Board Filter Hash (DOM-based):** Visit `/notices#<img src=x onerror=alert('DOM XSS')>`. The page reads `window.location.hash` and writes it directly to the DOM.
*   **Login Error Output (Reflected):** If a login fails, the username is reflected in the error message unsafely.
*   **Feedback Admin Response (Stored):** When an admin responds to a student's feedback ticket, the response is rendered as HTML. An attacker with admin access can inject XSS that triggers when the student views their ticket.

### 🔑 Authentication & Authorization (IDOR / JWT)
*   **Profile Access Control (IDOR):** The `/api/profile/[id]` endpoint does not verify if the requester owns the profile. Any logged-in user can change the ID to read another user's personal details.
*   **Private Feedback Access (IDOR):** The `/api/feedback?id=X` endpoint allows any student to read any other student's (or admin's) private grievance tickets. Try reading ticket `id=1`!
*   **JWT Forgery:** The application may be vulnerable to weak JWT secrets or the `none` algorithm attack, allowing privilege escalation to the `admin` role.
*   **Open Redirect:** The login page uses a `?next=` parameter to redirect users post-login. It does not validate the origin, allowing redirects to external malicious domains.

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