"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { ExamRecord } from "@/types";

export default function StudentExamsPage() {
  const { socket, showToast } = useSocket();
  const [exams, setExams] = useState<ExamRecord[]>([]);

  const loadExams = async () => {
    try {
      const res = await api.get<{ success: boolean; exams: ExamRecord[] }>("/exams");
      if (res.success && res.exams) {
        setExams(res.exams);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("exam_added", (data: any) => {
      loadExams();
      showToast(`⚡ New assessment added: ${data.exam?.title || "Exam"}`);
    });
    return () => {
      socket.off("exam_added");
    };
  }, [socket, showToast]);

  const daysHeader = ["S", "M", "T", "W", "T", "F", "S"];
  const examDays = exams.map((e) => new Date(e.date).getDate());

  return (
    <article className="card page-placeholder">
      <div className="card-head">
        <div>
          <h3>Exam calendar & schedules</h3>
          <p>October 2026 · upcoming institutional assessments with live countdowns</p>
        </div>
        <button className="tiny-select" onClick={() => showToast("Showing all scheduled assessments")}>
          Filter: All Terms ↗
        </button>
      </div>

      <div className="calendar-grid">
        {daysHeader.map((d, i) => (
          <div key={i} className="calday head">
            {d}
          </div>
        ))}

        {Array.from({ length: 31 }, (_, idx) => {
          const day = idx + 1;
          const isToday = day === 18;
          const hasExam = examDays.includes(day);
          let cls = "calday";
          if (isToday) cls += " today";
          if (hasExam) cls += " event";

          return (
            <div
              key={day}
              className={cls}
              onClick={() => {
                if (hasExam) {
                  const match = exams.find((e) => new Date(e.date).getDate() === day);
                  if (match) showToast(`${match.title}: ${match.description} (${match.time})`);
                }
              }}
              title={hasExam ? "Exam Scheduled" : undefined}
            >
              {day}
              {hasExam && <span className="caldot" />}
            </div>
          );
        })}
      </div>

      <div className="upcoming" style={{ marginTop: "25px" }}>
        {exams.map((ex, i) => {
          const d = new Date(ex.date);
          const dayNum = d.getDate();
          const monthStr = d.toLocaleDateString([], { month: "short" }).toUpperCase();
          const isPriority = ex.priority === "high" || i === 0;

          return (
            <div key={ex._id || i} className="exam">
              <div className="datebox">
                <small>{monthStr}</small>
                <strong>{dayNum < 10 ? `0${dayNum}` : dayNum}</strong>
              </div>
              <div>
                <strong>{ex.title}</strong>
                <p>
                  {ex.description || ex.subject} · {ex.room || "Room 204"} · {ex.time}
                </p>
              </div>
              <span className={`tag ${isPriority ? "amber" : ""}`}>
                {isPriority ? "High priority" : "Upcoming"}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
