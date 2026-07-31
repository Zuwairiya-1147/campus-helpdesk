import React, { useState } from "react";
import { submitComplaint } from "../api";
import { useAuth } from "../context/AuthContext";
import TicketStub from "../components/TicketStub";

const CATEGORIES = [ "Academic", "IT/Wi-Fi", "Infrastructure", "Faculty", "Other"];

const EMPTY_FORM = { category: "Academic", description: "" };

export default function StudentSubmit() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.description.trim().length < 10) {
      setError("Please describe the issue in at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const complaint = await submitComplaint(form);
      setResult(complaint);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          "Couldn't submit your complaint. Check that the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="hero" style={{ paddingBottom: 16 }}>
        <div className="hero__eyebrow">Student portal</div>
        <h1 className="hero__title">File a complaint</h1>
        <p className="hero__subtitle">
          Filing as <strong>{user?.name}</strong> ({user?.studentId}). Describe the issue
          clearly — the more specific you are, the faster it gets routed.
        </p>
      </section>

      <div className="panel">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="description">
              Describe the issue <span className="hint">be specific — location, what happened</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Wi-Fi has been down in Block C, 3rd floor since Monday morning."
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Submitting…" : "Submit complaint"}
          </button>
        </form>
      </div>

      {result && <TicketStub complaint={result} />}
    </div>
  );
}
