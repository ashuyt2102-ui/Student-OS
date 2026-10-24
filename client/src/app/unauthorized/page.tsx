"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const backHref = user?.role === "principal" ? "/principal" : user?.role === "teacher" ? "/teacher" : "/student";

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px 16px", background: "var(--bg)" }}>
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "40px 32px",
          textAlign: "center",
          borderRadius: "18px",
          boxShadow: "0 16px 42px #0000001a",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "color-mix(in srgb, var(--red) 15%, transparent)",
            color: "var(--red)",
            display: "grid",
            placeItems: "center",
            fontSize: "24px",
            margin: "0 auto 18px",
          }}
        >
          ⛔
        </div>

        <h2 style={{ fontSize: "22px", letterSpacing: "-0.6px", margin: "0 0 8px" }}>403 — Restricted Access</h2>
        <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: 1.5, margin: "0 0 24px" }}>
          You do not have the required permissions to view this resource. Role-Based Access Control (RBAC) is enforced.
        </p>

        <div style={{ padding: "12px", background: "var(--panel2)", borderRadius: "10px", fontSize: "12px", marginBottom: "24px", textAlign: "left" }}>
          <div style={{ color: "var(--muted)", marginBottom: "4px" }}>Current Session Role:</div>
          <strong style={{ color: "var(--accent)", textTransform: "uppercase" }}>{user?.role || "Unauthenticated"}</strong>
        </div>

        <Link
          href={backHref}
          className="btn-primary"
          style={{ display: "inline-block", textDecoration: "none", padding: "10px 20px" }}
        >
          Return to My Workspace
        </Link>
      </div>
    </div>
  );
}
