"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const base = user?.role === "principal" ? "/principal" : user?.role === "teacher" ? "/teacher" : "/student";

  const allActions = [
    { title: "Attendance Dashboard", type: "Section", path: `${base}/attendance` },
    { title: "Syllabus Tracker", type: "Section", path: `${base}/syllabus` },
    { title: "Exam Calendar & Schedules", type: "Section", path: `${base}/exams` },
    { title: "Marks Analytics", type: "Section", path: `${base}/marks` },
    { title: "Mathematics (Grade 11 Science)", type: "Subject", path: `${base}/syllabus` },
    { title: "Physics (Grade 11 Science)", type: "Subject", path: `${base}/syllabus` },
    { title: "Chemistry (Grade 11 Science)", type: "Subject", path: `${base}/syllabus` },
    { title: "Computer Science (Grade 11 Science)", type: "Subject", path: `${base}/syllabus` },
  ];

  const q = query.trim().toLowerCase();
  const filtered = q ? allActions.filter((a) => a.title.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)) : allActions.slice(0, 5);

  return (
    <div
      className={`modal-backdrop ${isOpen ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3>Atlas Quick Search</h3>
          <button className="link-action" onClick={onClose}>
            Esc ✕
          </button>
        </div>

        <div className="field">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, assessments, syllabus, or sections..."
            autoComplete="off"
          />
        </div>

        <div style={{ maxHeight: "260px", overflowY: "auto", display: "grid", gap: "6px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "16px 8px", fontSize: "11px", color: "var(--muted)", textAlign: "center" }}>
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  background: "var(--panel2)",
                  border: "1px solid var(--line)",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onClick={() => {
                  router.push(item.path);
                  onClose();
                }}
              >
                <div>
                  <strong style={{ fontSize: "12px", display: "block" }}>{item.title}</strong>
                  <small style={{ fontSize: "10px", color: "var(--muted)" }}>{item.type}</small>
                </div>
                <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600 }}>Open ↗</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
