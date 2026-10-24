"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { NotificationRecord } from "@/types";
import { api } from "@/lib/api";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeCount: number;
  notifications: NotificationRecord[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  markNotificationRead: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeCount, setActiveCount] = useState(1);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get<{ success: boolean; notifications: NotificationRecord[] }>(
        "/notifications"
      );
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (e) {}
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (id === "all" || n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    s.on("connect", () => {
      setIsConnected(true);
      if (user) {
        s.emit("register_user", {
          userId: user.id,
          role: user.role,
          name: user.name,
        });
      }
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    s.on("active_users_count", (data: { count: number }) => {
      if (data?.count) setActiveCount(data.count);
    });

    s.on("attendance_updated", (data: any) => {
      showToast(`⚡ Real-time: Attendance updated for ${data.class || "class"}`);
      fetchNotifications();
    });

    s.on("marks_updated", (data: any) => {
      showToast(`⚡ Real-time: New assessment marks posted (${data.subject || "Subject"})`);
      fetchNotifications();
    });

    s.on("exam_added", (data: any) => {
      showToast(`⚡ Real-time: New exam scheduled (${data.exam?.title || "Exam"})`);
      fetchNotifications();
    });

    s.on("syllabus_updated", (data: any) => {
      showToast(`⚡ Real-time: Syllabus progress updated (${data.item?.subject || "Curriculum"})`);
    });

    s.on("notification_new", (notif: NotificationRecord) => {
      setNotifications((prev) => [notif, ...prev]);
      showToast(`🔔 ${notif.message}`);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeCount,
        notifications,
        toastMessage,
        showToast,
        markNotificationRead,
        fetchNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
