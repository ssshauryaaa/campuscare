import type { AttackType, Severity } from "@/types/defense";

// ── Typography ────────────────────────────────────────────────────────────────
export const mono = "'DM Mono', 'JetBrains Mono', monospace";
export const sans = "'Nunito', system-ui, sans-serif";

// ── CampusCare brand palette ──────────────────────────────────────────────────
export const C = {
  navy:        "#1a3c6e",
  navyDark:    "#003366",
  navyLight:   "#2d5f8a",
  navyMuted:   "#e8eef5",
  orange:      "#f5820a",
  orangeLight: "#fef3e2",
  orangeBorder:"#fde0a8",
  bg:          "#f5f7fa",
  white:       "#ffffff",
  border:      "#e2e8f0",
  text:        "#374151",
  textMuted:   "#6b7280",
  textFaint:   "#9ca3af",
  green:       "#16a34a",
  greenLight:  "rgba(22,163,74,0.08)",
  greenBorder: "rgba(22,163,74,0.2)",
  red:         "#dc2626",
  redLight:    "rgba(220,38,38,0.07)",
  redBorder:   "rgba(220,38,38,0.2)",
  amber:       "#d97706",
  amberLight:  "rgba(217,119,6,0.08)",
  amberBorder: "rgba(217,119,6,0.2)",
} as const;

// ── Severity config ───────────────────────────────────────────────────────────
export const SEV_CONFIG: Record<Severity, {
  color: string; bg: string; border: string; dot: string; label: string; rowBg: string;
}> = {
  critical: { color: "#b91c1c", bg: "#fff1f1", border: "#fca5a5", dot: "#ef4444", label: "CRITICAL", rowBg: "rgba(220,38,38,0.03)" },
  high:     { color: "#c2410c", bg: "#fff7ed", border: "#fdba74", dot: "#f97316", label: "HIGH",     rowBg: "rgba(249,115,22,0.03)" },
  medium:   { color: "#92400e", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", label: "MEDIUM",   rowBg: "rgba(245,158,11,0.02)" },
  low:      { color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", dot: "#10b981", label: "LOW",      rowBg: "transparent" },
};

// ── Attack type labels ────────────────────────────────────────────────────────
export const TYPE_LABELS: Record<AttackType, string> = {
  sqli_login:      "SQLI — LOGIN",
  sqli_search:     "SQLI — SEARCH",
  sqli_profile:    "SQLI — PROFILE URL",
  sqli_class:      "SQLI — CLASS FILTER",
  xss_notices:     "XSS — NOTICE BOARD",
  xss_dashboard:   "XSS — DASHBOARD",
  xss_profile:     "XSS — PROFILE NAME",
  xss_search:      "XSS — SEARCH REFLECT",
  xss_dom:         "XSS — DOM / HASH",
  xss_login:       "XSS — LOGIN ERROR",
  jwt_forge:       "JWT FORGERY",
  idor_profile:    "IDOR — PROFILE",
  open_redirect:   "OPEN REDIRECT",
  session_fixation:"SESSION FIXATION",
  recon:           "RECON / DATA LEAK",
};

// ── Attack type badge colours ─────────────────────────────────────────────────
export const TYPE_COLORS: Record<AttackType, { text: string; bg: string; border: string }> = {
  sqli_login:      { text: "#b91c1c", bg: "#fff1f1", border: "#fca5a5" },
  sqli_search:     { text: "#be185d", bg: "#fdf2f8", border: "#f9a8d4" },
  sqli_profile:    { text: "#9f1239", bg: "#fff1f2", border: "#fecdd3" },
  sqli_class:      { text: "#7e22ce", bg: "#faf5ff", border: "#d8b4fe" },
  xss_notices:     { text: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
  xss_dashboard:   { text: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  xss_profile:     { text: "#a16207", bg: "#fefce8", border: "#fef08a" },
  xss_search:      { text: "#0369a1", bg: "#eff6ff", border: "#bae6fd" },
  xss_dom:         { text: "#0e7490", bg: "#ecfeff", border: "#a5f3fc" },
  xss_login:       { text: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" },
  jwt_forge:       { text: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
  idor_profile:    { text: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" },
  open_redirect:   { text: "#065f46", bg: "#ecfdf5", border: "#6ee7b7" },
  session_fixation:{ text: "#374151", bg: "#f9fafb", border: "#d1d5db" },
  recon:           { text: "#92400e", bg: "#fffbeb", border: "#fde68a" },
};

// ── Patch scoring ─────────────────────────────────────────────────────────────
export const PATCH_POINTS: Record<AttackType, number> = {
  sqli_login:       100,
  sqli_search:      100,
  sqli_profile:     100,
  sqli_class:        75,
  xss_notices:      100,
  xss_dashboard:    100,
  xss_profile:       75,
  xss_search:        75,
  xss_dom:           75,
  xss_login:         75,
  jwt_forge:        100,
  idor_profile:      75,
  open_redirect:     50,
  session_fixation:  75,
  recon:             50,
};
