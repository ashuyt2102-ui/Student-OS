"use client";

import React from "react";
import { useSocket } from "@/context/SocketContext";

export function Toast() {
  const { toastMessage } = useSocket();

  return (
    <div className={`toast ${toastMessage ? "show" : ""}`} id="toast">
      {toastMessage || "Interaction recorded"}
    </div>
  );
}
