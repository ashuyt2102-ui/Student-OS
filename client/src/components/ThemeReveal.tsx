"use client";

import { useEffect, useRef } from "react";

export function ThemeReveal() {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("atlas-theme") || "light";
      document.documentElement.dataset.theme = saved;
    } catch (e) {}
  }, []);

  return <div className="theme-reveal" id="themeReveal" ref={revealRef} aria-hidden="true" />;
}

export function toggleTheme(btnElement: HTMLElement | null) {
  const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = current === "dark" ? "light" : "dark";
  const reveal = document.getElementById("themeReveal");

  if (reveal && btnElement) {
    const rect = btnElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    reveal.style.left = `${x - 12}px`;
    reveal.style.top = `${y - 12}px`;
    reveal.style.borderColor = nextTheme === "dark" ? "#a59bff" : "#6558e8";
    reveal.classList.remove("animate");
    void reveal.offsetWidth;
    reveal.classList.add("animate");
    reveal.addEventListener(
      "animationend",
      () => reveal.classList.remove("animate"),
      { once: true }
    );
  }

  document.documentElement.dataset.theme = nextTheme;
  try {
    localStorage.setItem("atlas-theme", nextTheme);
  } catch (e) {}
  return nextTheme;
}
