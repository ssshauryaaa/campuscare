# 🔴 RED TEAM CHECKLIST — Breach@trix Finals

**Event:** CampusCare Security CTF · Finals  
**Duration:** 45 minutes  
**Target:** `http://localhost:3000`  
**Stack:** Next.js (App Router) · Node.js · SQLite  

---

> ✅ Complete tasks in any order. Submit **flags** to the organizer for points.  
> Each task has a **difficulty tag**, a **point value**, and a **hint** to get you started.  
> Flags are always in the format: `BREACH{...}`

---

## 🟢 PHASE 1 — RECONNAISSANCE (Easy)

### ☐ Task 1 — Source Code Recon
> **+50 pts** · `EASY`

**Objective:** Developers sometimes leave sensitive information in HTML comments.

1. Open the CampusCare homepage (`/`)
2. Right-click → **View Page Source** (`Ctrl+U`)
3. Search for comments: `<!-- ...`
4. Find the hidden admin credentials buried in a developer note

**Flag location:** Hidden in an HTML comment in `app/page.tsx`  
**Hint:** Look for words like `admin`, `password`, or `emergency`

---

### ☐ Task 2 — Exposed .env File
> **+75 pts** · `EASY`

**Objective:** A rogue API endpoint serves the application's secret configuration file.

1. Navigate to: `http://localhost:3000/api/env-file`
2. Read the exposed secrets — JWT key, DB path, admin credentials

**Flag location:** Inside the `.env` file served by the API  
**Hint:** Check the URL directly — no auth needed

---

## 🟡 PHASE 2 — EXPLOITATION (Medium)

### ☐ Task 3 — SQL Injection: Auth Bypass
> **+100 pts** · `MEDIUM`

**Objective:** Bypass the login form without knowing the admin password.

1. Go to `/login`
2. In the **Username** field, enter: `admin'--`
3. Enter anything in the Password field
4. Click Login — you should be logged in as the administrator

**Hint:** The `--` comments out the rest of the SQL query, removing the password check  
**Bonus:** Also try `' OR 1=1--` in the username field

---

### ☐ Task 4 — SQL Injection: UNION SELECT Data Dump
> **+100 pts** · `MEDIUM`

**Objective:** Dump hidden flags from the database via the search bar.

1. Go to `/search`
2. In the search box, type:
   ```
   %' UNION SELECT flag_value,flag_name,difficulty,points,hint FROM flags--
   ```
3. Press Enter — the flags table will be rendered in the search results

**Flag location:** Returned directly in the search results table  
**Hint:** The UNION must match the same number of columns as the original query

---

### ☐ Task 5 — IDOR: Private Feedback Access
> **+100 pts** · `MEDIUM`

**Objective:** Read another user's private feedback ticket without permission.

1. Log in as any student (e.g., `student1` / `pass1234`)
2. Go to `/feedback`
3. In the **"View Feedback by Ticket ID"** field, enter `1`
4. Click Lookup — you'll see the admin's private ticket containing a flag

**Flag location:** Embedded in the `content` field of feedback ticket ID 1  
**Hint:** The server never checks if the ticket belongs to you

---

### ☐ Task 6 — Open Redirect
> **+50 pts** · `EASY`

**Objective:** Redirect a victim to an external site after they log in.

1. Craft this URL: `http://localhost:3000/login?next=https://evil.example.com`
2. Open it in your browser and log in with any valid credentials
3. After login, you'll be redirected to the external URL

**Flag:** Take a screenshot to show the exploit works — +50 pts on demonstration  
**Hint:** The `?next=` parameter is not validated

---

### ☐ Task 7 — Local File Inclusion (Path Traversal)
> **+100 pts** · `MEDIUM`

**Objective:** Read arbitrary files from the server using directory traversal.

1. Go to `/documents` and click any document
2. Notice the URL: `?file=handbook.txt`
3. Change the URL to: `?file=../../../../.env`
4. Press Enter — the server will dump its secrets

**Flag location:** Inside the `.env` file returned by the LFI  
**Hint:** Use `../` sequences to escape the documents directory

---

## 🔴 PHASE 3 — ADVANCED (Hard)

### ☐ Task 8 — Stored XSS: Notice Board
> **+150 pts** · `HARD`

