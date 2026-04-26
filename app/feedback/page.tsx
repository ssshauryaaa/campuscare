"use client";
import { useState, useEffect } from "react";

export default function FeedbackPage() {
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [viewId, setViewId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [myFeedback, setMyFeedback] = useState<any[]>([]);

  // Fetch the logged-in user's own feedback on load
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    fetch("/api/feedback/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMyFeedback(data.feedback || []));
  }, [submitted]);

  async function handleSubmit() {
    const token = localStorage.getItem("jwt");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.id) {
      setSubmitted(true);
      setContent("");
    }
  }

  // VULNERABLE: fetches any feedback record by raw ID — no ownership check
  async function handleView() {
    setError("");
    setResult(null);
    const token = localStorage.getItem("jwt");
    const res = await fetch(`/api/feedback?id=${viewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.error) return setError(data.error);
    setResult(data);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Student Grievance & Feedback</h1>
      <p style={{ color: "#666" }}>
        Submit your feedback anonymously. Only you and admin can view your submissions.
      </p>

      {/* Submit feedback */}
      <div style={{ marginBottom: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "8px" }}>
        <h2>Submit Feedback</h2>
        <textarea
          rows={4}
          style={{ width: "100%", padding: "0.5rem" }}
          placeholder="Describe your grievance or feedback..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={handleSubmit} style={{ marginTop: "0.5rem" }}>
          Submit
        </button>
        {submitted && <p style={{ color: "green" }}>✓ Feedback submitted successfully.</p>}
      </div>

      {/* My submissions — shows feedback IDs, which hints at IDOR */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>My Submissions</h2>
        {myFeedback.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>ID</th>
                <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Preview</th>
                <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myFeedback.map((fb) => (
                <tr key={fb.id}>
                  {/* ID is shown — hints that IDOR is possible */}
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>#{fb.id}</td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                    {fb.content.substring(0, 40)}...
                  </td>
                  <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{fb.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* "View by ID" — the IDOR vector, disguised as a support ticket lookup */}
      <div style={{ background: "#fff3cd", padding: "1rem", borderRadius: "8px" }}>
        <h2>View Feedback by Ticket ID</h2>
        <p style={{ fontSize: "0.85rem", color: "#888" }}>
          If support gave you a ticket ID, you can look it up here.
        </p>
        <input
          type="number"
          placeholder="Enter ticket ID (e.g. 3)"
          value={viewId}
          onChange={(e) => setViewId(e.target.value)}
          style={{ padding: "0.4rem", marginRight: "0.5rem", width: "200px" }}
        />
        <button onClick={handleView}>Lookup</button>

        {/* VULNERABLE: dumps full raw API response with no field filtering */}
        {result && (
          <div style={{ marginTop: "1rem", background: "#fff", padding: "1rem", border: "1px solid #ccc", borderRadius: "6px" }}>
            <p><strong>Ticket #{result.id}</strong></p>
            <p><strong>Submitted by:</strong> {result.username} ({result.email})</p>
            <p><strong>Student ID:</strong> {result.student_id}</p>
            <p><strong>Admission No:</strong> {result.admission_no}</p>
            <p><strong>Content:</strong> {result.content}</p>
            <p><strong>Status:</strong> {result.status}</p>
            {/* Admin response rendered as HTML — secondary XSS vector */}
            {result.admin_response && (
              <div>
                <strong>Admin Response:</strong>
                <div dangerouslySetInnerHTML={{ __html: result.admin_response }} />
              </div>
            )}
          </div>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}
