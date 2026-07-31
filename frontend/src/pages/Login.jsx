import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from || (user.role === "admin" ? "/admin" : "/submit");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 440 }}>
      <section className="hero" style={{ paddingBottom: 8 }}>
        <div className="hero__eyebrow">Sign in</div>
        <h1 className="hero__title" style={{ fontSize: 32 }}>
          Welcome back
        </h1>
        <p className="hero__subtitle">Log in to file a complaint or manage the queue.</p>
      </section>

      <div className="panel">
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn btn--primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading && <span className="spinner" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 14, color: "var(--color-slate)", marginTop: 16, textAlign: "center" }}>
        New here?{" "}
        <Link to="/register" style={{ color: "var(--color-ink)", fontWeight: 600 }}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
