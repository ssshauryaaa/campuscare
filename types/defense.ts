export type Severity = "critical" | "high" | "medium" | "low";

export type AttackType =
  | "sqli_login"       // admin'-- or ' OR 1=1-- in login form
  | "sqli_search"      // UNION SELECT in student search bar
  | "sqli_profile"     // SQLi via /profile/[id] URL parameter
  | "sqli_class"       // SQLi via ?class= filter URL param
  | "xss_notices"      // stored XSS via notice content (dangerouslySetInnerHTML)
  | "xss_dashboard"    // stored XSS via notice title on dashboard widget
  | "xss_profile"      // stored XSS via full_name at registration
  | "xss_search"       // reflected XSS via ?q= URL param
  | "xss_dom"          // DOM XSS via notices URL hash
  | "xss_login"        // reflected XSS via login error message
  | "jwt_forge"        // JWT none-algorithm or weak secret forgery
  | "idor_profile"     // IDOR: reading another student's profile
  | "open_redirect"    // ?next= param redirects to external URL
  | "session_fixation" // old JWT still valid after logout
  | "recon";           // sensitive info found (env, source comment, backup panel)

export type FilterTab = "all" | "acknowledged" | "patched";

export type LogEntry = {
  id: string;
  ts: number;
  type: AttackType;
  severity: Severity;
  ip: string;
  port: number;
  user: string;          // attacker username / handle
  detail: string;        // human-readable description
  endpoint: string;      // e.g. /api/search, /notices
  method: string;        // GET / POST
  statusCode: number;
  userAgent: string;
  payload: string;       // raw payload string shown in inspector
  country: string;
  patched: boolean;
  detected: boolean;
};

export type ScoreEntry = {
  points: number;
  ts: number;
  detail: string;
  type: AttackType;
};
