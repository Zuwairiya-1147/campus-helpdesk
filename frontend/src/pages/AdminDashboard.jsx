import React, { useEffect, useState, useCallback } from "react";
import { listComplaints, updateComplaint, getSummary } from "../api";
import StatusBadge from "../components/StatusBadge";

const STATUSES = ["Pending", "In Progress", "Resolved"];
const CATEGORIES = ["Hostel", "Academic", "IT/Wi-Fi", "Infrastructure", "Faculty", "Other"];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;

      const [list, stats] = await Promise.all([listComplaints(filters), getSummary()]);
      setComplaints(list);
      setSummary(stats);
    } catch (err) {
      setError("Couldn't reach the backend. Make sure the server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (complaintId, status) => {
    setSavingId(complaintId);
    try {
      const updated = await updateComplaint(complaintId, { status });
      setComplaints((prev) =>
        prev.map((c) => (c.complaintId === complaintId ? updated : c))
      );
    } catch {
      // silently ignore; user can retry
    } finally {
      setSavingId(null);
    }
  };

  const handleRemarksBlur = async (complaintId, remarks) => {
    setSavingId(complaintId);
    try {
      const updated = await updateComplaint(complaintId, { remarks });
      setComplaints((prev) =>
        prev.map((c) => (c.complaintId === complaintId ? updated : c))
      );
    } catch {
      // silently ignore
    } finally {
      setSavingId(null);
    }
  };

  const countFor = (arr, key) => arr?.find((s) => s._id === key)?.count ?? 0;

  return (
    <div className="page page--wide">
      <section className="hero" style={{ paddingBottom: 8 }}>
        <div className="hero__eyebrow">Staff portal</div>
        <h1 className="hero__title">Admin dashboard</h1>
        <p className="hero__subtitle">
          Everything filed by students, in one ledger. Update status and leave remarks
          as issues move toward resolution.
        </p>
      </section>

      {summary && (
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-card__value">{summary.total}</div>
            <div className="stat-card__label">Total complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{countFor(summary.byStatus, "Pending")}</div>
            <div className="stat-card__label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{countFor(summary.byStatus, "In Progress")}</div>
            <div className="stat-card__label">In progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{countFor(summary.byStatus, "Resolved")}</div>
            <div className="stat-card__label">Resolved</div>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="filter-bar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {(statusFilter || categoryFilter) && (
            <button
              className="btn-ghost btn"
              onClick={() => {
                setStatusFilter("");
                setCategoryFilter("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading && <p style={{ color: "var(--color-slate)", fontSize: 14 }}>Loading complaints…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && complaints.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__title">No complaints match this view</div>
            <p>Try clearing the filters, or check back once students start submitting.</p>
          </div>
        )}

        {!loading && !error && complaints.length > 0 && (
          <div className="table-wrap">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.complaintId}>
                    <td className="cid">{c.complaintId}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.studentName}</div>
                      <div style={{ fontSize: 12, color: "var(--color-slate)" }}>{c.studentId}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{c.category}</td>
                    <td style={{ fontSize: 13, maxWidth: 260 }}>{c.description}</td>
                    <td>
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.complaintId, e.target.value)}
                        disabled={savingId === c.complaintId}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="remarks-input"
                        defaultValue={c.remarks}
                        placeholder="Add a remark…"
                        onBlur={(e) => handleRemarksBlur(c.complaintId, e.target.value)}
                        disabled={savingId === c.complaintId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
