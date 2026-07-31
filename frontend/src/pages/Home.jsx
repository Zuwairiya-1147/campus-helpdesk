import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__eyebrow">SVECW · Student Services</div>
        <h1 className="hero__title">Report an issue. Watch it get resolved.</h1>
        <p className="hero__subtitle">
          One place to raise campus complaints — hostel, academics, IT, infrastructure,
          or faculty — and follow them through to resolution, without the back-and-forth.
        </p>
      </section>

      <div className="portal-grid">
        {!user && (
          <Link to="/register" className="portal-card">
            <span className="portal-card__label">Get started</span>
            <h2 className="portal-card__title">Create an account</h2>
            <p className="portal-card__desc">
              Sign up as a student to file complaints, or as staff to manage them.
            </p>
            <span className="portal-card__go">Sign up →</span>
          </Link>
        )}

        {user?.role === "student" && (
          <Link to="/submit" className="portal-card">
            <span className="portal-card__label">Student</span>
            <h2 className="portal-card__title">File a complaint</h2>
            <p className="portal-card__desc">
              Submit an issue in under a minute. You'll get a tracking ID immediately.
            </p>
            <span className="portal-card__go">Submit a complaint →</span>
          </Link>
        )}

        <Link to="/track" className="portal-card">
          <span className="portal-card__label">Anyone</span>
          <h2 className="portal-card__title">Track a complaint</h2>
          <p className="portal-card__desc">
            Already have a complaint ID? Check its current status — no login needed.
          </p>
          <span className="portal-card__go">Check status →</span>
        </Link>

        {user?.role === "admin" && (
          <Link to="/admin" className="portal-card">
            <span className="portal-card__label">Staff</span>
            <h2 className="portal-card__title">Admin dashboard</h2>
            <p className="portal-card__desc">
              View all complaints, update statuses, and see resolution trends.
            </p>
            <span className="portal-card__go">Open dashboard →</span>
          </Link>
        )}

        {!user && (
          <Link to="/login" className="portal-card">
            <span className="portal-card__label">Returning</span>
            <h2 className="portal-card__title">Log in</h2>
            <p className="portal-card__desc">
              Already have an account? Sign in to continue.
            </p>
            <span className="portal-card__go">Sign in →</span>
          </Link>
        )}
      </div>
    </div>
  );
}
