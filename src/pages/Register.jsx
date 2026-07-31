import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "student",
  studentId: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.role === "student" && !form.studentId.trim()) {
      setError("Student ID is required for student accounts.");
      return;
    }

    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "admin" ? "/admin" : "/submit", { replace: true });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(
        apiErrors?.[0]?.message ||
          err.response?.data?.message ||
          "Couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 480 }}>
      <section className="hero" style={{ paddingBottom: 8 }}>
        <div className="hero__eyebrow">Create account</div>
        <h1 className="hero__title" style={{ fontSize: 32 }}>
          Join the help desk
        </h1>
        <p className="hero__subtitle">
          Set up your account to submit complaints and track them through resolution.
        </p>
      </section>

      <div className="panel">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>I am a</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["student", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={form.role === r ? "btn btn--accent" : "btn btn-ghost"}
                  style={{ flex: 1, justifyContent: "center", textTransform: "capitalize" }}
                >
                  {r}
                </button>
              ))}
            </div>
            {form.role === "admin" && (
              <p style={{ fontSize: 12, color: "var(--color-slate)", marginTop: 8 }}>
                For your project demo only — in a real deployment, admin accounts
                would be created manually, not through open signup.
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
          </div>

          {form.role === "student" && (
            <div className="field">
              <label htmlFor="studentId">
                Student ID <span className="hint">e.g. 24A91A0512</span>
              </label>
              <input
                id="studentId"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder="Your roll number"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@svecw.ac.in"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">
              Password <span className="hint">at least 6 characters</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading && <span className="spinner" />}
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 14, color: "var(--color-slate)", marginTop: 16, textAlign: "center" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--color-ink)", fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
