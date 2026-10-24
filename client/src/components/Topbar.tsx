"use client";

import React, { useEffect, useState, useRef } from "react";
import { toggleTheme } from "./ThemeReveal";
import { useSocket } from "@/context/SocketContext";

interface TopbarProps {
  title: string;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
}

export function Topbar({ title, onOpenMenu, onOpenSearch }: TopbarProps) {
  const { isConnected, notifications, markNotificationRead, showToast, activeCount } = useSocket();
  const [clock, setClock] = useState("Sunday, 18 October 2026");
  const [themeIcon, setThemeIcon] = useState("☾");
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      const dateStr = now.toLocaleDateString("en-GB", options);
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setClock(`${dateStr} · ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.dataset.theme === "dark";
    setThemeIcon(isDark ? "☀" : "☾");
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("#notifyBtn")
      ) {
        setIsNotifyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleThemeClick = () => {
    const next = toggleTheme(themeBtnRef.current);
    setThemeIcon(next === "dark" ? "☀" : "☾");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="topbar">
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          className="iconbtn mobilemenu"
          id="menuBtn"
          onClick={onOpenMenu}
          aria-label="Open navigation"
        >
          ☰
        </button>
        <div>
          <div className="eyebrow">
            <span
              className="live-pulse"
              style={{
                background: isConnected ? "var(--green)" : "var(--amber)",
              }}
              title={isConnected ? `Live Socket.IO Connected (${activeCount} online)` : "Connecting to Atlas backend..."}
            />{" "}
            <span>{clock}</span>
          </div>
          <h1 id="pageTitle">{title}</h1>
        </div>
      </div>

      <div className="actions">
        <button
          ref={themeBtnRef}
          className="iconbtn"
          id="themeBtn"
          title={themeIcon === "☀" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={handleThemeClick}
        >
          {themeIcon}
        </button>

        <button
          className="iconbtn"
          id="searchBtn"
          title="Search (Ctrl+K)"
          onClick={onOpenSearch}
        >
          ⌕
        </button>

        <button
          className="iconbtn"
          id="notifyBtn"
          title="Notifications"
          onClick={() => setIsNotifyOpen((prev) => !prev)}
        >
          ♧
          {unreadCount > 0 && <span className="badge-dot" />}
        </button>

        <button
          className="selectbtn"
          id="termBtn"
          onClick={() => showToast("Academic year: 2026–2027 · Term 1")}
        >
          2026–27 <span>⌄</span>
        </button>

        {/* Notifications Popover */}
        {isNotifyOpen && (
          <div ref={popoverRef} className="popover open" id="notifyPopover">
            <div className="popover-head">
              <strong>Real-time updates ({unreadCount} new)</strong>
              <button
                className="link-action"
                onClick={() => {
                  markNotificationRead("all");
                  showToast("All marked as read");
                }}
              >
                Mark read
              </button>
            </div>

            <div className="popover-list">
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "18px 0", fontSize: "11px", color: "var(--muted)" }}>
                  No notifications
                </div>
              ) : (
                notifications.map((n) => {
                  const icon = n.type === "exam" ? "▣" : n.type === "marks" ? "↗" : n.type === "approval" ? "✓" : "◷";
                  return (
                    <div
                      key={n._id}
                      className="popover-item"
                      style={{ borderLeft: !n.read ? "2px solid var(--accent)" : "none" }}
                      onClick={() => markNotificationRead(n._id)}
                    >
                      <span className="pico">{icon}</span>
                      <div style={{ flex: 1 }}>
                        <strong>{n.message}</strong>
                        <small>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="popover-foot">
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>Atlas Notification Engine</span>
              <button className="link-action" onClick={() => setIsNotifyOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
