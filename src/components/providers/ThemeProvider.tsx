"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "rose" | "amber" | "emerald" | "orange";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "rose",
  setTheme: () => {},
});

function applyDataAttribute(t: Theme) {
  if (t === "rose") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", t);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer — baca localStorage sekali saat mount, tanpa useEffect
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("firafi-theme") as Theme) ?? "rose";
    }
    return "rose";
  });

  // Sync data-theme attribute + localStorage setiap kali theme berubah
  useEffect(() => {
    applyDataAttribute(theme);
    localStorage.setItem("firafi-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}