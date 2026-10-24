"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import { AttendanceRecord, MarksRecord, ExamRecord, SyllabusRecord } from "@/types";

export default function TeacherOverviewPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarksRecord[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [attRes, marksRes, examsRes, sylRes] = await Promise.all([
        api.get<{ success: boolean; records: AttendanceRecord[] }>("/attendance"),
        api.get<{ success: boolean; marks: MarksRecord[]; average: string }>("/marks"),
        api.get<{ success: boolean; exams: ExamRecord[] }>("/exams"),
        api.get<{ success: boolean; syllabus: SyllabusRecord[] }>("/syllabus"),
      ]);

      if (attRes.success) setAttendance(attRes.records || []);
      if (marksRes.success) setMarks(marksRes.marks || []);
      if (examsRes.success) setExams(examsRes.exams || []);
      if (sylRes.success) setSyllabus(sylRes.syllabus || []);
    } catch (e) {
      console.warn("Failed to load teacher data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!socket) return;
    socket.on("attendance_updated", loadData);
    socket.on("marks_updated", loadData);
    socket.on("exam_added", loadData);
    socket.on("syllabus_updated", loadData);
    return () => {
      socket.off("attendance_updated", loadData);
      socket.off("marks_updated", loadData);
      socket.off("exam_added", loadData);
      socket.off("syllabus_updated", loadData);
    };
  }, [socket, loadData]);

  // Derived stats
  const uniqueStudents = new Set(
    attendance.map((r) => (typeof r.student === "string" ? r.student : r.student?.id))
  ).size;

  const presentCount = attendance.filter((r) => r.status === "present").length;
  const lateCount = attendance.filter((r) => r.status === "late").length;
  const absentCount = attendance.filter((r) => r.status === "absent").length;
  const attendanceRate =
    attendance.length > 0
      ? (((presentCount + lateCount) / attendance.length) * 100).toFixed(1)
      : "0.0";

  const avgScore =
    marks.length > 0
      ? (marks.reduce((s, m) => s + (m.score / m.maxScore) * 100, 0) / marks.length).toFixed(1)
      : "0.0";

  const now = new Date();
  const upcomingExams = exams.filter((e) => new Date(e.date) >= now);
  const nextThreeExams = upcomingExams.slice(0, 3);

  // Bar chart: last 6 exams average score grouped by subject
  const subjectScores: Record<string, number[]> = {};
  marks.forEach((m) => {
    if (!subjectScores[m.subject]) subjectScores[m.subject] = [];
    subjectScores[m.subject].push((m.score / m.maxScore) * 100);
  });
  const chartData = Object.entries(subjectScores)
    .slice(0, 6)
    .map(([subject, scores]) => ({
      subject: subject.slice(0, 4).toUpperCase(),
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));

  // Donut chart percentages
  const total = attendance.length || 1;
  const donutPresent = Math.round((presentCount / total) * 100);
  const donutLate = Math.round((lateCount / total) * 100);
  const donutAbsent = Math.round((absentCount / total) * 100);

  // Syllabus by subject
  const syllabusSubjects = syllabus.reduce<Record<string, SyllabusRecord[]>>((acc, s) => {
    if (!acc[s.subject]) acc[s.subject] = [];
    acc[s.subject].push(s);
    return acc;
  }, {});

  const subjectProgress = Object.entries(syllabusSubjects).map(([subject, recs]) => ({
    subject,
    progress: Math.round(recs.reduce((a, r) => a + r.progress, 0) / recs.length),
  }));

  if (loading) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <p className="muted">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome">
        <div>
          <h2>
            Welcome back, {user?.name?.split(" ")[0] || "Teacher"} 👋
          </h2>
          <p>Here's an overview of your classes and student progress.</p>
          <div className="date">TEACHER DASHBOARD</div>
        </div>
        <div className="pill">Teacher</div>
      </div>

      {/* 4 Stats Cards */}
      <div className="stats">
        <article className="card">
          <div className="stat-top">
            Total Students <span className="stat-icon">👥</span>
          </div>
          <div className="metric">
            {uniqueStudents}<span> students</span>
          </div>
          <div className="delta muted">Across all classes</div>
        </article>

        <article className="card">
          <div className="stat-top">
            Attendance Rate <span className="stat-icon">📋</span>
          </div>
          <div className="metric">
            {attendanceRate}<span>%</span>
          </div>
          <div className="delta muted">Class overall</div>
        </article>

        <article className="card">
          <div className="stat-top">
            Average Score <span className="stat-icon">📊</span>
          </div>
          <div className="metric">
            {avgScore}<span>%</span>
          </div>
          <div className="delta muted">All assessments</div>
        </article>

        <article className="card">
          <div className="stat-top">
            Upcoming Exams <span className="stat-icon">📅</span>
          </div>
          <div className="metric">
            {upcomingExams.length}<span> exams</span>
          </div>
          <div className="delta muted">Scheduled ahead</div>
        </article>
      </div>

      {/* Main Grid */}
      <div className="grid-main">
        {/* Bar Chart */}
        <article className="card">
          <div className="card-head">
            <div>
              <h3>Subject Score Averages</h3>
              <p>Class performance by subject</p>
            </div>
          </div>
          {chartData.length === 0 ? (
            <p className="muted" style={{ padding: "24px 0" }}>No marks data yet.</p>
          ) : (
            <div className="chart">
              <div className="ylabels">
                {[100, 75, 50, 25, 0].map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
              <div className="plot">
                {chartData.map((d) => (
                  <div key={d.subject} className="barcol">
                    <div
                      className="barpair"
                      style={{ height: "100%", display: "flex", alignItems: "flex-end", gap: "4px" }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: `${d.avg}%`,
                          background: "var(--accent)",
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.4s ease",
                        }}
                      />
                    </div>
                    <div className="barx">{d.subject}</div>
                    <label>{d.avg}%</label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Donut Chart */}
        <article className="card">
          <div className="card-head">
            <div>
              <h3>Class Attendance</h3>
              <p>Overall breakdown</p>
            </div>
          </div>
          <div className="donutwrap">
            <div className="donut">
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--line)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="var(--green, #22c55e)" strokeWidth="3"
                  strokeDasharray={`${donutPresent} ${100 - donutPresent}`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="var(--amber, #f59e0b)" strokeWidth="3"
                  strokeDasharray={`${donutLate} ${100 - donutLate}`}
                  strokeDashoffset={`${-donutPresent}`}
                />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="var(--red, #ef4444)" strokeWidth="3"
                  strokeDasharray={`${donutAbsent} ${100 - donutAbsent}`}
                  strokeDashoffset={`${-(donutPresent + donutLate)}`}
                />
              </svg>
              <div className="donutcenter">
                <strong>{attendanceRate}%</strong>
                <span>present</span>
              </div>
            </div>
            <div className="legendlist">
              <div className="legendrow">
                <span className="dot" style={{ background: "var(--green, #22c55e)" }} />
                Present <span className="muted">({donutPresent}%)</span>
              </div>
              <div className="legendrow">
                <span className="dot" style={{ background: "var(--amber, #f59e0b)" }} />
                Late <span className="muted">({donutLate}%)</span>
              </div>
              <div className="legendrow">
                <span className="dot" style={{ background: "var(--red, #ef4444)" }} />
                Absent <span className="muted">({donutAbsent}%)</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Lower Row */}
      <div className="lower">
        {/* Upcoming Exams */}
        <article className="card">
          <div className="card-head">
            <div>
              <h3>Upcoming Exams</h3>
              <p>Next scheduled assessments</p>
            </div>
            <button className="tiny-select" onClick={() => router.push("/teacher/exams")}>
              All exams →
            </button>
          </div>
          <div className="upcoming">
            {nextThreeExams.length === 0 ? (
              <p className="muted">No upcoming exams.</p>
            ) : (
              nextThreeExams.map((ex, i) => {
                const d = new Date(ex.date);
                const monthStr = d.toLocaleString("default", { month: "short" }).toUpperCase();
                const dayNum = d.getDate();
                const daysAway = Math.ceil((d.getTime() - now.getTime()) / 86400000);
                return (
                  <div key={ex._id} className="exam">
                    <div className="datebox">
                      <small>{monthStr}</small>
                      <strong>{dayNum < 10 ? `0${dayNum}` : dayNum}</strong>
                    </div>
                    <div>
                      <strong>{ex.title}</strong>
                      <p>{ex.subject} · {ex.class} · {ex.room}</p>
                    </div>
                    <span className={`tag ${ex.priority === "high" || i === 0 ? "amber" : ""}`}>
                      {daysAway === 0 ? "Today" : daysAway === 1 ? "Tomorrow" : `In ${daysAway}d`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </article>

        {/* Syllabus Progress */}
        <article className="card">
          <div className="card-head">
            <div>
              <h3>Syllabus Progress</h3>
              <p>Completion by subject</p>
            </div>
            <button className="tiny-select" onClick={() => router.push("/teacher/syllabus")}>
              Manage →
            </button>
          </div>
          <div>
            {subjectProgress.length === 0 ? (
              <p className="muted">No syllabus data yet.</p>
            ) : (
              subjectProgress.map((s) => (
                <div key={s.subject} style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "7px",
                      fontSize: "11px",
                    }}
                  >
                    <span>{s.subject}</span>
                    <strong>{s.progress}%</strong>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "var(--line)",
                      borderRadius: "9px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${s.progress}%`,
                        height: "100%",
                        background: "var(--accent)",
                        borderRadius: "9px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      {/* Quick Actions */}
      <article className="card" style={{ marginTop: "16px" }}>
        <div className="card-head">
          <div>
            <h3>Quick Actions</h3>
            <p>Common tasks at a glance</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => router.push("/teacher/attendance")}>
            Mark Attendance →
          </button>
          <button className="btn-primary" onClick={() => router.push("/teacher/marks")}>
            Add Marks →
          </button>
          <button className="btn-primary" onClick={() => router.push("/teacher/exams")}>
            Add Exam →
          </button>
          <button className="btn-ghost" onClick={() => router.push("/teacher/syllabus")}>
            Update Syllabus →
          </button>
        </div>
      </article>
    </div>
  );
}
