"use client";
import React, { useState, useEffect, useRef } from "react";
import { mono, sans } from "@/constants/campusTheme";

// ── File tree definition ──────────────────────────────────────────────────────
type FileNode = {
  name: string;
  path?: string;           // if set → it's a file
  children?: FileNode[];   // if set → it's a folder
  badge?: string;          // "VULN" | "CONFIG" | "DB" etc.
  badgeColor?: string;
};

const FILE_TREE: FileNode[] = [
  {
    name: "lib",
    children: [
      { name: "auth.ts",       path: "lib/auth.ts",       badge: "VULN", badgeColor: "#ef4444" },
      { name: "db.ts",         path: "lib/db.ts",         badge: "SCHEMA", badgeColor: "#8b5cf6" },
      { name: "logAttack.ts",  path: "lib/logAttack.ts" },
    ],
  },
  {
    name: "app",
    children: [
      { name: "page.tsx",      path: "app/page.tsx",      badge: "VULN", badgeColor: "#ef4444" },
      {
        name: "api",
        children: [
          {
            name: "auth",
            children: [
              { name: "login/route.ts",  path: "app/api/auth/login/route.ts",  badge: "VULN", badgeColor: "#ef4444" },
              { name: "logout/route.ts", path: "app/api/auth/logout/route.ts", badge: "VULN", badgeColor: "#ef4444" },
            ],
          },
          { name: "search/route.ts",         path: "app/api/search/route.ts",          badge: "VULN", badgeColor: "#ef4444" },
          { name: "profile/[id]/route.ts",   path: "app/api/profile/[id]/route.ts",    badge: "VULN", badgeColor: "#ef4444" },
          { name: "feedback/route.ts",       path: "app/api/feedback/route.ts",        badge: "VULN", badgeColor: "#ef4444" },
          { name: "documents/route.ts",      path: "app/api/documents/route.ts",       badge: "VULN", badgeColor: "#ef4444" },
          { name: "env-file/route.ts",       path: "app/api/env-file/route.ts",        badge: "VULN", badgeColor: "#ef4444" },
          { name: "notices/route.ts",        path: "app/api/notices/route.ts" },
          { name: "admin/route.ts",          path: "app/api/admin/route.ts" },
        ],
      },
      { name: "login/page.tsx",         path: "app/login/page.tsx",       badge: "VULN", badgeColor: "#ef4444" },
      { name: "dashboard/page.tsx",     path: "app/dashboard/page.tsx",   badge: "VULN", badgeColor: "#ef4444" },
      { name: "notices/page.tsx",       path: "app/notices/page.tsx",     badge: "VULN", badgeColor: "#ef4444" },
      { name: "search/page.tsx",        path: "app/search/page.tsx",      badge: "VULN", badgeColor: "#ef4444" },
      { name: "feedback/page.tsx",      path: "app/feedback/page.tsx",    badge: "VULN", badgeColor: "#ef4444" },
      { name: "profile/[id]/page.tsx",  path: "app/profile/[id]/page.tsx" },
      { name: "documents/page.tsx",     path: "app/documents/page.tsx" },
      { name: "jwt-debug/page.tsx",     path: "app/jwt-debug/page.tsx" },
    ],
  },
  {
    name: "config",
    children: [
      { name: "next.config.ts", path: "next.config.ts", badge: "CONFIG", badgeColor: "#f59e0b" },
      { name: ".env",           path: ".env",            badge: "SECRET", badgeColor: "#dc2626" },
    ],
  },
];

