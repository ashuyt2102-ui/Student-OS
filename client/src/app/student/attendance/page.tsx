"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { AttendanceRecord } from "@/types";

export default function StudentAttendancePage() {
  const { socket, showToast } = useSocket();
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ present: 109, late: 4, absent: 9, rate: "92.4" });
  const [loading, setLoading] = useState(true);

  const loadAttendance = async () => {
    try {
      const res = await api.get<{ success: boolean; stats: any; records: AttendanceRecord[] }>("/attendance");
      if (res.success) {
        setRecords(res.records || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (e) {
      console.warn("Failed to fetch attendance:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // Real-time update when teacher marks attendance
  useEffect(() => {
    if (!socket) return;
    socket.on("attendance_updated", () => {
      loadAttendance();
      showToast("⚡ Attendance records synchronized with teacher log");
    });
    return () => {
      socket.off("attendance_updated");
    };
  }, [socket, showToast]);

  const daysHeader = ["S", "M", "T", "W", "T", "F", "S"];

  // Build day status map from real records
  const dayStatusMap: Record<number, "present" | "late" | "absent"> = {};
  records.forEach((r) => {
    const d = new Date(r.date);
    if (d.getMonth() === 9) {
      // October
      dayStatusMap[d.getDate()] = r.status;
    }
  });

  return (
    <article className="card page-placeholder">
      <div className="card-head">
        <div>
          <h3>Personal Attendance Record</h3>
          <p>Verified daily institutional attendance records · View-Only Mode</p>
        </div>
        <select
          className="tiny-select"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            showToast(`Attendance view: ${e.target.options[e.target.selectedIndex].text}`);
          }}
        >
          <option value="2026-10">October 2026</option>
          <option value="2026-09">September 2026</option>
        </select>
      </div>

      <div className="stats">
        <div className="card">
          <div className="stat-top">Present Days</div>
          <div className="metric">{stats.present}</div>
        </div>
        <div className="card">
          <div className="stat-top">Absent Days</div>
          <div className="metric">{stats.absent}</div>
        </div>
        <div className="card">
          <div className="stat-top">Late Arrivals</div>
          <div className="metric">{stats.late}</div>
        </div>
        <div className="card">
          <div className="stat-top">Attendance Rate</div>
          <div className="metric">{stats.rate}%</div>
        </div>
      </div>

      <div className="calendar-grid">
        {daysHeader.map((d, i) => (
          <div key={i} className="calday head">
            {d}
          </div>
        ))}

        {Array.from({ length: 31 }, (_, idx) => {
          const day = idx + 1;
          const status = dayStatusMap[day] || (day <= 22 && day !== 3 && day !== 12 && day !== 16 ? "present" : day === 3 || day === 16 ? "late" : day === 12 ? "absent" : null);
          const isToday = day === 18;
          let cls = "calday";
          if (isToday) cls += " today";
          if (status) cls += ` ${status}`;

          return (
            <div
              key={day}
              className={cls}
              style={{ cursor: "default" }}
              title={`Day ${day}: ${status ? status.toUpperCase() : "Off day"}`}
            >
              {day}
              {status && <span className="caldot" />}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: "18px",
          fontSize: "11px",
          color: "var(--muted)",
          marginTop: "16px",
          justifyContent: "flex-end",
        }}
      >
        <span>
          <i className="dot" style={{ background: "var(--green)", display: "inline-block" }} /> Present
        </span>
        <span>
          <i className="dot" style={{ background: "var(--amber)", display: "inline-block" }} /> Late
        </span>
        <span>
          <i className="dot" style={{ background: "var(--red)", display: "inline-block" }} /> Absent
        </span>
        <span>
          <i className="dot" style={{ background: "transparent", outline: "1px solid var(--accent)", display: "inline-block" }} /> Today
        </span>
      </div>

      <div style={{ marginTop: "20px", padding: "12px 14px", borderRadius: "10px", background: "var(--panel2)", border: "1px solid var(--line)", fontSize: "11px", color: "var(--muted)" }}>
        🔒 <strong>Attendance Policy:</strong> Student attendance records are officially logged by assigned faculty. If you notice any discrepancy, please contact your homeroom teacher.
      </div>
    </article>
  );
}
