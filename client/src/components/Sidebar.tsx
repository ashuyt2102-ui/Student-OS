"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Role-based navigation items
  const studentNav = [
    { href: "/student", label: "Overview", icon: "▦" },
    { href: "/student/attendance", label: "Attendance", icon: "◷" },
    { href: "/student/syllabus", label: "Syllabus tracker", icon: "▤" },
    { href: "/student/exams", label: "Exams & calendar", icon: "▣" },
    { href: "/student/marks", label: "Marks analytics", icon: "↗" },
  ];

  const teacherNav = [
    { href: "/teacher", label: "Overview", icon: "▦" },
    { href: "/teacher/attendance", label: "Attendance Cycle", icon: "◷" },
    { href: "/teacher/syllabus", label: "Syllabus tracker", icon: "▤" },
    { href: "/teacher/exams", label: "Exam schedules", icon: "▣" },
    { href: "/teacher/marks", label: "Marks & tests", icon: "↗" },
    { href: "/teacher/notifications", label: "Notifications", icon: "♧" },
  ];

  const principalNav = [
    { href: "/principal", label: "School Overview", icon: "▦" },
    { href: "/principal/students", label: "Manage Students", icon: "👥" },
    { href: "/principal/teachers", label: "Teacher Approvals", icon: "✓" },
    { href: "/principal/attendance", label: "All Attendance", icon: "◷" },
    { href: "/principal/marks", label: "All Marks", icon: "↗" },
    { href: "/principal/exams", label: "Manage Exams", icon: "▣" },
    { href: "/principal/reports", label: "Export Reports", icon: "▤" },
    { href: "/principal/analytics", label: "System Analytics", icon: "📊" },
  ];

  const navItems =
    user?.role === "principal" ? principalNav : user?.role === "teacher" ? teacherNav : studentNav;

  const roleLabel =
    user?.role === "principal"
      ? "PRINCIPAL"
      : user?.role === "teacher"
      ? "TEACHER"
      : "STUDENT";

  const roleBadgeColor =
    user?.role === "principal"
      ? "var(--red)"
      : user?.role === "teacher"
      ? "var(--amber)"
      : "var(--accent)";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} id="sidebarEl">
      <div className="brand">
        <div className="logo">A</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <strong>atlas</strong>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: "6px",
                background: "var(--panel2)",
                color: roleBadgeColor,
                border: "1px solid var(--line)",
              }}
            >
              {roleLabel}
            </span>
          </div>
          <small>student intelligence</small>
        </div>
      </div>

      <div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                className={isActive ? "active" : ""}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
              >
                <span className="ico">{item.icon}</span> {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="term">
          <small>ACADEMIC YEAR</small>
          <strong>2026 – 2027</strong>
          <div className="bar">
            <i style={{ width: "68%" }}></i>
          </div>
          <small style={{ display: "block", marginTop: "8px" }}>
            Term 1 · 68% completed
          </small>
        </div>

        <div style={{ position: "relative" }}>
          <div
            className="profile"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            style={{ cursor: "pointer", userSelect: "none" }}
            title="Click for account options"
          >
            <div className="avatar">{user?.avatar || "AS"}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "User"}
              </strong>
              <small style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.role === "teacher"
                  ? `${user.subject || "Teacher"} · ${user.grade || "Grade 11"}`
                  : user?.role === "principal"
                  ? "School Principal"
                  : `${user?.grade || "Grade 11"} · ${user?.section || "Science"}`}
              </small>
            </div>
            <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "11px" }}>
              {showProfileMenu ? "▴" : "⌄"}
            </span>
          </div>

          {showProfileMenu && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: 0,
                right: 0,
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: "12px",
                padding: "8px",
                boxShadow: "0 8px 24px #0000001f",
                zIndex: 9200,
                display: "grid",
                gap: "4px",
              }}
            >
              <div
                style={{
                  padding: "6px 8px",
                  fontSize: "11px",
                  color: "var(--muted)",
                  borderBottom: "1px solid var(--line)",
                  marginBottom: "4px",
                }}
              >
                Signed in as <strong>{user?.email}</strong>
              </div>
              <button
                type="button"
                className="link-action"
                style={{
                  textAlign: "left",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  color: "var(--red)",
                  fontSize: "11px",
                  width: "100%",
                }}
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
              >
                ← Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
