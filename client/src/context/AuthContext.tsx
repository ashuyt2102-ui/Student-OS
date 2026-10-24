"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (formData: any) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("atlas_token");
      if (savedToken) {
        setToken(savedToken);
        try {
          const res = await api.get<{ success: boolean; user: any }>("/auth/me");
          if (res.success && res.user) {
            setUser({
              id: res.user._id || res.user.id,
              name: res.user.name,
              email: res.user.email,
              role: res.user.role,
              grade: res.user.grade,
              section: res.user.section,
              subject: res.user.subject,
              studentId: res.user.studentId,
              isApproved: res.user.isApproved,
              avatar: res.user.avatar,
            });
          }
        } catch (err) {
          console.warn("Session check failed, clearing token");
          localStorage.removeItem("atlas_token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; token: string; user: any }>("/auth/login", {
      email,
      password,
    });

    if (res.success && res.token) {
      localStorage.setItem("atlas_token", res.token);
      setToken(res.token);
      const authUser: User = {
        id: res.user.id || res.user._id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        grade: res.user.grade,
        section: res.user.section,
        subject: res.user.subject,
        studentId: res.user.studentId,
        isApproved: res.user.isApproved,
        avatar: res.user.avatar,
      };
      setUser(authUser);

      // Route based on role
      if (authUser.role === "student") router.push("/student");
      else if (authUser.role === "teacher") router.push("/teacher");
      else if (authUser.role === "principal") router.push("/principal");

      return authUser;
    }
    throw new Error("Login failed");
  };

  const signup = async (formData: any) => {
    const res = await api.post<any>("/auth/signup", formData);
    if (res.success && res.token) {
      localStorage.setItem("atlas_token", res.token);
      setToken(res.token);
      const authUser: User = {
        id: res.user.id || res.user._id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        grade: res.user.grade,
        section: res.user.section,
        subject: res.user.subject,
        studentId: res.user.studentId,
        isApproved: res.user.isApproved,
        avatar: res.user.avatar,
      };
      setUser(authUser);

      if (authUser.role === "student") router.push("/student");
      else if (authUser.role === "teacher") router.push("/teacher");
      else if (authUser.role === "principal") router.push("/principal");
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    localStorage.removeItem("atlas_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const res = await api.get<{ success: boolean; user: any }>("/auth/me");
      if (res.success && res.user) {
        setUser({
          id: res.user._id || res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          grade: res.user.grade,
          section: res.user.section,
          subject: res.user.subject,
          studentId: res.user.studentId,
          isApproved: res.user.isApproved,
          avatar: res.user.avatar,
        });
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        refreshUser,
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
