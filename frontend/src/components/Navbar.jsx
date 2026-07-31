import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = (path) =>
    "navbar__link" + (pathname === path ? " navbar__link--active" : "");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        <span className="navbar__brand-mark">CHD</span>
        <span className="navbar__brand-name">Campus Help Desk</span>
      </Link>
      <nav className="navbar__links" style={{ alignItems: "center" }}>
        {user?.role === "student" && (
          <>
            <Link to="/submit" className={linkClass("/submit")}>
              Submit
            </Link>
            <Link to="/track" className={linkClass("/track")}>
              Track
            </Link>
          </>
        )}
        {!user && (
          <Link to="/track" className={linkClass("/track")}>
            Track
          </Link>
        )}
        {user?.role === "admin" && (
          <Link to="/admin" className={linkClass("/admin")}>
            Admin
          </Link>
        )}

        {user ? (
          <>
            <span
              style={{
                fontSize: 13,
                color: "rgba(250,249,246,0.6)",
                margin: "0 4px 0 8px",
              }}
            >
              {user.name}
            </span>
            <button onClick={handleLogout} className="navbar__link" style={{ border: "none", background: "transparent" }}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={linkClass("/login")}>
              Log in
            </Link>
            <Link
              to="/register"
              className="btn btn--accent"
              style={{ padding: "8px 16px", fontSize: 14 }}
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
