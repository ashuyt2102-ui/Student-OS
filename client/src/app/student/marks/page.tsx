"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { MarksRecord } from "@/types";

export default function StudentMarksPage() {
  const { socket, showToast } = useSocket();
  const [marks, setMarks] = useState<MarksRecord[]>([]);
  const [filter, setFilter] = useState("All subjects");
  const [average, setAverage] = useState("84.6");

  const loadMarks = async () => {
    try {
      const res = await api.get<{ success: boolean; average: string; marks: MarksRecord[] }>("/marks");
      if (res.success && res.marks) {
        setMarks(res.marks);
        if (res.average) setAverage(res.average);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadMarks();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("marks_updated", () => {
      loadMarks();
      showToast("⚡ Grade book updated: latest score synced");
    });
    return () => {
      socket.off("marks_updated");
    };
  }, [socket, showToast]);

  const filtered = marks.filter(
    (m) => filter === "All subjects" || m.subject.toLowerCase() === filter.toLowerCase()
  );

  return (
    <article className="card page-placeholder">
      <div className="card-head">
        <div>
          <h3>Marks analytics & Grade book</h3>
          <p>
            Track test scores, spot academic strengths, and review assessment history · Term Average: <strong>{average}/100</strong>
          </p>
        </div>
        <select className="tiny-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All subjects">All subjects</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Computer Science">Computer Science</option>
        </select>
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Assessment</th>
              <th>Score</th>
              <th>Date</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "24px 0" }}>
                  No assessment results found for {filter}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="subject">
                      <span className="subjectico">
                        {r.subject.toLowerCase().includes("math") ? "∑" : r.subject.toLowerCase().includes("phys") ? "⚛" : r.subject.toLowerCase().includes("chem") ? "⚗" : "⌘"}
                      </span>
                      {r.subject}
                    </div>
                  </td>
                  <td>{r.examType}</td>
                  <td>
                    <strong>{r.score}/{r.maxScore || 100}</strong>
                  </td>
                  <td>{new Date(r.date).toLocaleDateString([], { day: "numeric", month: "short" })}</td>
                  <td>
                    <div className="score">
                      <div className="minibar">
                        <i style={{ width: `${r.score}%` }} />
                      </div>
                      <span className={`status ${r.score < 80 ? "amber" : ""}`}>
                        {r.score >= 85 ? "Strong" : r.score >= 75 ? "Good" : "Review"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
