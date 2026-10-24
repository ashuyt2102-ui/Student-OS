"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import { AttendanceRecord, MarksRecord, ExamRecord, SyllabusRecord } from "@/types";

export default function StudentOverviewPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  const [attendanceStats, setAttendanceStats] = useState({ present: 109, late: 4, absent: 9, rate: "92.4" });
  const [marks, setMarks] = useState<MarksRecord[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusRecord[]>([]);
  const [overallSyllabus, setOverallSyllabus] = useState(68);
  const [avgScore, setAvgScore] = useState("84.6");
  const [scoreRange, setScoreRange] = useState(6);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hr = new Date().getHours();
    setGreeting(hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const loadStudentData = useCallback(async () => {
    try {
      // 1. Attendance
      const attRes = await api.get<{ success: boolean; stats: any }>("/attendance");
      if (attRes.success && attRes.stats) {
        setAttendanceStats(attRes.stats);
      }

      // 2. Marks
      const marksRes = await api.get<{ success: boolean; average: string; marks: MarksRecord[] }>("/marks");
      if (marksRes.success) {
        setMarks(marksRes.marks || []);
        if (marksRes.average) setAvgScore(marksRes.average);
      }

      // 3. Exams
      const examsRes = await api.get<{ success: boolean; exams: ExamRecord[] }>("/exams");
      if (examsRes.success) {
        setExams(examsRes.exams || []);
      }

      // 4. Syllabus
      const sylRes = await api.get<{ success: boolean; overallProgress: number; syllabus: SyllabusRecord[] }>("/syllabus");
      if (sylRes.success) {
        setSyllabus(sylRes.syllabus || []);
        if (sylRes.overallProgress !== undefined) setOverallSyllabus(sylRes.overallProgress);
      }
    } catch (e) {
      console.warn("Failed to load student data:", e);
    }
  }, []);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  // Real-time listener for updates
  useEffect(() => {
    if (!socket) return;

    socket.on("attendance_updated", () => loadStudentData());
    socket.on("marks_updated", () => loadStudentData());
    socket.on("exam_added", () => loadStudentData());
    socket.on("syllabus_updated", () => loadStudentData());

    return () => {
      socket.off("attendance_updated");
      socket.off("marks_updated");
      socket.off("exam_added");
      socket.off("syllabus_updated");
    };
  }, [socket, loadStudentData]);

  // Compute next exam countdown
  const nextExam = exams[0] || {
    title: "Mathematics",
    description: "Algebra & Calculus · Room 204",
    date: new Date(2026, 9, 22).toISOString(),
  };

  const diffDays = Math.max(
    0,
    Math.ceil((new Date(nextExam.date).getTime() - new Date(2026, 9, 18).getTime()) / (1000 * 60 * 60 * 24))
  );

  // Scores for bar chart
  const recentMarks = marks.slice(0, scoreRange).reverse();
  const chartScores = recentMarks.map((m, idx) => ({
    label: `T${idx + 1}`,
    score: m.score,
    classAvg: Math.round(m.score * 0.9),
  }));

  // Study focus: subjects with lowest progress
  const focusSubjects = [...syllabus].sort((a, b) => a.progress - b.progress).slice(0, 3);

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome">
        <div>
          <h2>
            {greeting}, {user?.name.split(" ")[0] || "Alex"} <span aria-hidden="true">✳</span>
          </h2>
          <p>A clear view of your progress. Keep your momentum going.</p>
          <div className="date">WEEK 08 &nbsp;·&nbsp; TERM 1</div>
        </div>
        <div className="pill">↑ On track this week</div>
      </div>

      {/* 4 Stats Cards */}
      <div className="stats">
        <article className="card">
          <div className="stat-top">
            Attendance rate <span className="stat-icon">◷</span>
          </div>
          <div className="metric">
            {attendanceStats.rate}
            <span>%</span>
          </div>
          <div className="delta">↑ 2.4% <span className="muted">vs last month</span></div>
        </article>

        <article className="card">
          <div className="stat-top">
            Syllabus completed <span className="stat-icon">▤</span>
          </div>
          <div className="metric">
            {overallSyllabus}
            <span>%</span>
          </div>
          <div className="delta">↑ 12% <span className="muted">this month</span></div>
        </article>

        <article className="card">
          <div className="stat-top">
            Average test score <span className="stat-icon">↗</span>
          </div>
          <div className="metric">
            {avgScore}
            <span>/100</span>
          </div>
          <div className="delta">↑ 4.8 pts <span className="muted">over 4 tests</span></div>
        </article>

        <article className="card">
          <div className="stat-top">
            Next exam <span className="stat-icon">▣</span>
          </div>
          <div className="metric">
            {diffDays < 10 ? `0${diffDays}` : diffDays}
            <span> days</span>
          </div>
          <div className="muted" style={{ fontSize: "11px" }}>
            {nextExam.title} · {new Date(nextExam.date).toLocaleDateString([], { day: "numeric", month: "short" })}
          </div>
        </article>
      </div>

      {/* Grid Main 1: Performance Chart & Attendance Donut */}
      <div className="grid-main">
        <article className="card">
          <div className="card-head">
            <div>
              <h3>Academic performance</h3>
              <p>Your scores across recent tests</p>
            </div>
            <select
              className="tiny-select"
              value={scoreRange}
              onChange={(e) => setScoreRange(+e.target.value)}
            >
              <option value="6">Last 6 tests</option>
              <option value="4">Last 4 tests</option>
            </select>
          </div>
          <div className="chart">
            <div className="ylabels">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            <div className="plot">
              {chartScores.length > 0 ? (
                chartScores.map((s, idx) => (
                  <div key={idx} className="barcol">
                    <div className="barpair">
                      <div
                        className="barx secondary"
                        style={{ height: `${s.classAvg}%` }}
                        title={`Class avg ${s.classAvg}%`}
                      />
                      <div
                        className="barx"
                        style={{ height: `${s.score}%` }}
                        title={`Your score ${s.score}%`}
                      />
                    </div>
                    <label>{s.label}</label>
                  </div>
                ))
              ) : (
                <div style={{ display: "grid", placeItems: "center", width: "100%", color: "var(--muted)", fontSize: "11px" }}>
                  No recent tests recorded
                </div>
              )}
            </div>
          </div>
          <div className="legend">
            <span><i className="dot" /> Your score</span>
            <span><i className="dot pale" /> Class average</span>
          </div>
        </article>

        <article className="card">
          <div className="card-head">
            <div>
              <h3>Attendance overview</h3>
              <p>Present days this term</p>
            </div>
            <button className="tiny-select" onClick={() => router.push("/student/attendance")}>
              View details ↗
            </button>
          </div>
          <div className="donutwrap">
            <div
              className="donut"
              style={{
                background: `conic-gradient(var(--accent) 0 ${attendanceStats.rate}%, var(--line) ${attendanceStats.rate}% 100%)`,
              }}
            >
              <div className="donutcenter">
                <strong>{attendanceStats.rate}%</strong>
                <small>ATTENDANCE</small>
              </div>
            </div>
            <div className="legendlist">
              <div className="legendrow">
                <i className="dot" /> Present <strong>{attendanceStats.present}</strong>
              </div>
              <div className="legendrow">
                <i className="dot green" /> Late <strong>{attendanceStats.late}</strong>
              </div>
              <div className="legendrow">
                <i className="dot grey" /> Absent <strong>{attendanceStats.absent}</strong>
              </div>
            </div>
          </div>
          <p className="muted" style={{ fontSize: "11px", margin: "7px 0 0" }}>
            You are above the 90% target. Nice consistency.
          </p>
        </article>
      </div>

      {/* Grid Main 2: Upcoming exams & Syllabus Progress */}
      <div className="grid-main">
        <article className="card">
          <div className="card-head">
            <div>
              <h3>Upcoming exams</h3>
              <p>Stay prepared for what’s next</p>
            </div>
            <button className="tiny-select" onClick={() => router.push("/student/exams")}>
              Full calendar ↗
            </button>
          </div>
          <div className="upcoming">
            {exams.slice(0, 3).map((ex, i) => {
              const d = new Date(ex.date);
              const dayNum = d.getDate();
              const monthStr = d.toLocaleDateString([], { month: "short" }).toUpperCase();
              return (
                <div key={ex._id || i} className="exam">
                  <div className="datebox">
                    <small>{monthStr}</small>
                    <strong>{dayNum < 10 ? `0${dayNum}` : dayNum}</strong>
                  </div>
                  <div>
                    <strong>{ex.title}</strong>
                    <p>{ex.description || `${ex.subject} · ${ex.room}`}</p>
                  </div>
                  <span className={`tag ${i === 0 ? "amber" : ""}`}>
                    {i === 0 ? `In ${diffDays} days` : `In ${diffDays + (i * 3)} days`}
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="card">
          <div className="card-head">
            <div>
              <h3>Syllabus progress</h3>
              <p>Completion by subject</p>
            </div>
            <button className="tiny-select" onClick={() => router.push("/student/syllabus")}>
              View all ↗
            </button>
          </div>
          <div>
            {syllabus.map((s) => (
              <div key={s._id} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "7px", fontSize: "11px" }}>
                  <span>{s.subject}</span>
                  <strong>{s.progress}%</strong>
                </div>
                <div style={{ height: "6px", background: "var(--line)", borderRadius: "9px", overflow: "hidden" }}>
                  <div style={{ width: `${s.progress}%`, height: "100%", background: "var(--accent)", borderRadius: "9px", transition: "width 0.4s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Lower Row: Recent test results & Study Focus */}
      <div className="lower">
        <article className="card">
          <div className="card-head">
            <div>
              <h3>Recent test results</h3>
              <p>A quick look at your latest assessments</p>
            </div>
            <button className="tiny-select" onClick={() => router.push("/student/marks")}>
              All results ↗
            </button>
          </div>
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Assessment</th>
                  <th>Score</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {marks.slice(0, 4).map((r, i) => (
                  <tr key={r._id || i}>
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
                      <div className="score">
                        <strong>{r.score}/100</strong>
                        <div className="minibar">
                          <i style={{ width: `${r.score}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className={`status ${r.score < 80 ? "amber" : ""}`}>
                      {r.score >= 85 ? "↑ 5 pts" : "― 0 pts"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <div className="card-head">
            <div>
              <h3>Suggested study focus</h3>
              <p>Keep your next assessments on track</p>
            </div>
            <button className="tiny-select" onClick={() => router.push("/student/syllabus")}>
              View syllabus ↗
            </button>
          </div>
          <div className="upcoming">
            {focusSubjects.map((s, idx) => (
              <div key={s._id} className="exam">
                <div className="datebox">
                  <small>FOCUS</small>
                  <strong>0{idx + 1}</strong>
                </div>
                <div>
                  <strong>{s.subject}</strong>
                  <p>{s.topic} · {s.progress}% complete</p>
                </div>
                <span className={`tag ${idx === 0 ? "amber" : ""}`}>
                  {idx === 0 ? "Review" : idx === 1 ? "Practise" : "Upcoming"}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
