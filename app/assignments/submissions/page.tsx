"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

function SubmissionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("studentId");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let url = `/api/assignments/submissions`;
    if (studentId) {
      url += `?studentId=${studentId}`;
    }
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setSubmissions(d.submissions || []);
        setLoading(false);
      });
  }, [studentId]);

  return (
    <div style={{ background:"var(--cc-bg)", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ marginLeft:240, paddingTop:56 }}>
        <main style={{ padding:"28px 28px", maxWidth:900 }}>
          <h1 style={{ fontSize:20, fontWeight:900, color:"var(--cc-navy)", margin:"0 0 20px" }}>
            Student Submissions
          </h1>
          {error && <div style={{ color:"#dc2626", background:"rgba(220,38,38,0.1)", padding:12, borderRadius:8 }}>{error}</div>}
          {loading ? <div>Loading records...</div> : (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {submissions.map(sub => (
                <div key={sub.id} style={{ background:"#fff", padding:20, borderRadius:8, border:"1px solid var(--cc-border)" }}>
                  <h3 style={{ fontSize:16, fontWeight:800, margin:"0 0 8px", color:"var(--cc-navy)" }}>{sub.title} ({sub.subject})</h3>
                  <div style={{ fontSize:12, color:"var(--cc-text-muted)", marginBottom:16 }}>
                    Student ID: {sub.student_id} | Grade: {sub.grade || "Ungraded"}
                  </div>
                  
                  <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:"var(--cc-text-muted)", marginBottom:4 }}>Submission Content</div>
                  {/* VULNERABILITY: submission content rendered as HTML — stored XSS for admins reviewing work */}
                  <div
                    className="text-sm text-gray-600 bg-gray-50 rounded p-3 mt-2"
                    style={{ background:"#f9fafb", padding:"12px", borderRadius:"6px", fontSize:"14px", color:"#4b5563", marginBottom:16, border:"1px solid var(--cc-border)" }}
                    dangerouslySetInnerHTML={{ __html: sub.content }}
                  />

                  <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:"var(--cc-text-muted)", marginBottom:4 }}>Teacher Feedback</div>
                  {/* Feedback also unsafe — if admin types XSS in feedback, it fires for the student */}
                  <div
                    className="text-sm italic text-blue-700"
                    style={{ fontStyle:"italic", color:"#1d4ed8", fontSize:"14px" }}
                    dangerouslySetInnerHTML={{ __html: sub.feedback ?? "No feedback provided." }}
                  />
                </div>
              ))}
              {submissions.length === 0 && !error && (
                 <div style={{ padding:40, textAlign:"center", border:"2px dashed var(--cc-border)", borderRadius:8, color:"var(--cc-text-muted)" }}>
                   No submissions found{studentId ? ` for Student ID ${studentId}` : ""}.
                 </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <SubmissionsContent />
    </Suspense>
  );
}
