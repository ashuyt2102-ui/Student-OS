import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeReveal } from "@/components/ThemeReveal";
import { Toast } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Atlas — School Management Intelligence",
  description: "Enterprise, role-based school management platform for students, teachers, and principals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <AuthProvider>
          <SocketProvider>
            <ThemeReveal />
            {children}
            <Toast />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
