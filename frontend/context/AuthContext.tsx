"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types";
import {
  fetchCurrentUser,
  loginUser,
  registerUser,
  clearStoredToken,
  getStoredToken,
  updateUserProfile as apiUpdateProfile,
} from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = getStoredToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          const profile = await fetchCurrentUser();
          setUser(profile);
        } catch {
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    if (res.user) setUser(res.user);
    if (res.token) setToken(res.token);
  };

  const register = async (payload: any) => {
    const res = await registerUser(payload);
    if (res.user) setUser(res.user);
    if (res.token) setToken(res.token);
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await apiUpdateProfile(updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
