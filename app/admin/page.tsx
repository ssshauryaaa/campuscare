"use client";
// VULNERABILITY: Role read from JWT only — forge role:"admin" to access

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ShieldAlert, FileText, Users, Bell, Settings, FolderOpen, Upload, Trash2, Eye } from "lucide-react";

type Tab = "notices" | "users" | "documents" | "system";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("notices");
  const [notices, setNotices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [newNotice, setNew] = useState({ title: "", content: "", is_hidden: false });
  const [noticeMsg, setNMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Document upload state
  const [docUpload, setDocUpload] = useState({ filename: "", content: "" });
  const [docMsg, setDocMsg] = useState("");
  const [docPreview, setDocPreview] = useState<{ name: string; content: string } | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (!match) { router.push("/login"); return; }

    Promise.all([
      fetch("/api/admin/notices").then(r => r.json()),
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/admin/documents").then(r => r.json()),
    ]).then(([n, u, d]) => {
      if (n.notices) setNotices(n.notices); else setError(n.error || "Access denied");
      if (u.users) setUsers(u.users);
      if (d.documents) setDocuments(d.documents);
      setLoading(false);
    });
  }, []);

  const postNotice = async () => {
    if (!newNotice.title || !newNotice.content) return;
    const res = await fetch("/api/admin/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNotice),
    });
    if ((await res.json()).success) {
      setNMsg("Notice posted.");
      setNew({ title: "", content: "", is_hidden: false });
      fetch("/api/admin/notices").then(r => r.json()).then(d => setNotices(d.notices || []));
      setTimeout(() => setNMsg(""), 3000);
    }
  };

  const deleteNotice = async (id: number) => {
    if (!confirm(`Delete notice #${id}?`)) return;
    const res = await fetch("/api/admin/notices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if ((await res.json()).success) {
      fetch("/api/admin/notices").then(r => r.json()).then(d => setNotices(d.notices || []));
    }
  };

  const uploadDocument = async () => {
    if (!docUpload.filename || !docUpload.content) return;
    const res = await fetch("/api/admin/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(docUpload),
    });
    const data = await res.json();
    if (data.success) {
      setDocMsg(`✓ Document "${docUpload.filename}" saved.`);
      setDocUpload({ filename: "", content: "" });
      fetch("/api/admin/documents").then(r => r.json()).then(d => setDocuments(d.documents || []));
      setTimeout(() => setDocMsg(""), 4000);
    } else {
      setDocMsg(`✗ ${data.error || "Upload failed"}`);
    }
  };

  const previewDocument = async (filename: string) => {
    const res = await fetch(`/api/documents?file=${encodeURIComponent(filename)}`);
    const text = await res.text();
    setDocPreview({ name: filename, content: text });
  };

  const deleteDocument = async (filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    const res = await fetch("/api/admin/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    if ((await res.json()).success) {
      fetch("/api/admin/documents").then(r => r.json()).then(d => setDocuments(d.documents || []));
    }
  };

  // ── System info — intentionally leaks secrets for CTF ───────────────────
  const SYSTEM_INFO = {
    app: {
      name: "CampusCare Portal",
      version: "2.1.4",
      build: "b7f3a91",
      environment: "production",
      node_version: "v20.11.0",
      next_version: "14.2.3",
      db_path: "/var/app/campus.db",
      backup_path: "/backup.sql",
      upload_dir: "/public/documents",
      log_dir: "/var/log/campuscare/",
    },
    secrets: {
      jwt_secret: "secret",
      jwt_algorithm: "HS256",
      session_expiry: "7d",
      admin_email: "sysadmin.b7.internal@campuscare.local",
      smtp_host: "smtp.campus.internal",
      smtp_port: 587,
      smtp_user: "noreply@campuscare.local",
      smtp_pass: "Smtp@Campus#2025",
    },
    database: {
      engine: "SQLite (better-sqlite3)",
      wal_mode: true,
      tables: ["users", "notices", "flags", "assignments", "submissions", "verification_pins", "feedback", "patches", "attacks"],
      default_admin: "admin",
      default_admin_pass: "Admin@Campus2025",
    },
    infrastructure: {
      server: "Ubuntu 22.04 LTS",
      host: "campuscare.tagore-intl.local",
      internal_ip: "10.0.1.47",
      cdn: "none",
      reverse_proxy: "nginx/1.24.0",
      ssl_cert: "/etc/ssl/campuscare/cert.pem",
      ssl_key: "/etc/ssl/campuscare/key.pem",
    },
    api_keys: {
      maps_api: "AIzaSy_INTERNAL_MAPS_KEY_CAMPUSCARE_7x9",
      sms_gateway: "GW-TOKEN-CC-9f3b2e1a7d",
      analytics: "UA-CAMPUSCARE-2024-INTERNAL",
    },
  };

  // ── Style helpers ─────────────────────────────────────────────────────────
  const TABS: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "notices", label: "Notices", icon: <Bell size={13} />, count: notices.length },
    { key: "users", label: "Users", icon: <Users size={13} />, count: users.length },
    { key: "documents", label: "Documents", icon: <FolderOpen size={13} />, count: documents.length },
    { key: "system", label: "System", icon: <Settings size={13} /> },
  ];

  const th = (label: string) => (
    <th key={label} style={{ padding: "9px 14px", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: 1, textAlign: "left" }}>{label}</th>
  );

  const td = (content: React.ReactNode, mono = false) => (
    <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--cc-text)", fontFamily: mono ? "'DM Mono',monospace" : "inherit" }}>{content}</td>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid var(--cc-border)", borderRadius: 7, padding: "9px 12px",
    fontSize: 13, color: "var(--cc-text)", outline: "none", background: "#fafafa", boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const SecretRow = ({ label, value, danger = false }: { label: string; value: string | number | boolean; danger?: boolean }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: "1px solid var(--cc-border)", padding: "8px 0" }}>
      <span style={{ width: 220, flexShrink: 0, fontSize: 11, fontWeight: 700, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
      <span style={{
        fontFamily: "'DM Mono',monospace", fontSize: 12,
        background: danger ? "rgba(220,38,38,0.06)" : "rgba(26,60,110,0.04)",
        color: danger ? "#dc2626" : "var(--cc-navy)",
        border: `1px dashed ${danger ? "rgba(220,38,38,0.25)" : "rgba(26,60,110,0.15)"}`,
        borderRadius: 4, padding: "2px 10px"
      }}>
        {String(value)}
      </span>
    </div>
  );

  const SysSection = ({ title, data, danger = false }: { title: string; data: Record<string, any>; danger?: boolean }) => (
    <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${danger ? "rgba(220,38,38,0.2)" : "var(--cc-border)"}`, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: danger ? "#dc2626" : "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
        {danger && <span>🔑</span>} {title}
        {danger && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 10, background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>SENSITIVE</span>}
      </div>
      {Object.entries(data).map(([k, v]) => <SecretRow key={k} label={k} value={v as any} danger={danger} />)}
    </div>
  );

  return (
    <div style={{ background: "var(--cc-bg)", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ marginLeft: 240, paddingTop: 56 }}>
        <main style={{ padding: "28px 28px", maxWidth: 1200 }}>

          {/* Warning Banner
          <div style={{ background: "rgba(220,38,38,0.07)", border: "1.5px solid rgba(220,38,38,0.25)", borderRadius: 10, padding: "12px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldAlert style={{ width: 18, height: 18, color: "#dc2626", flexShrink: 0 }} />
            <p style={{ fontSize: 12, fontWeight: 800, color: "#dc2626", margin: 0 }}>⚠ Admin Access — Restricted Personnel Only</p>
          </div> */}

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--cc-navy)", margin: "0 0 3px" }}>Admin Panel</h1>
            <p style={{ fontSize: 12, color: "var(--cc-text-muted)", margin: 0 }}>Tagore International School — System Administration</p>
          </div>

          {/* Access Denied */}
          {error && !loading && (
            <div style={{ background: "rgba(220,38,38,0.06)", border: "1.5px solid rgba(220,38,38,0.2)", borderRadius: 8, padding: "14px 18px", marginBottom: 18 }}>
              <div style={{ fontWeight: 800, color: "#dc2626", marginBottom: 6 }}>⛔ {error}</div>
              <div style={{ fontSize: 12, color: "var(--cc-text-muted)", fontFamily: "'DM Mono',monospace" }}>
                Your JWT must contain <span style={{ color: "#dc2626" }}>&quot;role&quot;: &quot;admin&quot;</span>.
                Go to <a href="/jwt-debug" style={{ color: "var(--cc-orange)" }}>/jwt-debug</a> to forge your token.
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--cc-border)", marginBottom: 20 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: "10px 20px", fontSize: 13, fontWeight: 700, border: "none", background: "transparent", cursor: "pointer", transition: "all 0.15s", borderBottom: tab === t.key ? "2px solid var(--cc-orange)" : "2px solid transparent", marginBottom: -2, color: tab === t.key ? "var(--cc-orange)" : "var(--cc-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                {t.icon}{t.label}
                {t.count != null && t.count > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "1px 7px", borderRadius: 20, background: tab === t.key ? "rgba(245,130,10,0.12)" : "var(--cc-border)", color: tab === t.key ? "var(--cc-orange)" : "var(--cc-text-muted)" }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {loading && <div style={{ height: 200, background: "#fff", borderRadius: 10, border: "1px solid var(--cc-border)", opacity: 0.4 }} />}

          {/* ── NOTICES ── */}
          {!loading && tab === "notices" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--cc-border)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Post New Notice</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--cc-navy)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Title</label>
                  <input value={newNotice.title} onChange={e => setNew({ ...newNotice, title: e.target.value })} placeholder="Notice title"
                    style={inputStyle} onFocus={e => (e.target.style.borderColor = "var(--cc-navy)")} onBlur={e => (e.target.style.borderColor = "var(--cc-border)")} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--cc-navy)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Content</label>
                  <textarea value={newNotice.content} onChange={e => setNew({ ...newNotice, content: e.target.value })} rows={3} placeholder="Notice content..."
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "'DM Mono',monospace" }} onFocus={e => (e.target.style.borderColor = "var(--cc-navy)")} onBlur={e => (e.target.style.borderColor = "var(--cc-border)")} />
                </div>
                <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="hidden" checked={newNotice.is_hidden} onChange={e => setNew({ ...newNotice, is_hidden: e.target.checked })} style={{ width: 14, height: 14 }} />
                  <label htmlFor="hidden" style={{ fontSize: 12, fontWeight: 700, color: "var(--cc-text)", cursor: "pointer" }}>Mark as hidden (internal only)</label>
                </div>
                <div style={{ marginBottom: 16, padding: "8px 12px", background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#16a34a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Supported Template Variables:</div>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--cc-text-muted)" }}>
                    <code style={{ background: "#fff", padding: "2px 4px", borderRadius: 4, border: "1px solid var(--cc-border)" }}>{`{{ user.username }}`}</code>
                    <code style={{ background: "#fff", padding: "2px 4px", borderRadius: 4, border: "1px solid var(--cc-border)", marginLeft: 6 }}>{`{{ new Date().getFullYear() }}`}</code>
                  </div>
                </div>
                {noticeMsg && <div style={{ fontSize: 13, color: "#16a34a", marginBottom: 10 }}>✓ {noticeMsg}</div>}
                <button onClick={postNotice} style={{ padding: "9px 22px", background: "var(--cc-orange)", color: "#fff", border: "none", borderRadius: 7, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                  Post Notice →
                </button>
              </div>

              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--cc-border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "11px 18px", borderBottom: "1px solid var(--cc-border)", fontSize: 10, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                  All Notices ({notices.length})
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "var(--cc-navy)" }}>
                    {["#", "Title", "Content", "Author", "Visibility", "Date", "Actions"].map(th)}
                  </tr></thead>
                  <tbody>
                    {notices.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 24, color: "var(--cc-text-muted)", fontSize: 13 }}>No notices found.</td></tr>
                    ) : notices.map((n, i) => (
                      <tr key={n.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa", borderBottom: "1px solid var(--cc-border)" }}>
                        {td(n.id, true)}
                        {td(<span style={{ fontWeight: 700 }}>{n.title}</span>)}
                        {td(<span style={{ maxWidth: 300, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: n.is_hidden ? "#dc2626" : "inherit" }}>{n.content}</span>)}
                        {td(n.author)}
                        {td(n.is_hidden ? <span className="badge badge-red">HIDDEN</span> : <span className="badge badge-green">PUBLIC</span>)}
                        {td(new Date(n.created_at).toLocaleDateString("en-IN"), true)}
                        {td(
                          <button onClick={() => deleteNotice(n.id)}
                            style={{ padding: "4px 10px", fontSize: 11, fontWeight: 700, background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                            <Trash2 size={11} /> Delete
                          </button>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {!loading && tab === "users" && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--cc-border)", overflow: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "11px 18px", borderBottom: "1px solid var(--cc-border)", fontSize: 10, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                All Users ({users.length})
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
                <thead><tr style={{ background: "var(--cc-navy)" }}>
                  {["#", "Username", "Full Name", "Role", "Email", "Class", "Sec", "Adm. No", "Reset Token", "Reset Requested At"].map(th)}
                </tr></thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={10} style={{ padding: 24, color: "var(--cc-text-muted)", fontSize: 13 }}>No users found.</td></tr>
                  ) : users.map((u, i) => (
                    <tr key={u.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa", borderBottom: "1px solid var(--cc-border)" }}>
                      {td(u.id, true)}
                      {td(<span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{u.username}</span>)}
                      {td(u.full_name || "—")}
                      {td(<span className={`badge ${u.role === "admin" ? "badge-red" : u.role === "staff" ? "badge-yellow" : "badge-blue"}`}>{u.role}</span>)}
                      {td(<span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{u.email || "—"}</span>)}
                      {td(u.class || "—")}
                      {td(u.section || "—")}
                      {td(<span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{u.admission_no || "—"}</span>)}
                      {td(u.reset_token
                        ? <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, background: "rgba(220,38,38,0.07)", color: "#dc2626", border: "1px dashed rgba(220,38,38,0.3)", borderRadius: 4, padding: "2px 6px" }}>{u.reset_token}</span>
                        : <span style={{ color: "var(--cc-text-muted)" }}>—</span>)}
                      {td(u.reset_requested_at ? new Date(u.reset_requested_at).toLocaleString("en-IN") : "—", true)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {!loading && tab === "documents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Upload panel */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--cc-border)", padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                  <Upload size={12} /> Upload / Create Document
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--cc-navy)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Filename</label>
                    <input value={docUpload.filename} onChange={e => setDocUpload({ ...docUpload, filename: e.target.value })}
                      placeholder="e.g. rules.txt"
                      style={inputStyle} onFocus={e => (e.target.style.borderColor = "var(--cc-navy)")} onBlur={e => (e.target.style.borderColor = "var(--cc-border)")} />
                    <div style={{ fontSize: 10, color: "var(--cc-text-muted)", marginTop: 5 }}>Saved to <code style={{ fontFamily: "'DM Mono',monospace" }}>/public/documents/</code></div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--cc-navy)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Content</label>
                    <textarea value={docUpload.content} onChange={e => setDocUpload({ ...docUpload, content: e.target.value })}
                      rows={4} placeholder="Document content..."
                      style={{ ...inputStyle, resize: "vertical", fontFamily: "'DM Mono',monospace" }}
                      onFocus={e => (e.target.style.borderColor = "var(--cc-navy)")} onBlur={e => (e.target.style.borderColor = "var(--cc-border)")} />
                  </div>
                </div>
                {docMsg && <div style={{ fontSize: 13, color: docMsg.startsWith("✗") ? "#dc2626" : "#16a34a", margin: "10px 0" }}>{docMsg}</div>}
                <button onClick={uploadDocument}
                  style={{ marginTop: 12, padding: "9px 22px", background: "var(--cc-navy)", color: "#fff", border: "none", borderRadius: 7, fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
                  <Upload size={13} /> Save Document
                </button>
              </div>

              {/* Document list */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--cc-border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "11px 18px", borderBottom: "1px solid var(--cc-border)", fontSize: 10, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                  Documents in /public/documents/ ({documents.length})
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "var(--cc-navy)" }}>
                    {["Filename", "Size", "Modified", "Public URL", "Actions"].map(th)}
                  </tr></thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: 24, color: "var(--cc-text-muted)", fontSize: 13 }}>No documents found.</td></tr>
                    ) : documents.map((doc: any, i: number) => (
                      <tr key={doc.filename} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa", borderBottom: "1px solid var(--cc-border)" }}>
                        {td(<span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}><FileText size={12} style={{ color: "var(--cc-navy)" }} />{doc.filename}</span>)}
                        {td(<span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{doc.size}</span>)}
                        {td(doc.modified, true)}
                        {td(<a href={`/documents?file=${doc.filename}`} target="_blank" rel="noreferrer"
                          style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--cc-orange)", textDecoration: "none" }}>
                          /documents?file={doc.filename}
                        </a>)}
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => previewDocument(doc.filename)}
                              style={{ padding: "4px 10px", fontSize: 11, fontWeight: 700, background: "rgba(26,60,110,0.07)", color: "var(--cc-navy)", border: "1px solid rgba(26,60,110,0.15)", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                              <Eye size={11} /> View
                            </button>
                            <button onClick={() => deleteDocument(doc.filename)}
                              style={{ padding: "4px 10px", fontSize: 11, fontWeight: 700, background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview modal */}
              {docPreview && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setDocPreview(null)}>
                  <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 700, width: "90%", maxHeight: "80vh", overflow: "auto" }}
                    onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "var(--cc-navy)", fontFamily: "'DM Mono',monospace" }}>{docPreview.name}</span>
                      <button onClick={() => setDocPreview(null)} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "var(--cc-text-muted)" }}>×</button>
                    </div>
                    <pre style={{ margin: 0, fontSize: 13, fontFamily: "'DM Mono',monospace", whiteSpace: "pre-wrap", color: "var(--cc-text)", lineHeight: 1.6 }}>{docPreview.content}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SYSTEM ── */}
          {!loading && tab === "system" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "rgba(220,38,38,0.05)", border: "1.5px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>🔐</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#dc2626" }}>Confidential System Information</div>
                  <div style={{ fontSize: 11, color: "var(--cc-text-muted)", marginTop: 2 }}>This page contains sensitive credentials and infrastructure details. Do not share with unauthorised personnel.</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <SysSection title="Application Info" data={SYSTEM_INFO.app} />
                <SysSection title="Secret Keys & Tokens" data={SYSTEM_INFO.secrets} danger />
                <SysSection title="Database" data={SYSTEM_INFO.database} danger />
                <SysSection title="Infrastructure" data={SYSTEM_INFO.infrastructure} />
              </div>
              <SysSection title="API Keys" data={SYSTEM_INFO.api_keys} danger />

              {/* Vulnerability status */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--cc-border)", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--cc-text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>Known Vulnerability Status</div>
                {[
                  { name: "JWT Algorithm None Bypass", id: "hard_jwt" },
                  { name: "SQL Injection — Search", id: "medium_sqli" },
                  { name: "LFI — Document Traversal", id: "lfi_documents" },
                  { name: "SSTI — Notice Templates", id: "ssti" },
                  { name: "Mass Assignment — Register", id: "mass_assign" },
                  { name: "IDOR — Assignment Submissions", id: "insecure_ref" },
                  { name: "Weak Password Reset Tokens", id: "weak_reset" },
                  { name: "OTP Rate Limit", id: "rate_limit" },
                  { name: "Open Redirect — Login", id: "open_redirect" },
                  { name: "Cache Poisoning via Header", id: "cache_poison" },
                ].map((v, i, arr) => (
                  <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--cc-border)" : "none" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", flexShrink: 0, boxShadow: "0 0 0 3px rgba(220,38,38,0.15)" }} />
                    <span style={{ flex: 1, fontSize: 13, color: "var(--cc-text)" }}>{v.name}</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--cc-text-muted)" }}>{v.id}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "1px 8px", borderRadius: 10, background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>OPEN</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}