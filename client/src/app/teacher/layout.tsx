"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { SearchModal } from "@/components/SearchModal";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "teacher" && user.role !== "principal") {
        router.push("/unauthorized");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== "teacher" && user.role !== "principal")) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
          Verifying faculty credentials...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="shell">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="main">
          <Topbar
            title="Faculty Command Workspace"
            onOpenMenu={() => setIsSidebarOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
          {children}
        </main>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