// ── Database schema display ───────────────────────────────────────────────────
const DB_SCHEMA = [
  {
    table: "users",
    cols: ["id INTEGER PK", "username TEXT", "password TEXT ⚠", "role TEXT", "email TEXT", "full_name TEXT", "class TEXT", "section TEXT", "admission_no TEXT", "reset_token TEXT", "reset_requested_at TEXT"],
    note: "Passwords stored in PLAINTEXT. All users visible to SQLi attacks.",
    noteColor: "#ef4444",
  },
  {
    table: "flags",
    cols: ["id INTEGER PK", "flag_name TEXT", "flag_value TEXT 🚩", "difficulty TEXT", "points INTEGER", "hint TEXT"],
    note: "Flag values are stored here — extractable via UNION SELECT on vulnerable endpoints.",
    noteColor: "#f97316",
  },
  {
    table: "notices",
    cols: ["id INTEGER PK", "title TEXT ⚠", "content TEXT ⚠", "author TEXT ⚠", "created_at TEXT", "is_hidden INTEGER"],
    note: "Stored XSS vector — title/content/author rendered with dangerouslySetInnerHTML.",
    noteColor: "#ef4444",
  },
  {
    table: "feedback",
    cols: ["id INTEGER PK", "student_id INTEGER", "username TEXT", "email TEXT", "admission_no TEXT", "content TEXT", "status TEXT", "admin_response TEXT ⚠"],
    note: "IDOR vulnerable — no ownership check on GET. admin_response is an XSS vector.",
    noteColor: "#ef4444",
  },
  {
    table: "assignments",
    cols: ["id INTEGER PK", "title TEXT", "subject TEXT", "class TEXT", "due_date TEXT", "description TEXT"],
  },
  {
    table: "submissions",
    cols: ["id INTEGER PK", "assignment_id INTEGER", "student_id INTEGER", "content TEXT", "grade TEXT", "feedback TEXT", "submitted_at TEXT"],
  },
  {
    table: "verification_pins",
    cols: ["id INTEGER PK", "user_id INTEGER", "pin TEXT", "action TEXT", "action_token TEXT ⚠", "created_at TEXT"],
    note: "PIN stored in plaintext. action_token contains a flag — brute-forceable due to no rate limiting.",
    noteColor: "#f97316",
  },
];

// ── File icon ─────────────────────────────────────────────────────────────────
function fileIcon(name: string) {
  if (name.endsWith(".ts") || name.endsWith(".tsx")) return "📄";
  if (name === ".env") return "🔒";
  if (name.endsWith(".json") || name.endsWith(".config.ts")) return "⚙️";
  return "📄";
}

