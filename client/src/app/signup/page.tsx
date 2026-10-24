"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const { showToast } = useSocket();

  const [role, setRole] = useState<"student" | "teacher" | "principal">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("Grade 11");
  const [section, setSection] = useState("Science");
  const [subject, setSubject] = useState("Mathematics");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);
    setLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };

      if (role === "student") {
        payload.grade = grade;
        payload.section = section;
      } else if (role === "teacher") {
        payload.subject = subject;
        payload.grade = grade;
        payload.section = section;
      }

      const res = await signup(payload);

      if (res.isPendingApproval) {
        setSuccessInfo(
          "Registration received! Because you signed up as a Teacher/Staff, your account requires administrator approval from the Principal before you can log in."
        );
      } else {
        showToast("Account created successfully!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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
          maxWidth: "460px",
          padding: "36px 30px",
          boxShadow: "0 16px 42px #0000001a",
          borderRadius: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div className="logo">A</div>
          <div>
            <strong style={{ fontSize: "19px", letterSpacing: "-0.5px", display: "block" }}>atlas</strong>
            <small style={{ color: "var(--muted)", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              student intelligence
            </small>
          </div>
        </div>

        <h2 style={{ fontSize: "20px", letterSpacing: "-0.5px", margin: "0 0 6px" }}>Create your account</h2>
        <p style={{ color: "var(--muted)", fontSize: "12px", margin: "0 0 18px" }}>
          Select your institutional role to set up your workspace
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

        {successInfo ? (
          <div
            style={{
              padding: "16px",
              borderRadius: "11px",
              background: "color-mix(in srgb, var(--green) 12%, transparent)",
              border: "1px solid var(--line)",
              marginBottom: "20px",
            }}
          >
            <h4 style={{ margin: "0 0 6px", color: "var(--green)", fontSize: "14px" }}>Registration Successful</h4>
            <p style={{ margin: "0 0 14px", fontSize: "12px", color: "var(--text)" }}>{successInfo}</p>
            <Link href="/login" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="field">
              <label>Institutional Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                style={{ fontWeight: 650 }}
              >
                <option value="student">🎓 Student Account</option>
                <option value="teacher">👨‍🏫 Teacher / Faculty Account</option>
                <option value="principal">🏛️ Principal / Administrator Account</option>
              </select>
            </div>

            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Sharma"
                required
              />
            </div>

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
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            {role === "student" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="field">
                  <label>Grade Level</label>
                  <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                    <option>Grade 10</option>
                  </select>
                </div>
                <div className="field">
                  <label>Section / Stream</label>
                  <select value={section} onChange={(e) => setSection(e.target.value)}>
                    <option>Science</option>
                    <option>Commerce</option>
                    <option>Humanities</option>
                  </select>
                </div>
              </div>
            )}

            {role === "teacher" && (
              <>
                <div className="field">
                  <label>Subject Specialization</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Computer Science</option>
                    <option>English</option>
                    <option>History</option>
                  </select>
                </div>
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background: "var(--panel2)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    marginBottom: "14px",
                  }}
                >
                  ℹ️ Note: Teacher accounts require administrative verification by the Principal before full activation.
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "12px 0", fontSize: "13px", marginTop: "8px" }}
            >
              {loading ? "Registering account..." : `Create ${role.toUpperCase()} Account`}
            </button>
          </form>
        )}

        <div style={{ marginTop: "22px", textAlign: "center", fontSize: "12px", color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="link-action">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
