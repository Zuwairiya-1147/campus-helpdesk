import React, { useState } from "react";
import { trackComplaint } from "../api";
import StatusBadge from "../components/StatusBadge";

export default function StudentTrack() {
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!complaintId.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const data = await trackComplaint(complaintId.trim());
      setComplaint(data);
    } catch (err) {
      setComplaint(null);
      setError(
        err.response?.status === 404
          ? "No complaint found with that ID. Double-check and try again."
          : "Something went wrong. Check that the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="hero" style={{ paddingBottom: 16 }}>
        <div className="hero__eyebrow">Student portal</div>
        <h1 className="hero__title">Track your complaint</h1>
        <p className="hero__subtitle">
          Enter the complaint ID you received at submission — it looks like{" "}
          <code style={{ fontFamily: "var(--font-mono)" }}>CHD-2026-0001</code>.
        </p>
      </section>

      <div className="panel">
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12 }}>
          <input
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            placeholder="CHD-2026-0001"
            style={{
              flex: 1,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: "11px 13px",
              fontFamily: "var(--font-mono)",
              fontSize: 14,
            }}
          />
          <button type="submit" className="btn btn--accent" disabled={loading}>
            {loading ? "Searching…" : "Track"}
          </button>
        </form>
      </div>

      {error && (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-state__title">{error}</div>
          </div>
        </div>
      )}

      {complaint && (
        <div className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              <div className="section-title" style={{ fontFamily: "var(--font-mono)", fontSize: 16 }}>
                {complaint.complaintId}
              </div>
              <div className="section-desc" style={{ marginBottom: 0 }}>
                {complaint.category} · Filed{" "}
                {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          <p style={{ fontSize: 14, color: "var(--color-ink)", lineHeight: 1.6 }}>
            {complaint.description}
          </p>

          {complaint.remarks && (
            <div
              style={{
                marginTop: 20,
                padding: "14px 16px",
                background: "var(--color-paper-dim)",
                borderRadius: "var(--radius)",
                borderLeft: "3px solid var(--color-amber)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-slate)",
                  marginBottom: 6,
                }}
              >
                Remarks from admin
              </div>
              <div style={{ fontSize: 14 }}>{complaint.remarks}</div>
            </div>
          )}
        </div>
      )}

      {!complaint && !error && searched === false && null}
    </div>
  );
}
