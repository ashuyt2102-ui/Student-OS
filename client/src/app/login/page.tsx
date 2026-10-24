"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useSocket();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}`);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, roleName: string) => {
    setError(null);
    setLoading(true);
    try {
      const user = await login(demoEmail, "password123");
      showToast(`Logged in as ${roleName} (${user.name})`);
    } catch (err: any) {
      setError(err.message || "Failed to log in with demo account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px 16px", background: "var(--bg)" }}>
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px 30px",
          boxShadow: "0 16px 42px #0000001a",
          borderRadius: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div className="logo">A</div>
          <div>
            <strong style={{ fontSize: "19px", letterSpacing: "-0.5px", display: "block" }}>atlas</strong>
            <small style={{ color: "var(--muted)", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              school management intelligence
            </small>
          </div>
        </div>

        <h2 style={{ fontSize: "20px", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Sign in to your account</h2>
        <p style={{ color: "var(--muted)", fontSize: "12px", margin: "0 0 20px" }}>
          Access your personalized role-based dashboard
        </p>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "9px",
              background: "color-mix(in srgb, var(--red) 12%, transparent)",
              color: "var(--red)",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@atlas.edu"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "12px 0", fontSize: "13px", marginTop: "10px" }}
          >
            {loading ? "Authenticating..." : "Sign In to Atlas"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 16px", color: "var(--muted)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span>one-click demo login</span>
          <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
        </div>

        <div style={{ display: "grid", gap: "8px" }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => handleQuickLogin("alex@atlas.edu", "Student")}
            disabled={loading}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px" }}
          >
            <span>🎓 Student: <strong>Alex Sharma</strong></span>
            <span style={{ fontSize: "11px", color: "var(--accent)" }}>Login ↗</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => handleQuickLogin("teacher@atlas.edu", "Teacher")}
            disabled={loading}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px" }}
          >
            <span>👨‍🏫 Teacher: <strong>Dr. Evelyn Reed (Math)</strong></span>
            <span style={{ fontSize: "11px", color: "var(--amber)" }}>Login ↗</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => handleQuickLogin("principal@atlas.edu", "Principal")}
            disabled={loading}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px" }}
          >
            <span>🏛️ Principal: <strong>Dr. Arthur Vance</strong></span>
            <span style={{ fontSize: "11px", color: "var(--red)" }}>Login ↗</span>
          </button>
        </div>

        <div style={{ marginTop: "22px", textAlign: "center", fontSize: "12px", color: "var(--muted)" }}>
          New to Atlas?{" "}
          <Link href="/signup" className="link-action">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