// ── Tree node ─────────────────────────────────────────────────────────────────
function TreeNode({
  node, depth, selected, onSelect, defaultOpen,
}: {
  node: FileNode; depth: number; selected: string | null; onSelect: (path: string) => void; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? depth < 2);
  const isDir = !!node.children;
  const isSelected = node.path === selected;

  return (
    <div>
      <div
        onClick={() => isDir ? setOpen(v => !v) : node.path && onSelect(node.path)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: `4px 8px 4px ${12 + depth * 14}px`,
          cursor: "pointer", borderRadius: 4,
          background: isSelected ? "rgba(245,130,10,0.12)" : "transparent",
          borderLeft: isSelected ? "2px solid #f5820a" : "2px solid transparent",
          marginLeft: 4, marginRight: 4,
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: 11, opacity: 0.6 }}>{isDir ? (open ? "▼" : "▶") : fileIcon(node.name)}</span>
        <span style={{
          fontSize: 12, fontFamily: mono, fontWeight: isSelected ? 700 : 400,
          color: isDir ? "#c9d1d9" : isSelected ? "#f5820a" : "#8b949e",
          flex: 1,
        }}>
          {node.name}
        </span>
        {node.badge && (
          <span style={{
            fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 3,
            background: `${node.badgeColor}22`, color: node.badgeColor,
            border: `1px solid ${node.badgeColor}44`, letterSpacing: ".05em",
          }}>
            {node.badge}
          </span>
        )}
      </div>
      {isDir && open && node.children?.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

// ── Code viewer ───────────────────────────────────────────────────────────────
function CodeViewer({ filePath }: { filePath: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const prevPath = useRef<string>("");

  useEffect(() => {
    if (!filePath || filePath === prevPath.current) return;
    prevPath.current = filePath;
    setLoading(true); setError(""); setContent(null);
    fetch(`/api/defense/source?file=${encodeURIComponent(filePath)}`)
      .then(r => r.json())
      .then(d => { if (d.content !== undefined) setContent(d.content); else setError(d.error ?? "Unknown error"); })
      .catch(() => setError("Failed to load file"))
      .finally(() => setLoading(false));
  }, [filePath]);

  const lines = content?.split("\n") ?? [];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "column", gap: 12 }}>
      <div style={{ width: 28, height: 28, border: "3px solid rgba(245,130,10,0.2)", borderTopColor: "#f5820a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 11, color: "#64748b", fontFamily: mono }}>Loading {filePath}...</div>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 28 }}>⚠️</div>
      <div style={{ fontSize: 12, color: "#f87171", fontFamily: mono }}>{error}</div>
      <div style={{ fontSize: 11, color: "#64748b" }}>File may not exist or is not in the allowed list.</div>
    </div>
  );

  if (!content) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 32, opacity: 0.15 }}>📄</div>
      <div style={{ fontSize: 11, color: "#475569", fontFamily: mono, letterSpacing: ".08em" }}>SELECT A FILE TO VIEW</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#0d1117" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 12.5, lineHeight: 1.75 }}>
        <tbody>
          {lines.map((line, i) => {
            const isVulnComment = line.includes("// VULNERABILITY") || line.includes("// VULN") || line.includes("// VULNERABLE");
            const isFixComment = line.includes("// FIX") || line.includes("// SECURE");
            return (
              <tr key={i} style={{ background: isVulnComment ? "rgba(239,68,68,0.1)" : isFixComment ? "rgba(34,197,94,0.05)" : "transparent" }}>
                <td style={{
                  width: 50, minWidth: 50, textAlign: "right", paddingRight: 16, paddingLeft: 12,
                  color: isVulnComment ? "#f87171" : "#3d4a5c", fontSize: 11,
                  borderRight: `2px solid ${isVulnComment ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.04)"}`,
                  userSelect: "none",
                }}>
                  {i + 1}
                </td>
                <td style={{ paddingLeft: 16, paddingRight: 16, whiteSpace: "pre-wrap", wordBreak: "break-all", color: isVulnComment ? "#fca5a5" : isFixComment ? "#86efac" : "#c9d1d9" }}>
                  {line || " "}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── DB Schema viewer ──────────────────────────────────────────────────────────
function DbSchemaViewer() {
  const [expanded, setExpanded] = useState<string>("users");

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#64748b", fontFamily: mono, marginBottom: 4 }}>campus.db — SQLite · better-sqlite3</div>
        <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
          The application uses a single SQLite database file. All tables are shown below. <span style={{ color: "#f87171", fontWeight: 700 }}>Red badges</span> indicate security issues. Click a table to expand its columns.
        </div>
      </div>
      {DB_SCHEMA.map(table => {
        const isOpen = expanded === table.table;
        return (
          <div key={table.table} style={{ marginBottom: 10, border: `1px solid ${table.note ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, overflow: "hidden", background: "#0d1117" }}>
            <button onClick={() => setExpanded(isOpen ? "" : table.table)} style={{
              width: "100%", textAlign: "left", padding: "12px 16px", background: "transparent",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: mono,
            }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>{isOpen ? "▼" : "▶"}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#c9d1d9" }}>🗄️ {table.table}</span>
              <span style={{ fontSize: 10, color: "#64748b", marginLeft: 4 }}>({table.cols.length} cols)</span>
              {table.note && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>SECURITY ISSUE</span>}
            </button>
            {isOpen && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {table.note && (
                  <div style={{ padding: "10px 16px", background: "rgba(239,68,68,0.06)", borderBottom: "1px solid rgba(239,68,68,0.12)", fontSize: 12, color: "#fca5a5", lineHeight: 1.5 }}>
                    ⚠️ {table.note}
                  </div>
                )}
                <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                  {table.cols.map(col => {
                    const isVuln = col.includes("⚠");
                    const isPK = col.includes("PK");
                    return (
                      <div key={col} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", background: isVuln ? "rgba(239,68,68,0.06)" : "transparent", borderRadius: 4 }}>
                        <span style={{ fontSize: 11, fontFamily: mono, color: isPK ? "#f5820a" : isVuln ? "#fca5a5" : "#8b949e" }}>{col}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main CodebaseTab ──────────────────────────────────────────────────────────
type Panel = "code" | "db";

export function CodebaseTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("code");
  const [search, setSearch] = useState("");

  // Flatten all file nodes for search
  function flattenFiles(nodes: FileNode[]): { name: string; path: string; badge?: string }[] {
    const out: { name: string; path: string; badge?: string }[] = [];
    for (const n of nodes) {
      if (n.path) out.push({ name: n.name, path: n.path, badge: n.badge });
      if (n.children) out.push(...flattenFiles(n.children));
    }
    return out;
  }
  const allFiles = flattenFiles(FILE_TREE);
  const searchResults = search.trim().length > 1
    ? allFiles.filter(f => f.path.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, background: "#010409" }}>

      {/* LEFT: File tree */}
      <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", background: "#0d1117" }}>

        {/* Explorer header */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#4b5563", letterSpacing: ".15em", marginBottom: 10 }}>EXPLORER — READ ONLY</div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6, padding: "6px 10px", color: "#c9d1d9", fontFamily: mono, fontSize: 11,
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Panel toggle */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          {([["code", "📁 Files"], ["db", "🗄️ Database"]] as [Panel, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setPanel(id)} style={{
              flex: 1, padding: "8px 0", fontFamily: sans, fontSize: 11, fontWeight: 700,
              background: panel === id ? "rgba(245,130,10,0.1)" : "transparent",
              border: "none", borderBottom: panel === id ? "2px solid #f5820a" : "2px solid transparent",
              color: panel === id ? "#f5820a" : "#4b5563", cursor: "pointer", letterSpacing: ".05em",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* File tree or search results */}
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 8 }}>
          {searchResults.length > 0 ? (
            <div>
              <div style={{ padding: "4px 14px", fontSize: 9, color: "#4b5563", fontWeight: 700, letterSpacing: ".1em" }}>RESULTS ({searchResults.length})</div>
              {searchResults.map(f => (
                <div key={f.path} onClick={() => { setSelected(f.path); setPanel("code"); }} style={{
                  padding: "6px 14px", cursor: "pointer", fontFamily: mono, fontSize: 11,
                  color: selected === f.path ? "#f5820a" : "#8b949e",
                  background: selected === f.path ? "rgba(245,130,10,0.1)" : "transparent",
                  borderLeft: selected === f.path ? "2px solid #f5820a" : "2px solid transparent",
                }}>
                  {f.path}
                </div>
              ))}
            </div>
          ) : panel === "code" ? (
            FILE_TREE.map((node, i) => (
              <TreeNode key={i} node={node} depth={0} selected={selected} onSelect={p => { setSelected(p); setPanel("code"); }} defaultOpen={true} />
            ))
          ) : (
            <div style={{ padding: "8px 12px" }}>
              {DB_SCHEMA.map(t => (
                <div key={t.table} onClick={() => {}} style={{ padding: "6px 8px", fontFamily: mono, fontSize: 11, color: "#8b949e", display: "flex", alignItems: "center", gap: 8 }}>
                  🗄️ {t.table}
                  {t.note && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: "rgba(239,68,68,0.15)", color: "#f87171" }}>VULN</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer legend */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "#374151", fontWeight: 700, letterSpacing: ".1em", marginBottom: 6 }}>LEGEND</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[["VULN", "#ef4444", "Contains a vulnerability"], ["SECRET", "#dc2626", "Sensitive / secret data"], ["CONFIG", "#f59e0b", "App configuration"], ["SCHEMA", "#8b5cf6", "Database schema"]].map(([badge, color, desc]) => (
              <div key={badge} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 8, fontWeight: 800, padding: "1px 4px", borderRadius: 3, background: `${color}22`, color, border: `1px solid ${color}44` }}>{badge}</span>
                <span style={{ fontSize: 10, color: "#4b5563" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Tab bar */}
        <div style={{ height: 38, background: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0 }}>
          {selected && panel === "code" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, fontSize: 11, fontFamily: mono, color: "#c9d1d9", borderTop: "2px solid #f5820a" }}>
              <span style={{ opacity: 0.5 }}>📄</span> {selected}
              <span style={{ fontSize: 9, color: "#4b5563", marginLeft: 4 }}>READ ONLY</span>
            </div>
          )}
          {panel === "db" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, fontSize: 11, fontFamily: mono, color: "#c9d1d9", borderTop: "2px solid #8b5cf6" }}>
              🗄️ campus.db — Schema <span style={{ fontSize: 9, color: "#4b5563", marginLeft: 4 }}>READ ONLY</span>
            </div>
          )}
        </div>

        {/* File content or DB schema */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {panel === "db" ? (
            <DbSchemaViewer />
          ) : selected ? (
            <CodeViewer filePath={selected} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 16 }}>
              <div style={{ fontSize: 64, opacity: 0.07 }}>📁</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#4b5563", letterSpacing: ".05em", marginBottom: 6 }}>Codebase Explorer</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.7, maxWidth: 380 }}>
                  Select a file from the tree to view its full source code. All files are <span style={{ color: "#f5820a", fontWeight: 700 }}>read-only</span> — use the Patch IDE in the Investigate tab to write fixes.
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 440, width: "100%" }}>
                {[
                  ["lib/auth.ts", "JWT & authentication logic"],
                  ["app/api/auth/login/route.ts", "Login route (SQLi target)"],
                  ["lib/db.ts", "DB schema + seed data"],
                  [".env", "Environment secrets"],
                ].map(([path, desc]) => (
                  <button key={path} onClick={() => setSelected(path)} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 8, padding: "10px 14px", cursor: "pointer", textAlign: "left", fontFamily: sans,
                  }}>
                    <div style={{ fontSize: 11, fontFamily: mono, color: "#f5820a", marginBottom: 4 }}>{path}</div>
                    <div style={{ fontSize: 10, color: "#4b5563" }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
