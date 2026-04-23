"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName =
  | "escuro" | "claro" | "amoled" | "oceano" | "floresta"
  | "barbie" | "lavigne" | "bamboo" | "neon" | "gold" | "dangerous";

export const THEMES: { id: ThemeName; label: string; bg: string; accent: string }[] = [
  { id: "escuro",    label: "Escuro",     bg: "#0f1117", accent: "#6366f1" },
  { id: "claro",     label: "Claro",      bg: "#f0f2f8", accent: "#6366f1" },
  { id: "amoled",    label: "AMOLED",     bg: "#000000", accent: "#a78bfa" },
  { id: "oceano",    label: "Oceano",     bg: "#0c1929", accent: "#64ffda" },
  { id: "floresta",  label: "Floresta",   bg: "#0d1f0d", accent: "#4ade80" },
  { id: "barbie",    label: "Barbie",     bg: "#fff0f5", accent: "#e91e90" },
  { id: "lavigne",   label: "Lavigne",    bg: "#0a0009", accent: "#ff4081" },
  { id: "bamboo",    label: "Bamboo",     bg: "#f0f7f0", accent: "#2e7d32" },
  { id: "neon",      label: "Neon",       bg: "#000000", accent: "#00ff41" },
  { id: "gold",      label: "Gold",       bg: "#1a1200", accent: "#ffd700" },
  { id: "dangerous", label: "Dangerous",  bg: "#0a0000", accent: "#ff1744" },
];

interface ThemeCtx { theme: ThemeName; setTheme: (t: ThemeName) => void; }

const ThemeContext = createContext<ThemeCtx>({ theme: "escuro", setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("escuro");

  useEffect(() => {
    const saved = localStorage.getItem("financa_theme") as ThemeName | null;
    if (saved && THEMES.some(t => t.id === saved)) setThemeState(saved);
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("financa_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
