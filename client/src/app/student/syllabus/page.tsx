"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { SyllabusRecord } from "@/types";

export default function StudentSyllabusPage() {
  const { socket, showToast } = useSocket();
  const [syllabus, setSyllabus] = useState<SyllabusRecord[]>([]);
  const [filter, setFilter] = useState("All");

  const loadSyllabus = async () => {
    try {
      const res = await api.get<{ success: boolean; syllabus: SyllabusRecord[] }>("/syllabus");
      if (res.success && res.syllabus) {
        setSyllabus(res.syllabus);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadSyllabus();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("syllabus_updated", () => {
      loadSyllabus();
      showToast("⚡ Syllabus tracker updated in real time");
    });
    return () => {
      socket.off("syllabus_updated");
    };
  }, [socket, showToast]);

  const filtered = syllabus.filter(
    (s) => filter === "All" || s.subject.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <article className="card page-placeholder">
      <div className="card-head">
        <div>
          <h3>Syllabus tracker</h3>
          <p>Track chapters completed and topics remaining across your subjects</p>
        </div>
        <select className="tiny-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All subjects</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Computer Science">Computer Science</option>
        </select>
      </div>

      <div>
        {filtered.map((s) => (
          <div key={s._id} className="syllabus-subject">
            <div className="syllabus-header">
              <div className="subjectico">
                {s.subject.toLowerCase().includes("math") ? "∑" : s.subject.toLowerCase().includes("phys") ? "⚛" : s.subject.toLowerCase().includes("chem") ? "⚗" : "⌘"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <strong>{s.subject}</strong>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent)" }}>
                    {s.progress}% · {s.completedTopics || (s.chapters ? s.chapters.filter((c) => c.done).length : 0)}/{s.totalTopics || (s.chapters ? s.chapters.length : 0)} topics
                  </span>
                </div>
                <div style={{ height: "6px", background: "var(--line)", borderRadius: "9px", overflow: "hidden" }}>
                  <div style={{ width: `${s.progress}%`, height: "100%", background: "var(--accent)", borderRadius: "9px", transition: "width 0.35s ease" }} />
                </div>
              </div>
            </div>

            <div className="syllabus-topic-list">
              {s.chapters && s.chapters.length > 0 ? (
                s.chapters.map((ch, idx) => (
                  <div key={idx} className="topic-item">
                    <span style={{ color: ch.done ? "var(--green)" : "var(--muted)", fontSize: "13px" }}>
                      {ch.done ? "✓" : "○"}
                    </span>
                    <span style={{ color: ch.done ? "var(--text)" : "var(--muted)", textDecoration: ch.done ? "none" : "none" }}>
                      {ch.name}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "10px", color: ch.done ? "var(--green)" : "var(--muted)" }}>
                      {ch.done ? "Completed" : "In Progress"}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "11px", color: "var(--muted)", padding: "4px 0" }}>
                  Curriculum topics currently being curated by faculty.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
