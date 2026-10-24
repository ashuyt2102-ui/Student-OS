"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { SearchModal } from "@/components/SearchModal";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "student") {
        router.push("/unauthorized");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "student") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
          Loading student intelligence workspace...
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
            title="Your learning, at a glance."
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