**Objective:** Inject a persistent script that executes for every user who visits `/notices`.

1. Log in as admin (use the SQLi bypass from Task 3)
2. Go to `/admin` → Post a new notice
3. Set the title or content to:
   ```html
   <img src=x onerror="alert('XSS by ' + document.domain)">
   ```
4. Save and navigate to `/notices` — the script executes

**Flag:** Demonstrate execution to the organizer — the XSS fires in the notice title  
**Hint:** The notices page uses `dangerouslySetInnerHTML` — it renders raw HTML

---

### ☐ Task 9 — JWT Forgery (Algorithm Confusion)
> **+150 pts** · `HARD`

**Objective:** Forge a JWT with `role: admin` using the `alg: none` attack.

1. Log in as a student (`student1` / `pass1234`)
2. Open DevTools → Application → Cookies → copy the `token` value
3. Go to `/jwt-debug` on the app — it has a live JWT manipulation lab
4. **Or** do it manually:
   - Decode the token parts: `base64url decode each segment`
   - Change header `alg` to `none`
   - Change payload `role` to `admin`
   - Re-encode and send with **no signature** (drop the third segment)
5. Replace your cookie with the forged token and refresh

**Flag location:** A hidden flag is revealed on the admin dashboard when JWT role=admin  
**Hint:** Use the **JWT Decoder** in the Blue Team Tools tab to understand the token structure

---

### ☐ Task 10 — UNION SQLi: Profile ID Injection
> **+100 pts** · `MEDIUM`

**Objective:** Dump user credentials by injecting SQL into a profile URL.

1. Log in and navigate to your profile, e.g., `/profile/3`
2. Modify the URL to:
   ```
   /profile/0 UNION SELECT id,username,password,role,NULL,NULL,admission_no,role FROM users LIMIT 1--
   ```
3. The profile page will render the dumped data (username/password) in place of the name fields

**Flag:** The admin's password is the flag (`Admin@Campus2025` — worth +100 for extracting via SQLi)

---

## 🟣 BONUS ROUNDS (Extra Credit)

### ☐ Bonus 1 — Hidden Admin Notice
> **+50 pts** · Hidden notice in DB

The `notices` table has a row with `is_hidden = 1`. The UI doesn't show it — but the API might...  
Try: `GET /api/notices` to see if hidden notices are returned in the raw response.

---

### ☐ Bonus 2 — Mass Assignment / Privilege Escalation
> **+100 pts** · Register with a custom role

The `/api/auth/register` endpoint may accept a `role` field in the request body.  
Try registering with:
```json
{ "username": "hacker", "password": "test", "role": "admin" }
```
If the server blindly trusts the body, you become an admin instantly.

---

### ☐ Bonus 3 — Rate Limit Bypass / OTP Brute Force
> **+100 pts** · No rate limiting on PIN endpoint

The `verification_pins` table stores 4-digit PINs. The endpoint `/api/verify-pin` has no rate limiting.  
Write a script that tries all 10,000 combinations (`0000`–`9999`) to extract the `action_token` flag.

---

## 📊 Scoring Summary

| Phase | Task | Points |
|-------|------|--------|
| Phase 1 | Task 1 — Source Recon | 50 |
| Phase 1 | Task 2 — .env Exposure | 75 |
| Phase 2 | Task 3 — SQLi Auth Bypass | 100 |
| Phase 2 | Task 4 — SQLi UNION Dump | 100 |
| Phase 2 | Task 5 — IDOR Feedback | 100 |
| Phase 2 | Task 6 — Open Redirect | 50 |
| Phase 2 | Task 7 — LFI Path Traversal | 100 |
| Phase 3 | Task 8 — Stored XSS | 150 |
| Phase 3 | Task 9 — JWT Forgery | 150 |
| Phase 3 | Task 10 — Profile SQLi | 100 |
| Bonus | Bonus 1–3 | +250 max |
| **TOTAL** | | **1,175 pts + 250 bonus** |

---

> 💀 **Rules:** No DoS attacks, no attacking infrastructure outside the target app, no sharing flags between teams.  
> 🏆 **Win condition:** Highest combined score at the end of 45 minutes wins.
