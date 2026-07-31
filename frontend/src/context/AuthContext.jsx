import React, { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, registerRequest, fetchMe, setAuthToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("chd_token"));
  const [loading, setLoading] = useState(true);

  // On first load, if a token is already saved, verify it and restore the session.
  useEffect(() => {
    const restore = async () => {
      const savedToken = localStorage.getItem("chd_token");
      if (!savedToken) {
        setLoading(false);
        return;
      }
      setAuthToken(savedToken);
      try {
        const me = await fetchMe();
        setUser(me);
        setToken(savedToken);
      } catch {
        // token expired or invalid — clear it
        localStorage.removeItem("chd_token");
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem("chd_token", data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    localStorage.setItem("chd_token", data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("chd_token");
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
};
