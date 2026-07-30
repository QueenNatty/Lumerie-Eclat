"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setTokens, clearTokens } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await api.get("/accounts/profile/", { auth: true });
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("le_access");
    if (hasToken) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [loadProfile]);

  const login = async (username, password) => {
    const data = await api.post("/accounts/login/", { username, password });
    setTokens({ access: data.access, refresh: data.refresh });
    await loadProfile();
  };

  const register = async (payload) => {
    const data = await api.post("/accounts/register/", payload);
    setTokens(data.tokens);
    setUser(data.user);
  };

  const logout = async () => {
    const refresh = typeof window !== "undefined" ? localStorage.getItem("le_refresh") : null;
    try {
      if (refresh) await api.post("/accounts/logout/", { refresh }, { auth: true });
    } catch {
      // even if the server call fails, still clear the local session
    }
    clearTokens();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_staff,
    login,
    register,
    logout,
    refreshUser: loadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
