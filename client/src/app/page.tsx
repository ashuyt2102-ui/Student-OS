"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === "student") {
        router.push("/student");
      } else if (user.role === "teacher") {
        router.push("/teacher");
      } else if (user.role === "principal") {
        router.push("/principal");
      }
    }
  }, [user, loading, router]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
        <div className="logo" style={{ margin: "0 auto 12px" }}>
          A
        </div>
        Atlas School Intelligence loading...
      </div>
    </div>
  );
}
